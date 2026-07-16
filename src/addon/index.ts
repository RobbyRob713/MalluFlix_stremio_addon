import { addonBuilder } from "stremio-addon-sdk";

import type { AppConfig } from "../config";
import type { Logger } from "../lib/logger";
import { createCatalogHandler } from "./handlers/catalog";
import { createMetaHandler } from "./handlers/meta";
import { createManifest } from "./manifest";
import { CinemetaService } from "../services/cinemeta";
import { TmdbService } from "../services/tmdb";
import { TtlCache } from "../lib/cache";

export interface AddonServices {
  tmdbService: TmdbService;
  cinemetaService: CinemetaService;
}

export function createAddonServices(config: AppConfig, logger: Logger): AddonServices {
  const cache = new TtlCache<unknown>(config.cacheTtlMs);

  return {
    tmdbService: new TmdbService(config.tmdbApiKey, cache, logger),
    cinemetaService: new CinemetaService(cache, logger)
  };
}

export function createAddonInterface(
  config: AppConfig,
  logger: Logger,
  services: AddonServices = createAddonServices(config, logger)
) {
  const builder = new addonBuilder(createManifest(config.baseUrl));
  builder.defineCatalogHandler(createCatalogHandler(services.tmdbService, logger));
  builder.defineMetaHandler(createMetaHandler(services.cinemetaService, logger));
  return builder.getInterface();
}
