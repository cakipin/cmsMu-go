import { Hono } from 'hono';
import type { Context } from 'hono';
import { getGlobalData, getRenderer } from '../../src/cms/modules/public/helpers';
import { getDb } from '../../src/cms/db';
import { magazines as magazinesTable } from '../../src/cms/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getPlansConfig } from './emagazine.router';
import { getStorageBucket } from '../../src/cms/storage/r2-adapter';

export const publicBerlanggananRouter = new Hono();
export const publicMajalahRouter = new Hono();

export async function handleBerlanggananPage(c: Context) {
    try {
        const db = (c.env as any).DB;
        const lang = c.req.path.startsWith('/en') ? 'en' : (c.req.path.startsWith('/ar') ? 'ar' : 'id');
        const { settings, menus } = await getGlobalData(db, lang as any, c.env);
        const { Renderer } = await getRenderer(db);
        const plansConfig = await getPlansConfig(db);
        
        const context: any = { site: settings, menus, data: { title: 'Daftar Pelanggan Pro', plansConfig }, lang };
        
        if (Renderer?.renderBerlangganan) {
            return c.html(Renderer.renderBerlangganan(context));
        }
        
        return c.html(Renderer.renderPage ? Renderer.renderPage(context) : 'Halaman berlangganan belum tersedia di tema ini.');
    } catch (e: any) { return c.text('Error: ' + e.message, 500); }
}

export async function handleMajalahCatalog(c: Context) {
    try {
        const page = Math.max(1, parseInt(c.req.query('page') || '1'));
        const q = (c.req.query('q') || '').trim();
        const year = (c.req.query('year') || '').trim();
        const limit = 12;

        const db = (c.env as any).DB;
        const lang = c.req.path.startsWith('/en') ? 'en' : (c.req.path.startsWith('/ar') ? 'ar' : 'id');
        const { settings, menus } = await getGlobalData(db, lang as any, c.env);
        const { Renderer } = await getRenderer(db);
        
        const allList = await getDb(db).select({
            id: magazinesTable.id,
            title: magazinesTable.title,
            slug: magazinesTable.slug,
            description: magazinesTable.description,
            editionNumber: magazinesTable.editionNumber,
            publicationDate: magazinesTable.publicationDate,
            coverImage: magazinesTable.coverImage,
            isFree: magazinesTable.isFree,
            previewPages: magazinesTable.previewPages,
            createdAt: magazinesTable.createdAt,
        })
        .from(magazinesTable)
        .where(eq(magazinesTable.status, 'published'))
        .orderBy(desc(magazinesTable.id));

        let filtered = allList || [];
        if (q) {
            const lowerQ = q.toLowerCase();
            filtered = filtered.filter(item => 
                (item.title && item.title.toLowerCase().includes(lowerQ)) ||
                (item.editionNumber && item.editionNumber.toLowerCase().includes(lowerQ)) ||
                (item.description && item.description.toLowerCase().includes(lowerQ)) ||
                (item.publicationDate && item.publicationDate.toLowerCase().includes(lowerQ))
            );
        }
        if (year) {
            if (year === 'free') {
                filtered = filtered.filter(item => item.isFree === 1);
            } else {
                filtered = filtered.filter(item => {
                    const pub = item.publicationDate || '';
                    const title = item.title || '';
                    const ed = item.editionNumber || '';
                    return pub.includes(year) || title.includes(year) || ed.includes(year);
                });
            }
        }

        const totalItems = filtered.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / limit));
        const safePage = Math.min(Math.max(1, page), totalPages);
        const offset = (safePage - 1) * limit;
        const paginatedData = filtered.slice(offset, offset + limit);

        const context: any = { 
            site: settings, 
            menus, 
            data: paginatedData,
            pagination: {
                currentPage: safePage,
                totalPages,
                totalItems,
                limit,
                q,
                year
            },
            lang
        };
        if (Renderer?.renderMajalahList) {
            return c.html(Renderer.renderMajalahList(context));
        }
        return c.text('Katalog majalah belum tersedia.', 404);
    } catch (e: any) { return c.text('Majalah Error: ' + e.message, 500); }
}

export async function handleMajalahDetail(c: Context) {
    try {
        const slug = c.req.param('slug');
        const db = (c.env as any).DB;
        const lang = c.req.path.startsWith('/en') ? 'en' : (c.req.path.startsWith('/ar') ? 'ar' : 'id');
        const { settings, menus } = await getGlobalData(db, lang as any, c.env);
        const { Renderer } = await getRenderer(db);

        const mag = await getDb(db).select()
            .from(magazinesTable)
            .where(and(eq(magazinesTable.slug, slug), eq(magazinesTable.status, 'published')))
            .get();

        if (!mag) return c.html(Renderer?.render404 ? Renderer.render404({ site: settings, menus, lang }) : 'Majalah tidak ditemukan', 404);

        let hasPdf = false;
        const r2 = getStorageBucket(c);
        if (r2 && mag.pdfR2Key) {
            try {
                const head = await r2.head(mag.pdfR2Key);
                if (head) hasPdf = true;
            } catch {
                hasPdf = false;
            }
        }

        const context: any = { site: settings, menus, data: { ...mag, hasPdf }, lang };
        if (Renderer?.renderMajalahReader) {
            return c.html(Renderer.renderMajalahReader(context));
        }
        return c.text('Penampil majalah belum tersedia.', 404);
    } catch (e: any) { return c.text('Majalah Reader Error: ' + e.message, 500); }
}

publicBerlanggananRouter.get('/', handleBerlanggananPage);
publicMajalahRouter.get('/', handleMajalahCatalog);
publicMajalahRouter.get('/:slug', handleMajalahDetail);
