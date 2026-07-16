export interface InstallTarget {
  manifestUrl: string | null;
  installUrl: string | null;
  actionLabel: string;
  copyLabel: string;
  note: string;
  previewText: string;
  isAvailable: boolean;
}

export interface BrowserDebugTarget {
  manifestUrl: string;
  note: string;
}

export interface LandingPageConfig {
  local: InstallTarget;
  hosted: InstallTarget;
  browserDebug: BrowserDebugTarget | null;
}

const LOCALHOST_HOST = "127.0.0.1";

function trimTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, "");
}

function buildManifestUrl(baseUrl: string): string {
  return `${trimTrailingSlashes(baseUrl)}/manifest.json`;
}

function buildStremioUrl(manifestUrl: string): string {
  return `stremio://${manifestUrl.replace(/^https?:\/\//, "")}`;
}

function parseHostname(url: string): string {
  return new URL(url).hostname;
}

function isIpv4(hostname: string): boolean {
  return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname);
}

function isLoopbackHostname(hostname: string): boolean {
  return hostname === "localhost" || hostname === "::1" || hostname === "127.0.0.1";
}

function isPrivateIpv4(hostname: string): boolean {
  if (!isIpv4(hostname)) {
    return false;
  }

  const [first, second] = hostname.split(".").map((segment) => Number.parseInt(segment, 10));

  return (
    first === 10 ||
    first === 127 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

export function isPrivateHostname(hostname: string): boolean {
  return isLoopbackHostname(hostname) || isPrivateIpv4(hostname);
}

export function isSupportedHostedBaseUrl(baseUrl: string | undefined): boolean {
  return Boolean(baseUrl && new URL(baseUrl).protocol === "https:");
}

export function shouldShowBrowserDebugTarget(requestOrigin: string): boolean {
  const url = new URL(requestOrigin);
  return url.protocol === "http:" && isPrivateHostname(url.hostname) && !isLoopbackHostname(url.hostname);
}

export function buildLandingPageConfig(
  port: number,
  requestOrigin: string,
  baseUrl?: string
): LandingPageConfig {
  const localManifestUrl = buildManifestUrl(`http://${LOCALHOST_HOST}:${port}`);
  const hostedManifestUrl = baseUrl ? buildManifestUrl(baseUrl) : null;
  const hostedAvailable = isSupportedHostedBaseUrl(baseUrl);
  const browserManifestUrl = buildManifestUrl(requestOrigin);

  let hostedNote =
    "Set BASE_URL to a public https:// URL for Android, TV, web, and other devices.";
  let hostedPreviewText = "Set BASE_URL=https://<service>.onrender.com";

  if (hostedAvailable && hostedManifestUrl) {
    hostedNote = "Use this on devices that are not running the addon server locally.";
    hostedPreviewText = hostedManifestUrl;
  } else if (hostedManifestUrl) {
    hostedNote =
      "Plain HTTP or LAN BASE_URL values can open in a browser but still fail in Stremio clients.";
    hostedPreviewText = hostedManifestUrl;
  }

  return {
    local: {
      manifestUrl: localManifestUrl,
      installUrl: buildStremioUrl(localManifestUrl),
      actionLabel: "Open Stremio on This Machine",
      copyLabel: "Copy Localhost Manifest",
      note: "Use localhost when Stremio and this addon server are running on the same Mac or PC.",
      previewText: localManifestUrl,
      isAvailable: true
    },
    hosted: {
      manifestUrl: hostedManifestUrl,
      installUrl: hostedAvailable && hostedManifestUrl ? buildStremioUrl(hostedManifestUrl) : null,
      actionLabel: hostedAvailable ? "Open Hosted Install" : "Hosted HTTPS Required",
      copyLabel: "Copy Hosted Manifest",
      note: hostedNote,
      previewText: hostedPreviewText,
      isAvailable: hostedAvailable
    },
    browserDebug: shouldShowBrowserDebugTarget(requestOrigin)
      ? {
          manifestUrl: browserManifestUrl,
          note: "This request came from a LAN HTTP address. It is useful for browser checks, not recommended for Stremio installs."
        }
      : null
  };
}

export function resolveRequestOrigin(protocol: string, host: string): string {
  return `${protocol}://${host}`;
}

export function resolveManifestAssetBase(requestOrigin: string, baseUrl?: string): string {
  return trimTrailingSlashes(baseUrl ?? requestOrigin);
}
