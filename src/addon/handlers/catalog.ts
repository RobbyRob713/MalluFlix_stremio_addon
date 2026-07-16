import { parseCatalogId } from "../constants";
import type { AddonConfig } from "../../config";
import type { Logger } from "../../lib/logger";
import type { TmdbService } from "../../services/tmdb";

interface CatalogArgs {
  type: string;
  id: string;
  extra?: {
    skip?: string;
  };
}

export function createCatalogHandler(
  tmdbService: TmdbService,
  logger: Logger,
  addonConfig: AddonConfig
) {
  return async ({ type, id, extra }: CatalogArgs) => {
    const parsedCatalog = parseCatalogId(id, addonConfig.key);

    if (type !== "movie" || !parsedCatalog) {
      return { metas: [] };
    }

    const skip = Number.parseInt(extra?.skip ?? "0", 10);
    const normalizedSkip = Number.isFinite(skip) && skip >= 0 ? skip : 0;

    try {
      const metas = await tmdbService.discoverCatalog(parsedCatalog, normalizedSkip);
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
