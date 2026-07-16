import axios, { type AxiosInstance } from "axios";

import { TtlCache } from "../lib/cache";
import type { Logger } from "../lib/logger";

export interface CinemetaMeta {
  id: string;
  type: "movie";
  name: string;
  [key: string]: unknown;
}

interface CinemetaResponse {
  meta?: CinemetaMeta | null;
}

export class CinemetaService {
  private readonly http: AxiosInstance;

  constructor(
    private readonly cache: TtlCache<unknown>,
    private readonly logger: Logger,
    httpClient?: AxiosInstance
  ) {
    this.http = httpClient ?? axios.create({
      baseURL: "https://v3-cinemeta.strem.io",
      timeout: 10000
    });
  }

  async getMovieMeta(imdbId: string): Promise<CinemetaMeta | null> {
    const cacheKey = `cinemeta:${imdbId}`;

    try {
      const data = await this.cache.getOrSet(cacheKey, async () => {
        const response = await this.http.get<CinemetaResponse>(`/meta/movie/${imdbId}.json`);
        return response.data;
      }) as CinemetaResponse;

      return data.meta ?? null;
    } catch (error) {
      this.logger.warn("Cinemeta lookup failed", {
        imdbId,
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }
}
