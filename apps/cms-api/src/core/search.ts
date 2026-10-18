import { getDb, posts } from "@cmsmu/db";
import { like, or } from "drizzle-orm";

export async function handleTematikSearch(
  request: Request,
  env: any,
  theme: any,
  context: any
) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");

  if (!q || q.length < 3) return null;

  const db = getDb(env.DB);
  const results = await db
    .select()
    .from(posts)
    .where(or(like(posts.title, `%${q}%`), like(posts.body, `%${q}%`)))
    .limit(50);

  const html = theme.renderSearch(results, q, context);
  return new Response(html, {
    headers: { "content-type": "text/html;charset=UTF-8" },
  });
}
