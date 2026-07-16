## MalluFlix

MalluFlix is a metadata-only Stremio addon for Malayalam movies. It uses TMDB discovery to build Malayalam catalogs and resolves final Stremio metadata through Cinemeta by IMDb ID.

It does not host or stream video content.

## Features

- Movie-only addon
- Malayalam discovery via TMDB
- Cinemeta-backed metadata via IMDb IDs
- Catalogs for new releases, OTT releases, future releases, and genres
- In-process TTL cache for TMDB and Cinemeta responses
- Render-friendly Node service with environment-only configuration

## Runtime

- Node 20 LTS
- Express
- TypeScript

## Configuration

Copy `.env.example` to `.env` for local development and set:

```bash
PORT=7000
TMDB_API_KEY=your_tmdb_api_key
CACHE_TTL_MS=86400000
BASE_URL=https://your-render-service.onrender.com
```

Notes:

- `TMDB_API_KEY` is required at startup.
- `PORT` defaults to `7000`.
- `CACHE_TTL_MS` defaults to `86400000`.
- `BASE_URL` is optional for local development.
- `BASE_URL` is intended to be the public hosted URL for cross-device installs, not a LAN `http://192.168.x.x` address.

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

Local verification:

1. Start the service with a valid `TMDB_API_KEY`.
2. Open `http://127.0.0.1:7000/manifest.json` and confirm the manifest loads.
3. Open `http://127.0.0.1:7000/` and use the localhost install or copy-manifest action.
4. In desktop Stremio on the same machine, add the addon from the local manifest URL.
5. Confirm the movie catalogs load and a movie detail page resolves metadata.

### 2. Cross-device hosted HTTPS install

Use this for Android, TV, web clients, or any device that is not running the addon server locally.

Expected manifest form:

```text
https://your-render-service.onrender.com/manifest.json
```

Render checklist:

- Set `TMDB_API_KEY`
- Set `BASE_URL=https://your-render-service.onrender.com`
- Use `https://your-render-service.onrender.com/manifest.json` in Stremio

If `BASE_URL` is missing or not HTTPS, the landing page will show a hosted-install warning instead of a cross-device install button.

## Important Install Note

Plain HTTP LAN URLs such as `http://192.168.x.x:7000/manifest.json` may open in a browser but can still fail in Stremio with `Unable to fetch`. MalluFlix no longer treats LAN HTTP as a recommended install target.

## API Surface

- `GET /manifest.json`
- `GET /catalog/movie/malluflix_catalog.json`
- `GET /catalog/movie/malluflix_ott.json`
- `GET /catalog/movie/malluflix_future.json`
- `GET /catalog/movie/malluflix_genre_<genre>.json`
- `GET /meta/movie/<imdb_id>.json`

The manifest exposes only `catalog` and `meta` resources. Stream resources are intentionally not provided.

## Render Deployment

Use these settings on Render:

- Build command: `npm install && npm run build`
- Start command: `npm start`
- Required env vars: `TMDB_API_KEY`
- Optional env vars: `PORT`, `CACHE_TTL_MS`, `BASE_URL`

Recommended hosted URL:

```text
https://your-render-service.onrender.com
```

## Troubleshooting

- If startup fails immediately, confirm `.env` is loaded and `TMDB_API_KEY` is present.
- If the server does not start on `7000`, another process may already be using the port.
- If a LAN URL works in a browser but Stremio shows `Unable to fetch`, switch to `127.0.0.1` for same-machine installs or deploy to public HTTPS.
- If manifest assets still point to `127.0.0.1`, check whether `BASE_URL` is set correctly in the hosted environment.

## Development Commands

```bash
npm run dev
npm run build
npm start
npm run typecheck
npm run test
```

## Legal

MalluFlix only aggregates public metadata from TMDB and Cinemeta. It does not provide, store, or distribute media streams. Any streams shown in Stremio come from other addons installed by the user.
