## MovieFlix Addons

This codebase can power three separate metadata-only Stremio addons:

- `MalluFlix` for Malayalam movies
- `TamilFlix` for Tamil movies
- `HindiFlix` for Hindi movies

Each deployment uses TMDB discovery for one language and resolves final Stremio metadata through Cinemeta by IMDb ID.

It does not host or stream video content.

## Features

- Movie-only addon
- Preset-based language targeting for Malayalam, Tamil, and Hindi
- Cinemeta-backed metadata via IMDb IDs
- Catalogs for new releases, OTT releases, future releases, and genres
- In-process TTL cache for TMDB and Cinemeta responses
- Render-friendly Node service with environment-only configuration

## Runtime

- Node 20 LTS
- Express
- TypeScript

## Configuration

Set these environment variables:

```bash
PORT=7000
TMDB_API_KEY=your_tmdb_api_key
CACHE_TTL_MS=86400000
BASE_URL=https://your-render-service.onrender.com
ADDON_PRESET=mallu
```

Supported `ADDON_PRESET` values:

- `mallu`
- `tamil`
- `hindi`

Optional overrides are also supported:

```bash
ADDON_KEY=malluflix
ADDON_ID=org.mallu.flix
ADDON_NAME=MalluFlix
ADDON_DESCRIPTION=Metadata-only Malayalam movie catalogs powered by TMDB and Cinemeta.
CONTENT_LANGUAGE=ml
CONTENT_LABEL=Malayalam
```

Notes:

- `TMDB_API_KEY` is required at startup.
- `PORT` defaults to `7000`.
- `CACHE_TTL_MS` defaults to `86400000`.
- `BASE_URL` is optional for local development.
- `BASE_URL` should be the public hosted URL for cross-device installs, not a LAN `http://192.168.x.x` address.
- In most cases, `ADDON_PRESET` is enough and the override variables are not needed.

## Local Setup

```bash
npm install
npm run dev
```

For a production-style run:

```bash
npm run build
npm start
```

## Install Paths

There are two supported install flows.

### 1. Same-machine local install

Use this when Stremio and the addon server are running on the same Mac or PC.

```text
http://127.0.0.1:7000/manifest.json
```

The landing page also exposes:

```text
stremio://127.0.0.1:7000/manifest.json
```

### 2. Cross-device hosted HTTPS install

Use this for Android, TV, web clients, or any device that is not running the addon server locally.

Expected manifest form:

```text
https://your-render-service.onrender.com/manifest.json
```

If `BASE_URL` is missing or not HTTPS, the landing page will show a hosted-install warning instead of a cross-device install button.

## Render Deployment

Create one Render service per addon. All three can point to this same repo.

Shared settings:

- Build command: `npm install && npm run build`
- Start command: `npm start`
- Required env vars: `TMDB_API_KEY`
- Optional env vars: `PORT`, `CACHE_TTL_MS`

### Malayalam

```bash
ADDON_PRESET=mallu
BASE_URL=https://malluflix-stremio-addon.onrender.com
```

Manifest:

```text
https://malluflix-stremio-addon.onrender.com/manifest.json
```

### Tamil

```bash
ADDON_PRESET=tamil
BASE_URL=https://tamilflix-stremio-addon.onrender.com
```

Manifest:

```text
https://tamilflix-stremio-addon.onrender.com/manifest.json
```

### Hindi

```bash
ADDON_PRESET=hindi
BASE_URL=https://hindiflix-stremio-addon.onrender.com
```

Manifest:

```text
https://hindiflix-stremio-addon.onrender.com/manifest.json
```

Each deployment gets its own:

- manifest `id`
- addon `name`
- catalog ID namespace
- TMDB `with_original_language` filter

## API Surface

The catalog prefix changes by preset:

- `malluflix_*`
- `tamilflix_*`
- `hindiflix_*`

Examples:

- `GET /manifest.json`
- `GET /catalog/movie/<addon>_catalog.json`
- `GET /catalog/movie/<addon>_ott.json`
- `GET /catalog/movie/<addon>_future.json`
- `GET /catalog/movie/<addon>_genre_<genre>.json`
- `GET /meta/movie/<imdb_id>.json`

The manifest exposes only `catalog` and `meta` resources. Stream resources are intentionally not provided.

## Important Install Note

Plain HTTP LAN URLs such as `http://192.168.x.x:7000/manifest.json` may open in a browser but can still fail in Stremio with `Unable to fetch`. Use `127.0.0.1` for same-machine installs or deploy to public HTTPS.

## Troubleshooting

- If startup fails immediately, confirm `TMDB_API_KEY` is present.
- If Stremio still shows `Unable to fetch`, redeploy and re-add the addon after removing the old installed entry.
- If manifest assets still point to localhost, check whether `BASE_URL` is set correctly in the hosted environment.

## Development Commands

```bash
npm run dev
npm run build
npm start
npm run typecheck
npm run test
```

## Legal

These addons only aggregate public metadata from TMDB and Cinemeta. They do not provide, store, or distribute media streams. Any streams shown in Stremio come from other addons installed by the user.
