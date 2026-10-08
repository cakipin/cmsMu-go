import { Hono } from 'hono';
import type { Context } from 'hono';
import { getGlobalData, getRenderer } from '../../apps/cms-api/src/modules/public/helpers';

export const publicAgensRouter = new Hono();

export async function handleAgenRoute(c: Context) {
    try {
        const db = (c.env as any).DB;
        const page = parseInt(c.req.query('page') || '1');
        const search = c.req.query('q') || '';
        const limit = 15;
        const offset = (page - 1) * limit;

        const { settings, menus } = await getGlobalData(db);
        const { Renderer } = await getRenderer(db);
        
        let agens: any[] = [];
        let totalItems = 0;
        
        try {
            if (search) {
                const words = search.split(/\s+/).filter((w: string) => w.trim().length > 0);
                
                let whereClause = "1=1";
                const bindParams: string[] = [];
                
                words.forEach((word: string) => {
                    whereClause += " AND (name LIKE ? OR area LIKE ? OR address LIKE ?)";
                    const pattern = '%' + word + '%';
                    bindParams.push(pattern, pattern, pattern);
                });
                
                const countSql = "SELECT count(*) as total FROM agens WHERE " + whereClause;
                const totalRow: any = await db.prepare(countSql).bind(...bindParams).first();
                totalItems = totalRow?.total || 0;
                
                const sqlQuery = "SELECT * FROM agens WHERE " + whereClause + " ORDER BY area ASC, name ASC LIMIT ? OFFSET ?";
                const result = await db.prepare(sqlQuery).bind(...bindParams, limit, offset).all();
                
                agens = result.results || [];
            } else {
                const totalRow: any = await db.prepare("SELECT count(*) as total FROM agens").first();
                totalItems = totalRow?.total || 0;
                
                const result = await db.prepare("SELECT * FROM agens ORDER BY area ASC, name ASC LIMIT ? OFFSET ?")
                    .bind(limit, offset).all();
                agens = result.results || [];
            }
        } catch(e) { console.error("Agens table missing or error", e); }
        
        const totalPages = Math.ceil(totalItems / limit);
        let baseUrl = '/agen';
        if (search) baseUrl += '?q=' + encodeURIComponent(search);
        
        const pagination = { 
            currentPage: page, totalPages, totalItems, 
            hasNext: page < totalPages, hasPrev: page > 1, 
            baseUrl
        };
        
        const context: any = { site: settings, menus, data: agens, pagination, search };
        
        if (Renderer?.renderAgen) return c.html(Renderer.renderAgen(context));
        return c.html(Renderer.renderHome(context));
    } catch (e: any) { return c.text('Agen Error: ' + e.message, 500); }
}

publicAgensRouter.get('/', handleAgenRoute);
