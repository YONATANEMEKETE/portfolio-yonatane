/**
 * Set or rotate the /manage passcode directly against whatever DATABASE_URL
 * points at — the initial seed and the permanent escape hatch if every other
 * recovery path is unavailable (auth.md).
 *
 * The passcode comes from SET_PASSCODE in .env.local. When missing, one is
 * generated and appended there. It is never printed: passcodes stay out of
 * chat, docs and shell history.
 *
 * Usage: pnpm set-passcode
 */
import { randomBytes } from 'node:crypto';
import { appendFileSync } from 'node:fs';

import { config } from 'dotenv';

// The Prisma CLI reads env itself; plain tsx does not — load like prisma.config.ts.
config({ path: ['.env.local', '.env'] });

const ENV_KEY = 'SET_PASSCODE';

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

async function main() {
  if (!process.env.DATABASE_URL) {
    fail('DATABASE_URL is not set — run this where .env.local exists.');
  }

  let passcode = process.env[ENV_KEY];

  if (!passcode) {
    // 6 random bytes → 8 url-safe chars; matches the 4–8 rule with room to spare.
    passcode = randomBytes(6).toString('base64url');
    appendFileSync(
      '.env.local',
      `\n# Initial /manage passcode. Change it via /manage/auth, then delete this line.\n${ENV_KEY}=${passcode}\n`,
    );
    console.log(
      `Generated a passcode and wrote it to .env.local as ${ENV_KEY} (not printed here).`,
    );
  } else {
    console.log(`Using ${ENV_KEY} from the environment.`);
  }

  if (passcode.length < 4 || passcode.length > 8) {
    fail(`${ENV_KEY} must be 4–8 characters (got ${passcode.length}).`);
  }

  const { hash } = await import('@node-rs/argon2');
  const { PrismaClient } = await import('../src/generated/prisma/client');
  const { PrismaPg } = await import('@prisma/adapter-pg');

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  });

  const passcodeHash = await hash(passcode);

  await prisma.authConfig.upsert({
    where: { id: 1 },
    create: { id: 1, passcodeHash },
    update: { passcodeHash },
  });

  console.log('AuthConfig upserted — the passcode is now live.');
  await prisma.$disconnect();
}

void main();
