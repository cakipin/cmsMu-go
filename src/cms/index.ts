import { Hono } from 'hono'
import type { Bindings } from './types'
import registerAddons from './addons'

// MODULES
import adminRouter from './modules/admin/admin.router'
import publicRouter from './modules/public/public.router'
import settingsRouter from './modules/settings/settings.router'
import mediaRouter from './modules/media/media.router'
import usersRouter from './modules/users/users.router'
import migrationRouter from './migration'
import themeRouter from './modules/theme/theme.router'
import pluginsRouter from './modules/plugins/plugins.router'
import menusRouter from './modules/menus/menus.router'
import { renderAdmin } from './modules/admin/ui/view'
import postsRouter from './modules/posts/posts.router'
import pagesRouter from './modules/pages/pages.router'; // Route API Pages
import themeEditorRouter from './modules/theme-editor/editor.router'; // Route Puck Theme Editor
import statsRouter from './modules/stats/stats.router'; // Stats Tracker
import notificationsRouter from './modules/users/notifications.router'; // Notifications
import { commentsRouter } from './modules/comments/comments.router'; // Comments

// ADDONS
// (All addons have been removed)

// AUTH MIDDLEWARE
import { authMiddleware, requireAdmin, requireEditor } from './middleware/auth'

const app = new Hono<{ Bindings: Bindings }>()

const getBucket = (env: Bindings) => {
    return env.MEDIA_BUCKET || env.BUCKET;
};

// 1. GLOBAL MIDDLEWARE
app.use('*', async (c, next) => {
  c.header('X-Request-Id', crypto.randomUUID());
  if (!['GET', 'HEAD', 'OPTIONS'].includes(c.req.method)) {
    const origin = c.req.header('Origin');
    if (origin && origin !== new URL(c.req.url).origin) return c.json({ error: 'Origin tidak diizinkan' }, 403);
  }
  await next();
  c.header('X-Frame-Options', 'SAMEORIGIN');
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  c.header('Cache-Control', 'no-store, max-age=0');
  c.header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com data:; img-src 'self' data: https: blob:; connect-src 'self' https:; frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none';");
});

app.onError((err, c) => {
  console.error(`[Global Error]: ${err.message}`, err);
  return c.json({ success: false, error: 'Terjadi kesalahan internal' }, 500);
});

// 2. AUTH MIDDLEWARE
app.use('/api/*', async (c, next) => {
  const path = c.req.path;
  const method = c.req.method;
  const publicExact = ['/api/users/login', '/api/users/sso', '/api/users/logout', '/api/users/session'];
  const isPublicMedia = method === 'GET' && path.startsWith('/api/media/file/');
  const isPublicComments = method === 'GET' && /^\/api\/comments\/\d+$/.test(path);
  const isPublicSettings = method === 'GET' && path === '/api/settings';
  const isWhitelisted = publicExact.includes(path) || path.startsWith('/api/public/') || isPublicMedia || isPublicComments || isPublicSettings;

  if (isWhitelisted) return await next();
  return await authMiddleware(c, next);
});

// 3. ROUTES DEFINITION
registerAddons(app);

// Admin & Sys
app.get('/admin', (c) => c.html(renderAdmin({ view: 'dash' })));
app.get('/admin/login', (c) => c.html(renderAdmin({ view: 'login' })));
app.get('/admin/', (c) => c.redirect('/admin', 301));
app.route('/admin', adminRouter);
app.use('/sys/*', authMiddleware, requireAdmin);
app.route('/sys/migration', migrationRouter);

// API
for (const path of ['/api/theme', '/api/plugins', '/api/menus']) {
  app.use(path, requireAdmin);
  app.use(`${path}/*`, requireAdmin);
}
for (const path of ['/api/theme-editor', '/api/posts', '/api/pages', '/api/media', '/api/notifications']) {
  app.use(path, requireEditor);
  app.use(`${path}/*`, requireEditor);
}
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
    headers.set('Cache-Control', 'no-store, max-age=0');
    return new Response(object.body, { headers });
  } catch (e: any) { return c.text(e.message, 500); }
});

// =====================================================================
// PUBLIC ROUTER (THEME) - INTEGRATED
// =====================================================================
// Menangani Homepage, Login, Search, dan URL lain yang tidak ada di DB
app.route('/', publicRouter);

export default app
