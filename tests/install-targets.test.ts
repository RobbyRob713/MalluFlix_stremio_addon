import { describe, expect, it } from "vitest";

import { buildLandingPageConfig } from "../src/install-targets";

describe("buildLandingPageConfig", () => {
  it("falls back to localhost install URLs when BASE_URL is missing", () => {
    const config = buildLandingPageConfig(7000, "http://127.0.0.1:7000");

    expect(config.local.manifestUrl).toBe("http://127.0.0.1:7000/manifest.json");
    expect(config.local.installUrl).toBe("stremio://127.0.0.1:7000/manifest.json");
    expect(config.hosted.isAvailable).toBe(false);
    expect(config.hosted.previewText).toBe("Set BASE_URL=https://<service>.onrender.com");
  });

  it("enables hosted install URLs when BASE_URL is HTTPS", () => {
    const config = buildLandingPageConfig(
      7000,
      "https://malluflix.example.com",
      "https://malluflix.example.com"
    );

    expect(config.hosted.isAvailable).toBe(true);
    expect(config.hosted.manifestUrl).toBe("https://malluflix.example.com/manifest.json");
    expect(config.hosted.installUrl).toBe("stremio://malluflix.example.com/manifest.json");
  });

  it("keeps HTTP private-IP BASE_URL in warning mode instead of recommending it", () => {
    const config = buildLandingPageConfig(
      7000,
      "http://192.168.1.23:7000",
      "http://192.168.1.23:7000"
    );

    expect(config.hosted.isAvailable).toBe(false);
    expect(config.hosted.manifestUrl).toBe("http://192.168.1.23:7000/manifest.json");
    expect(config.hosted.installUrl).toBeNull();
    expect(config.browserDebug?.manifestUrl).toBe("http://192.168.1.23:7000/manifest.json");
  });
});
