import type { Manifest } from "stremio-addon-sdk";

import type { AppConfig } from "../config";
import { GENRE_MAP, buildCatalogId, buildGenreCatalogId } from "./constants";

export function createManifest(config: AppConfig): Manifest {
  const { addon, baseUrl } = config;
  const logo = baseUrl
    ? `${baseUrl}/images/logo.jpg`
    : "https://forzayt.github.io/MalluFlix_stremio_addon/images/logo.jpg";

  return {
    id: addon.id,
    version: "4.0.0",
    name: addon.name,
    description: addon.description,
    logo,
    background: logo,
    resources: ["catalog", "meta"],
    types: ["movie"],
    catalogs: [
      {
        type: "movie",
        id: buildCatalogId(addon.key, "catalog"),
        name: `${addon.name} New Releases`,
        extra: [{ name: "skip" }]
      },
      {
        type: "movie",
        id: buildCatalogId(addon.key, "ott"),
        name: `${addon.name} OTT Released`,
        extra: [{ name: "skip" }]
      },
      {
        type: "movie",
        id: buildCatalogId(addon.key, "future"),
        name: `${addon.name} Future Releases`,
        extra: [{ name: "skip" }]
      },
      ...Object.keys(GENRE_MAP).map((name) => ({
        type: "movie",
        id: buildGenreCatalogId(addon.key, name),
        name: `${addon.name} ${name}`,
        extra: [{ name: "skip" }]
      }))
    ],
    idPrefixes: ["tt"]
  };
}
