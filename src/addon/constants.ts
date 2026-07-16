export const TMDB_PAGE_SIZE = 20;
export const MAX_TMBD_PAGES_PER_REQUEST = 3;
export const TMDB_EXTERNAL_ID_CONCURRENCY = 5;

export const GENRE_MAP = {
  Action: 28,
  Adventure: 12,
  Comedy: 35,
  Crime: 80,
  Documentary: 99,
  Drama: 18,
  Family: 10751,
  Fantasy: 14,
  History: 36,
  Horror: 27,
  Music: 10402,
  Mystery: 9648,
  Romance: 10749,
  "Science Fiction": 878,
  Thriller: 53
} as const;

export type GenreName = keyof typeof GENRE_MAP;

export const BASE_CATALOG_IDS = [
  "malluflix_catalog",
  "malluflix_ott",
  "malluflix_future"
] as const;

export type BaseCatalogId = (typeof BASE_CATALOG_IDS)[number];
export type GenreCatalogId = `malluflix_genre_${string}`;
export type CatalogId = BaseCatalogId | GenreCatalogId;

export function slugifyGenre(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "_");
}

export function isGenreCatalogId(id: string): id is GenreCatalogId {
  return id.startsWith("malluflix_genre_");
}

export function isCatalogId(id: string): id is CatalogId {
  return BASE_CATALOG_IDS.includes(id as BaseCatalogId) || isGenreCatalogId(id);
}

export function getGenreIdFromCatalog(id: GenreCatalogId): number | undefined {
  const slug = id.replace("malluflix_genre_", "");
  return Object.entries(GENRE_MAP).find(([name]) => slugifyGenre(name) === slug)?.[1];
}
