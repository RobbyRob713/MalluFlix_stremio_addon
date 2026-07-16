import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import path from "node:path";
import { getRouter } from "stremio-addon-sdk";

import { createAddonInterface } from "./addon";
import type { AppConfig } from "./config";
import { loadConfig } from "./config";
import {
  buildLandingPageConfig,
  resolveManifestAssetBase,
  resolveRequestOrigin
} from "./install-targets";
import { createLogger, type Logger } from "./lib/logger";
import { createManifest } from "./addon/manifest";

interface AddonInterface {
  manifest: unknown;
  get: (
    resource: string,
    type: string,
    id: string,
    extra?: Record<string, string>,
    config?: unknown
  ) => Promise<unknown>;
}

function requestLogger(logger: Logger) {
  return (req: Request, res: Response, next: NextFunction) => {
    const startedAt = Date.now();

    res.on("finish", () => {
      logger.info("HTTP request", {
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Date.now() - startedAt
      });
    });

    next();
  };
}

export function createApp(
  config: AppConfig,
  logger: Logger = createLogger(),
  addonInterface: AddonInterface = createAddonInterface(config, logger)
) {
  const app = express();
  const publicDir = path.resolve(__dirname, "../public");
  const imagesDir = path.resolve(__dirname, "../images");

  app.disable("x-powered-by");
  app.set("trust proxy", true);
  app.use(requestLogger(logger));
  app.use((_, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  });
  app.use("/images", express.static(imagesDir));
  app.use(express.static(publicDir));

  app.get("/app-config.js", (req, res) => {
    const requestOrigin = resolveRequestOrigin(req.protocol, req.get("host") ?? `127.0.0.1:${config.port}`);
    const appConfig = buildLandingPageConfig(config.port, requestOrigin, config.baseUrl);
    appConfig.addon = {
      name: config.addon.name,
      contentLabel: config.addon.contentLabel,
      description: config.addon.description
    };
    res.type("application/javascript");
    res.send(`window.__MALLUFLIX_CONFIG__=${JSON.stringify(appConfig)};`);
  });

  app.get("/", (_req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });

  app.get("/manifest.json", (req, res) => {
    const requestOrigin = resolveRequestOrigin(req.protocol, req.get("host") ?? `127.0.0.1:${config.port}`);
    res.json(createManifest({ ...config, baseUrl: resolveManifestAssetBase(requestOrigin, config.baseUrl) }));
  });

  app.use("/", getRouter(addonInterface));

  app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error("Unhandled server error", { error: error.message });
    res.status(500).json({ error: "Internal Server Error" });
  });

  return app;
}

if (require.main === module) {
  const config = loadConfig();
  const logger = createLogger();
  const app = createApp(config, logger);

  app.listen(config.port, () => {
    const localUrl = config.baseUrl ?? `http://127.0.0.1:${config.port}`;
    logger.info(`${config.addon.name} server started`, {
      port: config.port,
      manifestUrl: `${localUrl}/manifest.json`
    });
  });
}
