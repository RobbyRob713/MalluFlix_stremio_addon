import { describe, expect, it } from "vitest";

import { TtlCache } from "../src/lib/cache";

describe("TtlCache", () => {
  it("returns a hit within TTL", () => {
    let now = 1000;
    const cache = new TtlCache<string>(100, () => now);

    cache.set("key", "value");
    now = 1099;

    expect(cache.get("key")).toBe("value");
  });

  it("returns a miss after expiry", () => {
    let now = 1000;
    const cache = new TtlCache<string>(100, () => now);

    cache.set("key", "value");
    now = 1101;

    expect(cache.get("key")).toBeUndefined();
  });
});
