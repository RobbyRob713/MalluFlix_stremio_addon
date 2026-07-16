export interface AppConfig {
  port: number;
  tmdbApiKey: string;
  cacheTtlMs: number;
  baseUrl?: string;
}

const DEFAULT_PORT = 7000;
const DEFAULT_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function parsePositiveInteger(value: string | undefined, fallback: number, name: string): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }

  return parsed;
}

function normalizeBaseUrl(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim().replace(/\/+$/, "");
  if (!trimmed) {
    return undefined;
  }

  const url = new URL(trimmed);
  return url.toString().replace(/\/+$/, "");
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const tmdbApiKey = env.TMDB_API_KEY?.trim();
  if (!tmdbApiKey) {
    throw new Error("TMDB_API_KEY is required");
  }

  return {
    port: parsePositiveInteger(env.PORT, DEFAULT_PORT, "PORT"),
    tmdbApiKey,
    cacheTtlMs: parsePositiveInteger(env.CACHE_TTL_MS, DEFAULT_CACHE_TTL_MS, "CACHE_TTL_MS"),
    baseUrl: normalizeBaseUrl(env.BASE_URL)
  };
}
