import { config } from 'dotenv';
import { defineConfig, env } from 'prisma/config';

// Next.js reads .env.local; the Prisma CLI does not, so load both.
config({ path: ['.env.local', '.env'] });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Direct (non-pooled) connection: the pooler can't run migrations.
    url: env('DIRECT_URL'),
  },
});
