# Data model

Last updated: 2026-09-26 · Status: draft v2 (post-review) — M0

Two kinds of data:

1. **Static content** — markdown files in `content/` (no DB).
2. **Database** — articles + auth state, Postgres via Prisma.

---

## 1. Static content (markdown files)

Everything that isn't an article is markdown, rendered through the same pipeline as articles.

| File                       | Shape                                                                                    |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| `content/about.md`         | free-form markdown; headings structure the section                                       |
| `content/experience.md`    | free-form markdown (one file for now — split per role later only if it becomes unwieldy) |
| `content/skills.md`        | free-form markdown                                                                       |
| `content/projects/<id>.md` | frontmatter + case-study body                                                            |

Project frontmatter:

```md
---
id: shipyard # URL identifier → /projects/shipyard
name: Shipyard
tagline: Project management for small engineering teams
year: '2025'
stack: [Next.js, TypeScript, Postgres, Prisma]
featured: true # shown on the home page
links:
  live: https://…
  repo: https://github.com/…
---

Case study in markdown — anything goes.
```

- Listing cards read **frontmatter**; `/projects/[id]` renders a header from frontmatter + the rendered **body**.
- Decisions: markdown everywhere (style once, looks good everywhere); human-readable ids in URLs; plain markdown, not MDX (no arbitrary components inside content — nothing to abuse, nothing to maintain).

---

## 2. Database (Prisma → Neon Postgres)

```prisma
enum Status { DRAFT PUBLISHED }

model Article {
  id          String    @id @default(cuid())
  slug        String    @unique            // URL identifier → /articles/<slug>
  title       String
  excerpt     String?
  body        String                       // markdown source
  tags        String[]
  status      Status    @default(DRAFT)
  publishedAt DateTime?                    // set once, on first publish
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  @@index([status, publishedAt])
}

model AuthConfig {                         // exactly one row (id = 1)
  id           Int      @id @default(1)
  passcodeHash String                      // argon2id PHC string: $argon2id$v=19$m=19456,t=2,p=1$…
  updatedAt    DateTime @updatedAt
}

model Session {
  id         String   @id @default(cuid())
  tokenHash  String   @unique              // sha256 of the cookie token
  createdAt  DateTime @default(now())
  expiresAt  DateTime                      // 30 days
}

model OneTimeToken {                       // recovery + email verification links
  id               String    @id @default(cuid())
  tokenHash        String    @unique       // sha256
  purpose          String                  // "passcode-reset" | "email-verify"
  recipientEmailId String?                 // set for email-verify
  expiresAt        DateTime                // 15 min (reset) · 24 h (verify)
  usedAt           DateTime?
  createdAt        DateTime  @default(now())
}

model RecipientEmail {                     // Yonatane's own addresses for reset links
  id         String    @id @default(cuid())
  email      String    @unique             // plaintext — we must send mail to it
  verifiedAt DateTime?                     // only verified addresses are selectable for reset
  createdAt  DateTime  @default(now())
}

model LoginAttempt {                       // throttling for login + recovery
  id        String   @id @default(cuid())
  ip        String
  kind      String                         // "login" | "recover"
  createdAt DateTime @default(now())
  @@index([kind, ip, createdAt])
}
```

### Why each choice

- **Single-user, no User table.** One owner; a `User` row would be ceremony. `AuthConfig` holds the one passcode hash.
- **argon2id, stored as a PHC string.** Memory-hard, current best practice for low-entropy secrets like passcodes. The PHC format records its own parameters, so they can be raised later without a migration.
- **Passcode hash in the DB, not an env var.** Recovery can rotate the passcode without a redeploy. Still a hash — plaintext never touches the database.
- **Session/reset tokens are 256-bit random, stored as SHA-256.** Slow KDFs exist to protect _guessable_ secrets; a 256-bit random token can't be guessed, so a fast hash at rest is enough.
- **`RecipientEmail` in plaintext.** The server must be able to send to it. Masking happens on the way out — raw addresses never reach an unauthenticated client (rule in `auth.md`). Verification-on-add prevents a typo'd address from becoming a reset link to a stranger.
- **`OneTimeToken` is shared** between reset and verification — same lifecycle (random, hashed, expiring, single-use), two purposes.
- **`tags` as a Postgres array; `body` as markdown** — right-sized for a personal site; HTML never rendered from DB content.
- **`publishedAt` set once** on first publish — a post's birthday doesn't move when you fix a typo.

### Operational notes

- Migrations from local dev against Neon (`prisma migrate dev` → `migrate deploy` for prod). Two Neon branches: `main` (prod) / `dev` (local + testing).
- Pooled connection at runtime (`-pooler` host + `pgbouncer=true`), direct URL for migrations — exact params pinned in M3.
- `LoginAttempt` rows pruned opportunistically on each login/recovery request (older than 24 h).
- Escape hatch: `pnpm set-passcode` against any DB always works — you can never be fully locked out of your own repo.
