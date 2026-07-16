import axios, { type AxiosInstance } from "axios";

import { TMDB_EXTERNAL_ID_CONCURRENCY, MAX_TMBD_PAGES_PER_REQUEST, TMDB_PAGE_SIZE, getGenreIdFromCatalog, isGenreCatalogId } from "../addon/constants";
import type { CatalogId } from "../addon/constants";
import { TtlCache } from "../lib/cache";
import { mapWithConcurrency } from "../lib/concurrency";
import type { Logger } from "../lib/logger";

export interface MetaPreview {
  id: string;
  type: "movie";
  name: string;
  poster?: string;
  description?: string;
  releaseInfo?: string;
  imdbRating?: string;
  genres?: string[];
}

interface TmdbDiscoverMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  primary_release_date?: string;
  vote_average?: number;
  genre_ids?: number[];
}

interface TmdbDiscoverResponse {
  page: number;
  total_pages: number;
  results: TmdbDiscoverMovie[];
}

interface TmdbExternalIdsResponse {
  imdb_id: string | null;
}

export interface DiscoverParams {
  api_key: string;
  include_adult: false;
  page: number;
  sort_by: string;
  with_original_language: "ml";
  "primary_release_date.lte"?: string;
  "primary_release_date.gte"?: string;
  with_release_type?: string;
  region?: string;
  with_genres?: string;
}

export function buildDiscoverParams(catalogId: CatalogId, page: number, today: string, apiKey: string): DiscoverParams {
  const params: DiscoverParams = {
    api_key: apiKey,
    include_adult: false,
    page,
    sort_by: "primary_release_date.desc",
    with_original_language: "ml"
  };

  if (catalogId === "malluflix_ott") {
    params["primary_release_date.lte"] = today;
    params.with_release_type = "4|5";
    params.region = "IN";
    params.sort_by = "release_date.desc";
    return params;
  }

  if (catalogId === "malluflix_future") {
    params["primary_release_date.gte"] = today;
    params.sort_by = "primary_release_date.asc";
    return params;
  }

  if (isGenreCatalogId(catalogId)) {
    const genreId = getGenreIdFromCatalog(catalogId);
    if (genreId) {
      params["primary_release_date.lte"] = today;
      params.with_genres = String(genreId);
      return params;
    }
  }

  params["primary_release_date.lte"] = today;
  return params;
}

export class TmdbService {
  private readonly http: AxiosInstance;

  constructor(
    private readonly apiKey: string,
    private readonly cache: TtlCache<unknown>,
    private readonly logger: Logger,
    httpClient?: AxiosInstance
  ) {
    this.http = httpClient ?? axios.create({
      baseURL: "https://api.themoviedb.org/3",
      timeout: 10000
    });
  }

  async discoverCatalog(catalogId: CatalogId, skip = 0): Promise<MetaPreview[]> {
    const page = Math.floor(skip / TMDB_PAGE_SIZE) + 1;
    const offset = skip % TMDB_PAGE_SIZE;
    const today = new Date().toISOString().slice(0, 10);

    const collected: MetaPreview[] = [];
    let currentPage = page;
    let fetchedPages = 0;
    let totalPages = Infinity;

    while (currentPage <= totalPages && fetchedPages < MAX_TMBD_PAGES_PER_REQUEST && collected.length < offset + TMDB_PAGE_SIZE) {
      const response = await this.fetchDiscoverPage(catalogId, currentPage, today);
      totalPages = response.total_pages;
      const pageMetas = await this.mapDiscoverResults(response.results);
      collected.push(...pageMetas);
      currentPage += 1;
      fetchedPages += 1;
    }

    return collected.slice(offset, offset + TMDB_PAGE_SIZE);
  }

  async resolveImdbId(tmdbId: number): Promise<string | null> {
    const cacheKey = `tmdb:external:${tmdbId}`;

    try {
      const data = await this.cache.getOrSet(cacheKey, async () => {
        const response = await this.http.get<TmdbExternalIdsResponse>(`/movie/${tmdbId}/external_ids`, {
          params: { api_key: this.apiKey }
        });
        return response.data;
      }) as TmdbExternalIdsResponse;

      return data.imdb_id ?? null;
    } catch (error) {
      this.logger.warn("TMDB external IDs lookup failed", {
        tmdbId,
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  private async fetchDiscoverPage(catalogId: CatalogId, page: number, today: string): Promise<TmdbDiscoverResponse> {
    const params = buildDiscoverParams(catalogId, page, today, this.apiKey);
    const cacheKey = `tmdb:discover:${JSON.stringify(params)}`;

    return this.cache.getOrSet(cacheKey, async () => {
      const response = await this.http.get<TmdbDiscoverResponse>("/discover/movie", { params });
      return response.data;
    }) as Promise<TmdbDiscoverResponse>;
  }

  private async mapDiscoverResults(results: TmdbDiscoverMovie[]): Promise<MetaPreview[]> {
    const metas: Array<MetaPreview | null> = await mapWithConcurrency(
      results,
      TMDB_EXTERNAL_ID_CONCURRENCY,
      async (movie) => {
        const imdbId = await this.resolveImdbId(movie.id);
        if (!imdbId) {
          return null;
        }

        return {
          id: imdbId,
          type: "movie" as const,
          name: movie.title,
          poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined,
          description: movie.overview || undefined,
          releaseInfo: movie.primary_release_date || undefined,
          imdbRating: typeof movie.vote_average === "number" ? movie.vote_average.toFixed(1) : undefined
        };
      }
    );

    return metas.filter((meta): meta is MetaPreview => meta !== null);
  }
}
