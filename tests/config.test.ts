import { describe, expect, it } from "vitest";

import { loadConfig } from "../src/config";

describe("loadConfig", () => {
  it("fails when TMDB_API_KEY is missing", () => {
    expect(() => loadConfig({})).toThrow("TMDB_API_KEY is required");
  });

  it("applies defaults for optional values", () => {
    expect(loadConfig({ TMDB_API_KEY: "abc123" })).toEqual({
      port: 7000,
      tmdbApiKey: "abc123",
      cacheTtlMs: 86400000,
      baseUrl: undefined,
      addon: {
        key: "malluflix",
        id: "org.mallu.flix",
        name: "MalluFlix",
        description: "Metadata-only Malayalam movie catalogs powered by TMDB and Cinemeta.",
        contentLanguage: "ml",
        contentLabel: "Malayalam"
      }
    });
  });

  it("normalizes BASE_URL by trimming whitespace and trailing slashes", () => {
    expect(
      loadConfig({
        TMDB_API_KEY: "abc123",
        BASE_URL: " https://malluflix.example.com/ "
      }).baseUrl
    ).toBe("https://malluflix.example.com");
  });

  it("supports the tamil preset", () => {
    expect(
      loadConfig({
        TMDB_API_KEY: "abc123",
        ADDON_PRESET: "tamil"
      }).addon
    ).toEqual({
      key: "tamilflix",
      id: "org.tamil.flix",
      name: "TamilFlix",
      description: "Metadata-only Tamil movie catalogs powered by TMDB and Cinemeta.",
      contentLanguage: "ta",
      contentLabel: "Tamil"
    });
  });
});
