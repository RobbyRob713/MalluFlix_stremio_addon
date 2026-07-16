import { describe, expect, it, vi } from "vitest";

import { buildDiscoverParams, TmdbService } from "../src/services/tmdb";
import type { AddonConfig } from "../src/config";
import { TtlCache } from "../src/lib/cache";
import type { Logger } from "../src/lib/logger";

const logger: Logger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
};

const addonConfig: AddonConfig = {
  key: "malluflix",
  id: "org.mallu.flix",
  name: "MalluFlix",
  description: "Metadata-only Malayalam movie catalogs powered by TMDB and Cinemeta.",
  contentLanguage: "ml",
  contentLabel: "Malayalam"
};

describe("buildDiscoverParams", () => {
  it("builds default catalog params", () => {
    expect(buildDiscoverParams({ kind: "catalog" }, 2, "2026-07-16", "key", addonConfig)).toMatchObject({
      api_key: "key",
      page: 2,
      sort_by: "primary_release_date.desc",
      with_original_language: "ml",
      "primary_release_date.lte": "2026-07-16"
    });
  });

  it("builds OTT catalog params", () => {
    expect(buildDiscoverParams({ kind: "ott" }, 1, "2026-07-16", "key", addonConfig)).toMatchObject({
      with_release_type: "4|5",
      region: "IN",
      sort_by: "release_date.desc",
      "primary_release_date.lte": "2026-07-16"
    });
  });

  it("builds future catalog params", () => {
    expect(buildDiscoverParams({ kind: "future" }, 1, "2026-07-16", "key", addonConfig)).toMatchObject({
      sort_by: "primary_release_date.asc",
      "primary_release_date.gte": "2026-07-16"
    });
  });

  it("builds genre catalog params", () => {
    expect(
      buildDiscoverParams({ kind: "genre", genreId: 53 }, 1, "2026-07-16", "key", addonConfig)
    ).toMatchObject({
      with_genres: "53",
      "primary_release_date.lte": "2026-07-16"
    });
  });

  it("uses the preset language code", () => {
    expect(
      buildDiscoverParams(
        { kind: "catalog" },
        1,
        "2026-07-16",
        "key",
        { ...addonConfig, contentLanguage: "ta", contentLabel: "Tamil", key: "tamilflix", id: "org.tamil.flix", name: "TamilFlix", description: "Metadata-only Tamil movie catalogs powered by TMDB and Cinemeta." }
      )
    ).toMatchObject({
      with_original_language: "ta"
    });
  });
});

describe("TmdbService.resolveImdbId", () => {
  it("returns null when upstream metadata is missing", async () => {
    const httpClient = {
      get: vi.fn().mockResolvedValue({ data: { imdb_id: null } })
    };

    const service = new TmdbService("key", addonConfig, new TtlCache<unknown>(1000), logger, httpClient as any);

    await expect(service.resolveImdbId(123)).resolves.toBeNull();
  });
});
