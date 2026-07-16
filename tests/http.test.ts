import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { createApp } from "../src/server";
import type { AppConfig } from "../src/config";
import type { Logger } from "../src/lib/logger";

const config: AppConfig = {
  port: 7000,
  tmdbApiKey: "test-key",
  cacheTtlMs: 1000,
  baseUrl: "http://127.0.0.1:7000"
};

const logger: Logger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
};

const addonInterface = {
  manifest: {
    id: "org.mallu.flix",
    version: "4.0.0",
    name: "MalluFlix",
    description: "Test manifest",
    resources: ["catalog", "meta"],
    types: ["movie"],
    catalogs: [{ type: "movie", id: "malluflix_catalog", name: "Catalog" }],
    idPrefixes: ["tt"]
  },
  get: (resource: string, type: string, id: string) => {
    if (resource === "catalog") {
      return Promise.resolve({
        metas: [{ id: "tt1234567", type, name: "Catalog Movie" }]
      });
    }

    if (resource === "meta") {
      return Promise.resolve({
        meta: { id, type, name: "Meta Movie" }
      });
    }

    return Promise.resolve({});
  }
};

function parseAppConfig(body: string) {
  return JSON.parse(body.replace("window.__MALLUFLIX_CONFIG__=", "").replace(/;$/, ""));
}

describe("HTTP endpoints", () => {
  const app = createApp(config, logger, addonInterface);

  it("serves /manifest.json", async () => {
    const response = await request(app).get("/manifest.json");

    expect(response.status).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBe("*");
    expect(response.body.resources).toEqual(["catalog", "meta"]);
    expect(response.body.logo).toBe("http://127.0.0.1:7000/images/logo.jpg");
  });

  it("serves /catalog/movie/malluflix_catalog.json", async () => {
    const response = await request(app).get("/catalog/movie/malluflix_catalog.json");

    expect(response.status).toBe(200);
    expect(response.body.metas[0].id).toBe("tt1234567");
  });

  it("serves /meta/movie/:id.json", async () => {
    const response = await request(app).get("/meta/movie/tt1234567.json");

    expect(response.status).toBe(200);
    expect(response.body.meta.id).toBe("tt1234567");
  });

  it("serves /app-config.js in hosted HTTPS mode", async () => {
    const response = await request(
      createApp(
        {
          ...config,
          baseUrl: "https://malluflix.example.com"
        },
        logger,
        addonInterface
      )
    ).get("/app-config.js");

    expect(response.status).toBe(200);

    const appConfig = parseAppConfig(response.text);
    expect(appConfig.local.manifestUrl).toBe("http://127.0.0.1:7000/manifest.json");
    expect(appConfig.hosted.manifestUrl).toBe("https://malluflix.example.com/manifest.json");
    expect(appConfig.hosted.isAvailable).toBe(true);
  });

  it("serves /app-config.js in local-only mode when BASE_URL is missing", async () => {
    const response = await request(
      createApp(
        {
          ...config,
          baseUrl: undefined
        },
        logger,
        addonInterface
      )
    ).get("/app-config.js");

    expect(response.status).toBe(200);

    const appConfig = parseAppConfig(response.text);
    expect(appConfig.local.installUrl).toBe("stremio://127.0.0.1:7000/manifest.json");
    expect(appConfig.hosted.isAvailable).toBe(false);
    expect(appConfig.hosted.previewText).toBe("Set BASE_URL=https://<service>.onrender.com");
  });

  it("serves /app-config.js with LAN HTTP warning state", async () => {
    const response = await request(
      createApp(
        {
          ...config,
          baseUrl: "http://192.168.1.23:7000"
        },
        logger,
        addonInterface
      )
    )
      .get("/app-config.js")
      .set("Host", "192.168.1.23:7000");

    expect(response.status).toBe(200);

    const appConfig = parseAppConfig(response.text);
    expect(appConfig.hosted.isAvailable).toBe(false);
    expect(appConfig.hosted.manifestUrl).toBe("http://192.168.1.23:7000/manifest.json");
    expect(appConfig.browserDebug.manifestUrl).toBe("http://192.168.1.23:7000/manifest.json");
  });

  it("uses request origin for manifest assets when BASE_URL is missing", async () => {
    const response = await request(
      createApp(
        {
          ...config,
          baseUrl: undefined
        },
        logger,
        addonInterface
      )
    )
      .get("/manifest.json")
      .set("Host", "localhost:7000");

    expect(response.status).toBe(200);
    expect(response.body.logo).toBe("http://localhost:7000/images/logo.jpg");
    expect(response.body.background).toBe("http://localhost:7000/images/logo.jpg");
  });

  it("uses configured BASE_URL for manifest assets when present", async () => {
    const response = await request(
      createApp(
        {
          ...config,
          baseUrl: "https://malluflix.example.com"
        },
        logger,
        addonInterface
      )
    ).get("/manifest.json");

    expect(response.status).toBe(200);
    expect(response.body.logo).toBe("https://malluflix.example.com/images/logo.jpg");
    expect(response.body.background).toBe("https://malluflix.example.com/images/logo.jpg");
  });

  it("renders landing page sections for localhost and hosted installs", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.text).toContain("LOCALHOST INSTALL");
    expect(response.text).toContain("HOSTED HTTPS INSTALL");
    expect(response.text).toContain("BROWSER / DEBUG URL");
  });
});
