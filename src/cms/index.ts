import { Hono } from 'hono'
import { cors } from 'hono/cors'
import registerAddons from './addons'

// MODULES
import adminRouter from './modules/admin/admin.router'
import contentRouter from './modules/contents/contents.router'
import publicRouter from './modules/public/public.router'
import uploadsRouter from './modules/public/uploads.router'

import settingsRouter from './modules/settings/settings.router'
import mediaRouter from './modules/media/media.router'
import usersRouter from './modules/users/users.router';
import migrationRouter from './migration'
import themeRouter from './modules/theme/theme.router'
import pluginsRouter from './modules/plugins/plugins.router'
import menusRouter from './modules/menus/menus.router'
import { updateSchema } from './db/init'
import { renderAdmin } from './modules/admin/ui/view'
import postsRouter from './modules/posts/posts.router'
import pagesRouter from './modules/pages/pages.router'; // Route API Pages
import themeEditorRouter from './modules/theme-editor/editor.router'; // Route Puck Theme Editor
import statsRouter from './modules/stats/stats.router'; // Stats Tracker
import notificationsRouter from './modules/users/notifications.router'; // Notifications
import { commentsRouter } from './modules/comments/comments.router';
import { otaRouter } from './addons/ota/router';

// ADDONS
// (All addons have been removed)

// AUTH MIDDLEWARE
import { authMiddleware, adminOnlyMiddleware } from './middleware/auth'
import { getStorageBucket } from './storage/r2-adapter'

type Bindings = {
  DB: D1Database;
  MEDIA_BUCKET?: R2Bucket;
  BUCKET?: R2Bucket;
  R2_ACCOUNT_ID?: string;
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  R2_BUCKET_NAME?: string;
};

const app = new Hono<{ Bindings: Bindings }>()

const getBucket = (env: any) => {
    return getStorageBucket(env);
};

// 1. GLOBAL MIDDLEWARE
app.use('/*', cors())

app.use('*', async (c, next) => {
  await next();
  c.header('X-Frame-Options', 'SAMEORIGIN');
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('Content-Security-Policy', "default-src 'self' https: data: blob: 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https: data: blob:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https: blob:; font-src 'self' https: data:; connect-src 'self' https:; frame-src 'self' https: data:; worker-src 'self' https: data: blob:;");
});

app.onError((err, c) => {
  console.error(`[Global Error]: ${err.message}`, err);
  return c.json({ success: false, error: err.message || 'Internal Server Error' }, 500);
});

// 2. AUTH MIDDLEWARE
app.use('/api/*', async (c, next) => {
  const path = c.req.path;
  const method = c.req.method;
  const isWhitelisted = path.includes('/login') || path.startsWith('/api/public') || path.startsWith('/api/setup') || path.startsWith('/api/users/sso') || path.startsWith('/api/ota') || (method === 'GET' && path.startsWith('/api/addons/ota')) || path.startsWith('/api/addons/ota/clients/report-status') || path.startsWith('/api/addons/ota/clients/register') || path.startsWith('/api/addons/ota/clients/heartbeat') || path.startsWith('/api/addons/ota/git-push') || path === '/api/health' ||
    ((method === 'GET' || method === 'HEAD') && (path.startsWith('/api/media') || path.startsWith('/api/posts') || path.startsWith('/api/pages') || path.startsWith('/api/contents') || path.startsWith('/api/comments') || path === '/api/settings'));

  if (isWhitelisted) return await next();
  return await authMiddleware(c, next);
});

// 3. ROUTES DEFINITION
registerAddons(app);

// Health Check Endpoints
app.get('/health', (c) => c.json({
  status: 'ok',
  service: 'cmsMu Core Engine',
  engine: 'Hono on Cloudflare Workers / Astro SSR',
  time: new Date().toISOString()
}));
app.get('/api/health', (c) => c.json({
  status: 'ok',
  service: 'cmsMu Core Engine',
  engine: 'Hono on Cloudflare Workers / Astro SSR',
  time: new Date().toISOString()
}));

// Admin & Sys
app.get('/admin', (c) => c.html(renderAdmin({ view: 'dash' }))); 
app.get('/admin/login', (c) => c.html(renderAdmin({ view: 'login' })));
app.get('/login', (c) => c.html(renderAdmin({ view: 'login' })));
app.get('/admin/', (c) => c.redirect('/admin', 301));
app.use('/admin/data/*', adminOnlyMiddleware);
app.route('/admin', adminRouter);
app.get('/sys/install', adminOnlyMiddleware, async (c) => {
  try { const logs = await updateSchema(c.env.DB); return c.json({ success: true, details: logs }); } 
  catch (e: any) { return c.json({ error: e.message }, 500); }
});
app.use('/sys/migration/*', adminOnlyMiddleware);
app.use('/sys/migration', adminOnlyMiddleware);
app.route('/sys/migration', migrationRouter);

// API
app.route('/api/ota', otaRouter);
app.route('/api/contents', contentRouter);
app.route('/api/settings', settingsRouter);
app.route('/api/media', mediaRouter); 
app.route('/api/theme', themeRouter);
app.route('/api/users', usersRouter);
app.route('/api/menus', menusRouter);
app.route('/api/plugins', pluginsRouter);
app.route('/api/stats', statsRouter);
app.route('/api/notifications', notificationsRouter);
app.route('/api/comments', commentsRouter);

app.route('/api/posts', postsRouter);
app.route('/api/pages', pagesRouter); // Route API Pages
app.route('/api/theme-editor', themeEditorRouter); // Endpoint Editor Puck

// Catch-all admin view (setelah spesifik routes)
app.get('/admin/:view', (c) => c.html(renderAdmin({ view: c.req.param('view') })));

// Media
app.get('/media/*', async (c) => {
  try {
    const key = c.req.path.replace('/media/', '');
    if (!key) return c.notFound();
    const bucket = getBucket(c.env);
    if (!bucket) return c.text('Bucket Config Error', 500);
    const object = await bucket.get(decodeURIComponent(key));
    if (!object) return c.text('File not found', 404);
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000'); 
    return new Response(object.body, { headers });
  } catch (e: any) { return c.text(e.message, 500); }
});

// =====================================================================
// PUBLIC ROUTER (THEME) - INTEGRATED
// =====================================================================
// Menangani Homepage, Login, Search, dan URL lain yang tidak ada di DB

// WordPress Media Proxy & Clean Uploads Router (/uploads/* and /wp-content/uploads/*)
app.route('/uploads', uploadsRouter);
app.route('/wp-content/uploads', uploadsRouter);

app.route('/', publicRouter);

export default app