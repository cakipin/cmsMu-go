import { defineMiddleware } from "astro:middleware";
import { env } from "cloudflare:workers";

export const onRequest = defineMiddleware((context, next) => {
  // Inject Cloudflare environment variables into process.env for Keystatic
  if (env) {
    globalThis.process = globalThis.process || {};
    globalThis.process.env = globalThis.process.env || {};
    Object.assign(globalThis.process.env, env);
  }
  return next();
});
