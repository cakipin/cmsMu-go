import { Hono } from 'hono';
import { clearSession, createSession, normalizeRole, readSession } from '../../middleware/auth';

type Bindings = {
  DB: D1Database;
  SSO_CLIENT_ID?: string;
  SSO_CLIENT_SECRET?: string;
  SESSION_SECRET: string;
};

const usersRouter = new Hono<{ Bindings: Bindings }>();
const allowedRoles = new Set(['administrator', 'editor', 'author', 'subscriber']);

const ITERATIONS = 210_000;
const encode = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const decode = (value: string) => Uint8Array.from(atob(value), c => c.charCodeAt(0));

async function sha256(message: string) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password: string) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITERATIONS }, material, 256);
    return `pbkdf2$${ITERATIONS}$${encode(salt)}$${encode(new Uint8Array(bits))}`;
}

async function verifyPassword(password: string, stored: string) {
    if (stored.startsWith('pbkdf2$')) {
        const [, iterations, salt, expected] = stored.split('$');
        const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
        const bits = new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: decode(salt), iterations: Number(iterations) }, material, 256));
        const target = decode(expected);
        return bits.length === target.length && bits.every((byte, i) => byte === target[i]);
    }
    return stored === password || stored === await sha256(password);
}

async function fingerprint(c: any) {
    const ip = c.req.header('cf-connecting-ip') || 'unknown';
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(c.env.SESSION_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    return encode(new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(ip))));
}

