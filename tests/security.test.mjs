import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(async entry => {
    const item = path.join(dir, entry.name);
    return entry.isDirectory() ? files(item) : [item];
  }))).flat();
}

test('source does not use browser persistence APIs', async () => {
  const source = path.join(root, 'src');
  const matches = [];
  for (const file of await files(source)) {
    if (!/\.(?:ts|tsx|astro|js|mjs)$/.test(file)) continue;
    const content = await readFile(file, 'utf8');
    if (/\b(?:localStorage|sessionStorage|caches\.)\b/.test(content)) matches.push(file);
  }
  assert.deepEqual(matches, []);
});

test('active authentication has no known default secret or base64 identity token', async () => {
  const auth = await readFile(new URL('../src/cms/middleware/auth.ts', import.meta.url), 'utf8');
  const users = await readFile(new URL('../src/cms/modules/users/users.router.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(auth + users, /labmu_rahasia|btoa\(JSON\.stringify/);
  assert.match(auth, /httpOnly:\s*true/);
  assert.match(auth, /sameSite:\s*'Strict'/);
  assert.match(users, /const ITERATIONS = 100_000/);
  assert.doesNotMatch(users, /Gagal Login:\s*['"]?\s*\+\s*e\.message/);
});

test('runtime core has no destructive schema endpoint', async () => {
  const core = await readFile(new URL('../src/cms/index.ts', import.meta.url), 'utf8');
  const media = await readFile(new URL('../src/cms/modules/media/media.router.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(core, /sys\/install|updateSchema/);
  assert.doesNotMatch(media, /DROP TABLE/);
});

test('build pipeline explicitly disables browser and edge caching', async () => {
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  const script = await readFile(new URL('../scripts/disable-cache.mjs', import.meta.url), 'utf8');
  assert.match(pkg.scripts.build, /disable-cache/);
  assert.match(script, /no-store/);
});

test('post comment toggle is persisted and public comments honor it', async () => {
  const editor = await readFile(new URL('../src/cms/modules/admin/ui/blocks/editor.page.ts', import.meta.url), 'utf8');
  const posts = await readFile(new URL('../src/cms/modules/posts/posts.router.ts', import.meta.url), 'utf8');
  const publicRouter = await readFile(new URL('../src/cms/modules/public/public.router.ts', import.meta.url), 'utf8');
  assert.match(editor, /allow_comments:\s*Number\(this\.form\.allow_comments\)/);
  assert.match(editor, /role="switch"/);
  assert.match(editor, /display:flex !important; justify-content:center; align-items:center/);
  assert.match(posts, /allow_comments\s*=\s*\?/);
  assert.match(publicRouter, /Number\(content\.allow_comments\) !== 1/);
  assert.match(publicRouter, /id="cmsmu-comments"/);
});
