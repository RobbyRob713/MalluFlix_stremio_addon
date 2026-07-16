import type { CatalogId } from "../constants";
import { isCatalogId } from "../constants";
import type { Logger } from "../../lib/logger";
import type { TmdbService } from "../../services/tmdb";

interface CatalogArgs {
  type: string;
  id: string;
  extra?: {
    skip?: string;
  };
}

export function createCatalogHandler(tmdbService: TmdbService, logger: Logger) {
  return async ({ type, id, extra }: CatalogArgs) => {
    if (type !== "movie" || !isCatalogId(id)) {
      return { metas: [] };
    }

    const skip = Number.parseInt(extra?.skip ?? "0", 10);
    const normalizedSkip = Number.isFinite(skip) && skip >= 0 ? skip : 0;

    try {
      const metas = await tmdbService.discoverCatalog(id as CatalogId, normalizedSkip);
      return { metas };
    } catch (error) {
      logger.error("Catalog lookup failed", {
        catalogId: id,
        skip: normalizedSkip,
        error: error instanceof Error ? error.message : String(error)
      });
      return { metas: [] };
    }
  };
}
