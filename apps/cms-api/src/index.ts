import { Hono } from 'hono';
import { cors } from 'hono/cors';
import authRouter from './routes/auth.router';
import menusRouter from './routes/menus.router';
import newsroomRouter from './routes/newsroom.router';
import postsRouter from './routes/posts.router';
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

// Global Middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Origin'],
}));

// Health check
app.get('/health', (c) => c.json({ status: 'ok', time: new Date().toISOString() }));

// API Gateways
app.route('/api/auth', authRouter);
app.route('/api/menus', menusRouter);
app.route('/api/newsroom', newsroomRouter);
app.route('/api/posts', postsRouter);
app.route('/api/emagazine', emagazineRouter);
app.route('/api/subscribers', subscribersRouter);
app.route('/api/aggregator', aggregatorRouter);

export default app;
