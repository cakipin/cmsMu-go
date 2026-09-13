import type { Context } from 'hono';
import type { Bindings } from '../utils';
import { getDb } from '../db';
import { posts } from '../db/schema';
import { eq } from 'drizzle-orm';

const WP_API_URL = "https://fatwatarjih.or.id/wp-json/wp/v2/posts?_embed&per_page=5";
const R2_PUBLIC_DOMAIN = "https://pub-xxxxxxxx.r2.dev";

export const syncLatest = async (c: Context<{ Bindings: Bindings }>) => {
    const logs: string[] = [];
    let savedCount = 0;

    try {
        logs.push("🚀 Memulai sinkronisasi dengan FatwaTarjih.or.id...");

        const response = await fetch(WP_API_URL);
        if (!response.ok) throw new Error("Gagal koneksi ke server Fatwa Tarjih");
        
        const fetchedPosts: any[] = await response.json();
        logs.push(`📦 Berhasil mengambil ${fetchedPosts.length} data mentah.`);

        const db = getDb(c.env.DB);

        for (const p of fetchedPosts) {
            const originalId = p.id;
            const title = p.title.rendered;
            const slug = p.slug;
            const content = p.content.rendered;
            const date = new Date(p.date).toISOString();

            const existing = await db.select({ id: posts.id }).from(posts).where(eq(posts.slug, slug)).get();
            
            if (existing) {
                logs.push(`⏩ Skip: "${title}" (Sudah ada)`);
                continue;
            }

            let localImageUrl = '';
            
            if (p._embedded && p._embedded['wp:featuredmedia'] && p._embedded['wp:featuredmedia'][0]) {
                const sourceUrl = p._embedded['wp:featuredmedia'][0].source_url;
                
                try {
                    const imgRes = await fetch(sourceUrl);
                    if (imgRes.ok) {
                        const imgBlob = await imgRes.arrayBuffer();
                        const fileExt = sourceUrl.split('.').pop() || 'jpg';
                        const r2FileName = `tarjih/img-${originalId}.${fileExt}`;

                        await c.env.MY_BUCKET.put(r2FileName, imgBlob, {
                            httpMetadata: { contentType: imgRes.headers.get('content-type') || 'image/jpeg' }
                        });

                        localImageUrl = `${R2_PUBLIC_DOMAIN}/${r2FileName}`;
                        logs.push(`   📸 Gambar terupload ke R2: ${r2FileName}`);
                    }
                } catch (imgErr) {
                    logs.push(`   ⚠️ Gagal download gambar: ${sourceUrl}`);
                }
            }

            await db.insert(posts).values({
                title,
                slug,
                body: content,
                featuredImage: localImageUrl,
                createdAt: date,
                status: 'publish'
            }).run();

            savedCount++;
            logs.push(`✅ Disimpan: "${title}"`);
        }

    } catch (e: any) {
        logs.push(`❌ ERROR CRITICAL: ${e.message}`);
        return c.json({ success: false, logs }, 500);
    }

    return c.json({
        success: true,
        message: `Sinkronisasi Selesai. ${savedCount} artikel baru disimpan.`,
        logs: logs
    });
};
