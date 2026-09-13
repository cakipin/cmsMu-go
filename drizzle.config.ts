import type { Config } from 'drizzle-kit';

export default {
  schema: './src/cms/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'd1-http',
} satisfies Config;
