export const prerender = false;
import type { APIRoute } from "astro";
import app from "../cms/index";
import { env } from "cloudflare:workers";

export const ALL: APIRoute = ({ request }) => {
  return app.fetch(request, env || process.env);
};
