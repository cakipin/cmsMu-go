import { Hono } from 'hono';
import { renderAdmin } from './ui/view';      // Import Dashboard dari views.ts
import { editorPage } from './ui/blocks/editor.page';
import { ssoCallbackPage } from './ui/pages/sso-callback.page';
import { requireAdmin } from '../../middleware/auth';
import type { D1Database } from '@cloudflare/workers-types';

// Definisikan tipe Bindings agar TypeScript tidak error saat akses c.env.DB
interface Bindings {
  DB: D1Database;
}

const admin = new Hono<{ Bindings: Bindings }>();

// 1. DASHBOARD UTAMA
admin.get('/', (c) => {
  return c.html(renderAdmin({ view: 'dash' }));
});

// 1b. SSO CALLBACK
admin.get('/sso/callback', (c) => {
  return c.html(ssoCallbackPage);
});

// 2. EDITOR ROUTES (Menangani Post & Page)
// Route untuk membuat baru: /admin/post/new ATAU /admin/page/new
admin.get('/:type/new', (c) => {
  const type = c.req.param('type');
  // Validasi: hanya boleh 'post' atau 'page'
  if (type !== 'post' && type !== 'page') {
    return c.redirect('/admin');
  }
  return c.html(editorPage);
});

// Route untuk edit: /admin/post/123/edit ATAU /admin/page/123/edit
admin.get('/:type/:id/edit', (c) => {
  // Kita tidak perlu validasi ID di sini, biarkan UI Editor yang handle jika ID tidak ketemu
  return c.html(editorPage);
});

// 3. API INTERNAL (Data Users)
// Endpoint ini bisa dipanggil oleh fetch di ui/views.ts untuk loadUsers()
admin.get('/data/users', requireAdmin, async (c) => {
  try {
    const users = await c.env.DB.prepare(
      "SELECT id, username, name, email, role, created_at FROM users ORDER BY id DESC"
    ).all();
    return c.json({ success: true, data: users.results });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

export default admin;
