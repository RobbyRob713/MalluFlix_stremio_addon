import type { Manifest } from "stremio-addon-sdk";

import { GENRE_MAP, slugifyGenre } from "./constants";

export function createManifest(baseUrl?: string): Manifest {
  const logo = baseUrl
    ? `${baseUrl}/images/logo.jpg`
    : "https://forzayt.github.io/MalluFlix_stremio_addon/images/logo.jpg";

  return {
    id: "org.mallu.flix",
    version: "4.0.0",
    name: "MalluFlix",
    description: "Metadata-only Malayalam movie catalogs powered by TMDB and Cinemeta.",
    logo,
    background: logo,
    resources: ["catalog", "meta"],
    types: ["movie"],
    catalogs: [
      {
        type: "movie",
        id: "malluflix_catalog",
        name: "MalluFlix New Releases",
        extra: [{ name: "skip" }]
      },
      {
        type: "movie",
        id: "malluflix_ott",
        name: "MalluFlix OTT Released",
        extra: [{ name: "skip" }]
      },
      {
        type: "movie",
        id: "malluflix_future",
        name: "MalluFlix Future Releases",
        extra: [{ name: "skip" }]
      },
      ...Object.keys(GENRE_MAP).map((name) => ({
        type: "movie",
        id: `malluflix_genre_${slugifyGenre(name)}`,
        name: `MalluFlix ${name}`,
        extra: [{ name: "skip" }]
      }))
    ],
    idPrefixes: ["tt"]
  };
}
