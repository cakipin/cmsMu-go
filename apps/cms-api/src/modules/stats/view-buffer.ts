/**
 * KV View Buffer Counter for core cmsMu
 *
 * INVARIANT:
 * - Direct writes to D1 on every single pageview burn D1 write limits (100k/day on Free Plan).
 * - This module buffers view increments in Cloudflare KV (CACHE / cmsmu_cache / sa_cache).
 * - When buffered views for an item reach BUFFER_THRESHOLD (default: 10 views),
 *   it flushes the accumulated count to D1 via a single atomic batch query:
 *     UPDATE posts SET views = views + N WHERE id = ?
 *     INSERT INTO daily_stats (date, views, visitors, updated_at) ... ON CONFLICT DO UPDATE SET views = views + N
 * - D1 writes are reduced by >= 90%!
 */

import type { Bindings } from '../../types';

const BUFFER_THRESHOLD = 10; // Flush to D1 every 10 views per item
const KV_BUF_PREFIX = 'buf:view';
const KV_DAILY_PREFIX = 'buf:daily';

export interface ViewBufferResult {
  buffered: boolean;
  flushedToD1: boolean;
  currentBuffer: number;
}

/**
 * Record a pageview in KV buffer, and flush to D1 if threshold is reached.
 * Safe to run inside safeWaitUntil / executionCtx.waitUntil.
 */
export async function recordBufferedView(
  env: Bindings,
  type: 'post' | 'page',
  id: number,
  options?: { threshold?: number }
): Promise<ViewBufferResult> {
  const threshold = options?.threshold ?? BUFFER_THRESHOLD;
  const kv = (env as any)?.CACHE || (env as any)?.cmsmu_cache || (env as any)?.sa_cache || (env as any)?.KV;
  const db = env?.DB;

  // Fallback direct D1 write if KV is not bound
  if (!kv || typeof kv.get !== 'function' || typeof kv.put !== 'function') {
    if (db) {
      await directD1Write(db, type, id, 1);
    }
    return { buffered: false, flushedToD1: true, currentBuffer: 0 };
  }

  const key = `${KV_BUF_PREFIX}:${type}:${id}`;
  const todayWib = getTodayWib();
  const dailyKey = `${KV_DAILY_PREFIX}:${todayWib}`;

  try {
    // 1. Get current buffer count from KV
    const currentStr = await kv.get(key, 'text');
    const currentCount = parseInt(currentStr || '0', 10);
    const newCount = currentCount + 1;

    // 2. Also increment daily views in KV
    const currentDailyStr = await kv.get(dailyKey, 'text');
    const newDailyCount = parseInt(currentDailyStr || '0', 10) + 1;

    // 3. Check if threshold reached
    if (newCount >= threshold) {
      // Threshold reached -> Flush to D1 in 1 atomic operation!
      if (db) {
        await directD1Write(db, type, id, newCount);
      }
      // Reset KV item buffer to 0 (TTL 7 days)
      await Promise.all([
        kv.put(key, '0', { expirationTtl: 604800 }),
        kv.put(dailyKey, '0', { expirationTtl: 172800 }),
      ]);
      return { buffered: true, flushedToD1: true, currentBuffer: 0 };
    } else {
      // Still buffering in KV (TTL 7 days)
      await Promise.all([
        kv.put(key, String(newCount), { expirationTtl: 604800 }),
        kv.put(dailyKey, String(newDailyCount), { expirationTtl: 172800 }),
      ]);
      return { buffered: true, flushedToD1: false, currentBuffer: newCount };
    }
  } catch (err) {
    console.warn('[ViewBuffer Error]:', err);
    // On KV failure, safely fall back to direct D1 write
    if (db) {
      try {
        await directD1Write(db, type, id, 1);
      } catch (_) {}
    }
    return { buffered: false, flushedToD1: true, currentBuffer: 0 };
  }
}

/**
 * Flush pending views to D1 in batch using atomic D1 batch API.
 */
async function directD1Write(db: any, type: 'post' | 'page', id: number, delta: number) {
  const table = type === 'page' ? 'pages' : 'posts';
  const itemSql = `UPDATE ${table} SET views = views + ? WHERE id = ?`;
  const dailySql = `
    INSERT INTO daily_stats (date, views, visitors, updated_at)
    VALUES (date('now', '+7 hours'), ?, 0, datetime('now'))
    ON CONFLICT(date) DO UPDATE SET views = views + ?, updated_at = datetime('now')
  `;

  await db.batch([
    db.prepare(itemSql).bind(delta, id),
    db.prepare(dailySql).bind(delta, delta),
  ]);
}

/**
 * Get date string in YYYY-MM-DD for WIB (UTC+7).
 */
function getTodayWib(): string {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const wib = new Date(utc + 7 * 3600000);
  return wib.toISOString().split('T')[0];
}
