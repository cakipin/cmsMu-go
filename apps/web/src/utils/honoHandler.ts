export const prerender = false;
import type { APIRoute } from "astro";
import app from "@cmsmu/cms-api";
import { env } from "cloudflare:workers";

export const ALL: APIRoute = ({ request }) => {
  return app.fetch(request, env || process.env);
};
