import type { Logger } from "../../lib/logger";
import type { CinemetaService } from "../../services/cinemeta";

interface MetaArgs {
  type: string;
  id: string;
}

export function createMetaHandler(cinemetaService: CinemetaService, logger: Logger) {
  return async ({ type, id }: MetaArgs) => {
    if (type !== "movie" || !id.startsWith("tt")) {
      return { meta: null };
    }

    try {
      const meta = await cinemetaService.getMovieMeta(id);
      return { meta };
    } catch (error) {
      logger.error("Meta lookup failed", {
        imdbId: id,
        error: error instanceof Error ? error.message : String(error)
      });
      return { meta: null };
    }
  };
}
