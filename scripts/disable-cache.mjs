import { mkdir, writeFile } from 'node:fs/promises';

const policy = `/*
  Cache-Control: no-store, max-age=0
  Pragma: no-cache
  Expires: 0
`;

await mkdir('dist/client', { recursive: true });
await writeFile('dist/client/_headers', policy);
await writeFile('dist/_headers', policy);