// ---------------------------------------------------------------------
// 1. GET ALL USERS
// ---------------------------------------------------------------------
usersRouter.get('/', async (c) => {
    try {
        const session = await readSession(c);
        if (session?.role !== 'administrator') return c.json({ error: 'Akses ditolak' }, 403);
        if (!c.env.DB) return c.json({ error: 'Database Error' }, 500);
        const { results } = await c.env.DB.prepare(
            'SELECT id, username, name, email, role, created_at FROM users ORDER BY created_at DESC'
        ).all();
        return c.json(results);
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// ---------------------------------------------------------------------
// 2. CREATE USER (POST /)
// ---------------------------------------------------------------------
usersRouter.post('/', async (c) => {
    try {
        const body = await c.req.json();
        const { username, password, email, role, name } = body;

        // Validasi minimal
        if (!username || !password) return c.json({ error: 'Username & Password wajib' }, 400);

        // Hash Password sebelum simpan (Opsional, tapi disarankan)
        // Untuk saat ini kita simpan plain text agar sesuai dengan data lama Anda,
        // atau gunakan sha256(password) jika ingin mulai secure.
        const session = await readSession(c);
        if (session?.role !== 'administrator') return c.json({ error: 'Akses ditolak' }, 403);
        if (String(password).length < 10) return c.json({ error: 'Password minimal 10 karakter' }, 400);
        const finalPass = await hashPassword(password);

        const safeRole = allowedRoles.has(String(role)) ? String(role) : 'editor';
        const res = await c.env.DB.prepare(
            'INSERT INTO users (username, password_hash, email, role, name, created_at) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(username, finalPass, email || '', safeRole, name || '', new Date().toISOString()).run();

        if (res.success) {
            return c.json({ success: true, message: 'User berhasil dibuat' });
        } else {
            return c.json({ error: 'Gagal membuat user' }, 500);
        }
    } catch (e: any) {
        return c.json({ error: 'Error: ' + e.message }, 500);
    }
});

// ---------------------------------------------------------------------
// 3. UPDATE USER (PUT /:id) -> Fix Error 404 saat Edit
// ---------------------------------------------------------------------
usersRouter.put('/:id', async (c) => {
    try {
        const id = c.req.param('id');

        // Cek Endpoint Khusus Profil (Ganti Password Sendiri)
        if (id === 'profile' || id === 'profile-password') {
            const body = await c.req.json();
            const { currentPassword, newPassword } = body;

            // Dapatkan token dari middleware (Auth Header)
            const session = await readSession(c);
            if (!session) return c.json({ error: 'Sesi tidak valid' }, 401);
            const userId = session.id;

            // Cek password saat ini
            const user: any = await c.env.DB.prepare('SELECT COALESCE(password_hash, password) as password FROM users WHERE id = ?').bind(userId).first();
            if (!user) return c.json({ error: 'User tidak ditemukan' }, 404);

            if (!await verifyPassword(String(currentPassword || ''), String(user.password || ''))) {
                return c.json({ error: 'Password saat ini salah' }, 401);
            }

            // Update password baru
            if (String(newPassword || '').length < 10) return c.json({ error: 'Password baru minimal 10 karakter' }, 400);
            const newHashed = await hashPassword(newPassword);
            const res = await c.env.DB.prepare('UPDATE users SET password_hash = ? WHERE id = ?').bind(newHashed, userId).run();

            if (res.success) return c.json({ success: true, message: 'Password berhasil diubah' });
            return c.json({ error: 'Gagal mengubah password' }, 500);
        }

        const body = await c.req.json();
        const session = await readSession(c);
        if (session?.role !== 'administrator') return c.json({ error: 'Akses ditolak' }, 403);
        const { username, email, role, name, password } = body;
        if (!allowedRoles.has(String(role))) return c.json({ error: 'Role tidak valid' }, 400);

        let query = 'UPDATE users SET username=?, email=?, role=?, name=?';
        let params = [username, email, role, name];

        // Jika password diisi, update password juga
        if (password && password.trim() !== '') {
            query += ', password_hash=?';
            if (String(password).length < 10) return c.json({ error: 'Password minimal 10 karakter' }, 400);
            const hashed = await hashPassword(password);
            params.push(hashed);
        }

        query += ' WHERE id=?';
        params.push(id);

        const res = await c.env.DB.prepare(query).bind(...params).run();

        if (res.success) {
            return c.json({ success: true });
        } else {
            return c.json({ error: 'Gagal update user' }, 500);
        }
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// ---------------------------------------------------------------------
// 4. DELETE USER (DELETE /:id) -> Fix Error 404 saat Hapus
// ---------------------------------------------------------------------
usersRouter.delete('/:id', async (c) => {
    try {
        const session = await readSession(c);
        if (session?.role !== 'administrator') return c.json({ error: 'Akses ditolak' }, 403);
        const id = c.req.param('id');
        if (Number(id) === session.id) return c.json({ error: 'Tidak dapat menghapus akun sendiri' }, 400);
        const res = await c.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run();

        if (res.success) {
            return c.json({ success: true });
        } else {
            return c.json({ error: 'Gagal menghapus user' }, 500);
        }
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// ---------------------------------------------------------------------
// 5. LOGIN (Tetap Dipertahankan)
// ---------------------------------------------------------------------
usersRouter.post('/login', async (c) => {
    try {
        const fp = await fingerprint(c);
        await c.env.DB.prepare("DELETE FROM login_attempts WHERE attempted_at < datetime('now', '-15 minutes')").run();
        const attempts: any = await c.env.DB.prepare("SELECT count(*) AS count FROM login_attempts WHERE fingerprint = ? AND attempted_at >= datetime('now', '-15 minutes')").bind(fp).first();
        if ((attempts?.count || 0) >= 8) return c.json({ error: 'Terlalu banyak percobaan. Coba lagi nanti.' }, 429);
        const body = await c.req.json().catch(() => null);
        if (!body) return c.json({ error: 'Data login tidak lengkap' }, 400);

        const { username, password } = body;
        if (!c.env.DB) return c.json({ error: 'Database tidak terhubung' }, 500);

        const user: any = await c.env.DB.prepare('SELECT id, username, COALESCE(password_hash, password) as password, email, role, name, avatar FROM users WHERE username = ?')
            .bind(username).first();

        if (!user) {
            await c.env.DB.prepare('INSERT INTO login_attempts (fingerprint) VALUES (?)').bind(fp).run();
            return c.json({ error: 'Username atau password salah' }, 401);
        }

        const inputPassword = String(password);
        const dbPassword = String(user.password);

        if (!await verifyPassword(inputPassword, dbPassword)) {
            await c.env.DB.prepare('INSERT INTO login_attempts (fingerprint) VALUES (?)').bind(fp).run();
            return c.json({ error: 'Username atau password salah' }, 401);
        }
        await c.env.DB.prepare('DELETE FROM login_attempts WHERE fingerprint = ?').bind(fp).run();
        if (!dbPassword.startsWith('pbkdf2$')) {
            await c.env.DB.prepare('UPDATE users SET password_hash = ? WHERE id = ?').bind(await hashPassword(inputPassword), user.id).run();
        }
        const sessionUser = { id: user.id, username: user.username, email: user.email, role: normalizeRole(user.role), name: user.name || '', avatar: user.avatar || '' };
        await createSession(c, sessionUser);
        return c.json({ success: true, user: sessionUser });

    } catch (e: any) {
        return c.json({ error: 'Gagal Login: ' + e.message }, 500);
    }
});

// ---------------------------------------------------------------------
// 6. SSO LOGIN (MUHAMMADIYAH ID)
// ---------------------------------------------------------------------
usersRouter.post('/sso', async (c) => {
    try {
        const body = await c.req.json().catch(() => null);
        if (!body || !body.code || !body.redirectUri) {
            return c.json({ error: 'Data otorisasi tidak lengkap' }, 400);
        }

        const { code, redirectUri } = body;
        if (!c.env.DB) return c.json({ error: 'Database tidak terhubung' }, 500);

        // Ambil konfigurasi dari table settings di DB (opsional)
        let dbSettings: any = {};
        try {
            const { results } = await c.env.DB.prepare("SELECT key, value FROM settings WHERE key IN ('sso_enabled', 'sso_client_id', 'sso_client_secret')").all();
            if (results) {
                results.forEach((row: any) => { dbSettings[row.key] = row.value; });
            }
        } catch(e) {}

        if (dbSettings.sso_enabled === 'false') {
            return c.json({ error: 'SSO sedang dinonaktifkan oleh Administrator.' }, 403);
        }

        // Ambil secrets dari env (sebagai fallback utama) atau dari DB
        const CLIENT_ID = c.env.SSO_CLIENT_ID || dbSettings.sso_client_id;
        const CLIENT_SECRET = c.env.SSO_CLIENT_SECRET;

        if (!CLIENT_ID || !CLIENT_SECRET) {
            return c.json({ error: 'Konfigurasi SSO (Client ID/Secret) belum disetel di server.' }, 500);
        }
        const expectedRedirect = `${new URL(c.req.url).origin}/admin/sso/callback`;
        if (redirectUri !== expectedRedirect) return c.json({ error: 'Redirect URI tidak valid' }, 400);

        const DIASMU_TOKEN_ENDPOINT = 'https://diasmu.labmu.workers.dev/oauth/token';
        const DIASMU_USERINFO_ENDPOINT = 'https://diasmu.labmu.workers.dev/oauth/userinfo';

        // 1. Tukar Kode dengan Token
        const tokenResponse = await fetch(DIASMU_TOKEN_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                redirect_uri: redirectUri,
                code: code,
            }).toString(),
        });

        if (!tokenResponse.ok) {
            return c.json({ error: 'Gagal mendapatkan token dari Muhammadiyah ID: ' + tokenResponse.statusText }, tokenResponse.status);
        }

        const tokenData = await tokenResponse.json();
        if (!tokenData.access_token) {
            return c.json({ error: 'Respon token tidak valid.' }, 500);
        }

        // 2. Ambil Info Pengguna
        const userResponse = await fetch(DIASMU_USERINFO_ENDPOINT, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + tokenData.access_token
            }
        });

        if (!userResponse.ok) {
            return c.json({ error: 'Gagal mendapatkan profil pengguna: ' + userResponse.statusText }, userResponse.status);
        }

        const userData = await userResponse.json();

        // Cari user berdasarkan email (diutamakan) atau sso_id jika kita menyimpannya
        const email = userData.email || '';
        // Karena schema table users default di cmsMu tidak memiliki sso_id, kita cek berdasarkan email
        // Atau jika tidak ada email, generate username otomatis
        const username = email || (userData.name ? userData.name.toLowerCase().replace(/\\s+/g, '.') : 'user.sso');

        let user: any = await c.env.DB.prepare('SELECT id, username, email, role, name, avatar FROM users WHERE email = ? OR username = ?')
            .bind(email, username).first();

        const ssoName = userData.name || username;
        const ssoAvatar = userData.picture || '';

        // 3. Auto-Register Jika User Tidak Ditemukan
        if (!user) {
            const defaultRole = 'subscriber';

            // Simpan ke DB dengan password dummy yang mustahil diketik
            const randomPassword = 'SSO_' + crypto.randomUUID();

            const res = await c.env.DB.prepare(
                'INSERT INTO users (username, password_hash, email, role, name, avatar, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
            ).bind(username, randomPassword, email, defaultRole, ssoName, ssoAvatar, new Date().toISOString()).run();

            if (!res.success) {
                return c.json({ error: 'Gagal melakukan auto-registrasi SSO' }, 500);
            }

            // Fetch kembali setelah insert untuk mendapatkan ID
            user = await c.env.DB.prepare('SELECT id, username, email, role, name, avatar FROM users WHERE username = ?')
                .bind(username).first();

            // Tambahkan notifikasi pendaftaran baru
            await c.env.DB.prepare("INSERT INTO notifications (title, message, type) VALUES ('Member Baru', ?, 'success')")
                .bind(`${ssoName} baru saja mendaftar via Muhammadiyah ID.`).run();
        } else {
            // Update nama dan avatar terbaru dari SSO jika user sudah ada
            await c.env.DB.prepare('UPDATE users SET name = ?, avatar = ? WHERE id = ?')
                .bind(ssoName, ssoAvatar, user.id).run();
            user.name = ssoName;
            user.avatar = ssoAvatar;

            // Tambahkan notifikasi login
            await c.env.DB.prepare("INSERT INTO notifications (title, message, type) VALUES ('Login Member', ?, 'info')")
                .bind(`${ssoName} baru saja masuk via Muhammadiyah ID.`).run();
        }

        // 4. Generate JWT Token untuk cmsMu
        const sessionUser = { id: user.id, username: user.username, email: user.email, role: normalizeRole(user.role), name: user.name || '', avatar: user.avatar || '' };
        await createSession(c, sessionUser);
        return c.json({
            success: true,
            user: sessionUser
        });

    } catch (e: any) {
        return c.json({ error: 'Terjadi kesalahan sistem saat memproses SSO: ' + e.message }, 500);
    }
});

usersRouter.get('/session', async (c) => {
    const user = await readSession(c);
    return user ? c.json({ authenticated: true, user }) : c.json({ authenticated: false }, 401);
});

usersRouter.post('/logout', async (c) => {
    clearSession(c);
    return c.json({ success: true });
});

export default usersRouter;
