/// <reference types="astro/client" />

type D1Database = import('@cloudflare/workers-types').D1Database;
type R2Bucket = import('@cloudflare/workers-types').R2Bucket;
type KVNamespace = import('@cloudflare/workers-types').KVNamespace;

type Runtime = import('@astrojs/cloudflare').Runtime<{
  DB: D1Database;
  BUCKET: R2Bucket;
  SESSION: KVNamespace;
  API_URL?: string;
}>;

declare namespace App {
  interface Locals extends Runtime {}
}

declare module "cloudflare:workers" {
  export const env: Record<string, any>;
}
