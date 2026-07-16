export interface AppConfig {
  port: number;
  tmdbApiKey: string;
  cacheTtlMs: number;
  baseUrl?: string;
  addon: AddonConfig;
}

export interface AddonConfig {
  key: string;
  id: string;
  name: string;
  description: string;
  contentLanguage: string;
  contentLabel: string;
}

const ADDON_PRESETS = {
  mallu: {
    key: "malluflix",
    id: "org.mallu.flix",
    name: "MalluFlix",
    description: "Metadata-only Malayalam movie catalogs powered by TMDB and Cinemeta.",
    contentLanguage: "ml",
    contentLabel: "Malayalam"
  },
  tamil: {
    key: "tamilflix",
    id: "org.tamil.flix",
    name: "TamilFlix",
    description: "Metadata-only Tamil movie catalogs powered by TMDB and Cinemeta.",
    contentLanguage: "ta",
    contentLabel: "Tamil"
  },
  hindi: {
    key: "hindiflix",
    id: "org.hindi.flix",
    name: "HindiFlix",
    description: "Metadata-only Hindi movie catalogs powered by TMDB and Cinemeta.",
    contentLanguage: "hi",
    contentLabel: "Hindi"
  }
} as const;

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

function normalizeRequiredString(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

function resolveAddonConfig(env: NodeJS.ProcessEnv): AddonConfig {
  const presetName = env.ADDON_PRESET?.trim().toLowerCase() || "mallu";
  const preset = ADDON_PRESETS[presetName as keyof typeof ADDON_PRESETS];

  if (!preset) {
    throw new Error(`ADDON_PRESET must be one of: ${Object.keys(ADDON_PRESETS).join(", ")}`);
  }

  return {
    key: normalizeRequiredString(env.ADDON_KEY, preset.key),
    id: normalizeRequiredString(env.ADDON_ID, preset.id),
    name: normalizeRequiredString(env.ADDON_NAME, preset.name),
    description: normalizeRequiredString(env.ADDON_DESCRIPTION, preset.description),
    contentLanguage: normalizeRequiredString(env.CONTENT_LANGUAGE, preset.contentLanguage),
    contentLabel: normalizeRequiredString(env.CONTENT_LABEL, preset.contentLabel)
  };
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
    baseUrl: normalizeBaseUrl(env.BASE_URL),
    addon: resolveAddonConfig(env)
  };
}
