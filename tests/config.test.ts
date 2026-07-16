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
      baseUrl: undefined
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
});
