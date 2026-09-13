import { Hono } from 'hono';
import { getDb, users, subscriptions } from '@cmsmu/db';
import { eq, desc } from 'drizzle-orm';
import { generateQrisString, generateVaNumber, getDynamicPlanDetails } from '@cmsmu/core';

export const subscribersRouter = new Hono<{ Bindings: any }>();

// GET /api/subscribers
subscribersRouter.get('/', async (c) => {
  try {
    const db = getDb(c.env.DB);
    const results = await db.select().from(subscriptions).orderBy(desc(subscriptions.id));
    return c.json(results || []);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// POST /api/subscribers/create
subscribersRouter.post('/create', async (c) => {
  try {
    const body = await c.req.json().catch(() => null);
    if (!body || !body.plan) return c.json({ error: 'Paket langganan wajib dipilih' }, 400);

    const db = getDb(c.env.DB);
    const planDetails = await getDynamicPlanDetails(c.env.DB, body.plan);
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const qrisString = generateQrisString(planDetails.amount, invoiceNumber);

    return c.json({
      success: true,
      invoiceNumber,
      amount: planDetails.amount,
      plan: planDetails.label,
      qrisString,
      instructions: 'Pindai kode QRIS menggunakan aplikasi perbankan atau e-wallet Anda.'
    });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

export default subscribersRouter;
