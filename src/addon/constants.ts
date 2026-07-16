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
export type CatalogKind = "catalog" | "ott" | "future" | "genre";

export interface ParsedCatalogId {
  kind: CatalogKind;
  genreId?: number;
}

export function slugifyGenre(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "_");
}

export function buildCatalogId(addonKey: string, kind: Exclude<CatalogKind, "genre">): string {
  return `${addonKey}_${kind}`;
}

export function buildGenreCatalogId(addonKey: string, genreName: string): string {
  return `${addonKey}_genre_${slugifyGenre(genreName)}`;
}

export function parseCatalogId(id: string, addonKey: string): ParsedCatalogId | null {
  if (id === buildCatalogId(addonKey, "catalog")) {
    return { kind: "catalog" };
  }

  if (id === buildCatalogId(addonKey, "ott")) {
    return { kind: "ott" };
  }

  if (id === buildCatalogId(addonKey, "future")) {
    return { kind: "future" };
  }

  const genrePrefix = `${addonKey}_genre_`;
  if (!id.startsWith(genrePrefix)) {
    return null;
  }

  const slug = id.slice(genrePrefix.length);
  const genreId = Object.entries(GENRE_MAP).find(([name]) => slugifyGenre(name) === slug)?.[1];

  if (!genreId) {
    return null;
  }

  return { kind: "genre", genreId };
}
