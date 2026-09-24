import { Hono } from 'hono';
import { cors } from 'hono/cors';
import authRouter from './routes/auth.router';
import menusRouter from './routes/menus.router';
import newsroomRouter from './routes/newsroom.router';
import postsRouter from './routes/posts.router';
import pagesRouter from './routes/pages.router';
import mediaRouter from './routes/media.router';
import settingsRouter from './routes/settings.router';
import usersRouter from './routes/users.router';
import emagazineRouter from './routes/emagazine.router';
import subscribersRouter from './routes/subscribers.router';
import aggregatorRouter from './routes/aggregator.router';

export type Env = {
  DB: D1Database;
  BUCKET: R2Bucket;
  SESSION: KVNamespace;
  SSO_CLIENT_ID?: string;
  SSO_CLIENT_SECRET?: string;
};

const app = new Hono<{ Bindings: Env }>();

// 1. Global Middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Origin', 'Cookie'],
  exposeHeaders: ['Content-Length', 'X-Total-Count'],
  credentials: true
}));

// 2. Base Info & Health Check
app.get('/', (c) => c.json({
  name: 'CMSMu Universal API Gateway',
  version: '2.0.0',
  engine: 'Hono on Cloudflare Workers',
  status: 'online',
  endpoints: [
    '/health',
    '/api/auth',
    '/api/posts',
    '/api/pages',
    '/api/media',
    '/api/menus',
    '/api/settings',
    '/api/users',
    '/api/newsroom',
    '/api/emagazine',
    '/api/subscribers',
    '/api/aggregator'
  ]
}));

app.get('/health', (c) => c.json({ status: 'ok', time: new Date().toISOString() }));

// 3. API Gateways
app.route('/api/auth', authRouter);
app.route('/api/menus', menusRouter);
app.route('/api/newsroom', newsroomRouter);
app.route('/api/posts', postsRouter);
app.route('/api/pages', pagesRouter);
app.route('/api/media', mediaRouter);
app.route('/api/settings', settingsRouter);
app.route('/api/users', usersRouter);
app.route('/api/emagazine', emagazineRouter);
app.route('/api/subscribers', subscribersRouter);
app.route('/api/aggregator', aggregatorRouter);

// 4. Global Error Handler & 404
app.notFound((c) => c.json({ error: 'Endpoint API tidak ditemukan', path: c.req.path }, 404));
app.onError((err, c) => {
  console.error('Unhandled API Error:', err);
  return c.json({ error: 'Internal Server Error', message: err.message }, 500);
});

export type AppType = typeof app;
export default app;

