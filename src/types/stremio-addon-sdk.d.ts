declare module "stremio-addon-sdk" {
  import type { Router } from "express";

  export interface ManifestCatalog {
    type: string;
    id: string;
    name: string;
    extra?: Array<{ name: string }>;
  }

  export interface Manifest {
    id: string;
    version: string;
    name: string;
    description: string;
    logo?: string;
    background?: string;
    resources: string[];
    types: string[];
    catalogs: ManifestCatalog[];
    idPrefixes?: string[];
  }

  export class addonBuilder {
    constructor(manifest: Manifest);
    defineCatalogHandler(handler: (args: any) => Promise<any> | any): void;
    defineMetaHandler(handler: (args: any) => Promise<any> | any): void;
    getInterface(): {
      manifest: Manifest;
      get: (
        resource: string,
        type: string,
        id: string,
        extra?: Record<string, string>,
        config?: unknown
      ) => Promise<unknown>;
    };
  }

  export function getRouter(addonInterface: unknown): Router;
}
