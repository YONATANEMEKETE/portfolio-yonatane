# Architecture

Last updated: 2026-09-26 · Status: draft v2 (post-review) — M0

## Summary

One repo, one Next.js app. The public site, the `/manage` admin area, and every backend endpoint ship as a single deployable — no separate API service, no second codebase.

_Why:_ one deploy, one auth story, no CORS between services. Scale is irrelevant for a personal site; simplicity wins.

- **Framework:** Next.js 16 (App Router), TypeScript (strict)
- **Styling:** Tailwind CSS (+ `@tailwindcss/typography` for content) + shadcn/ui (admin forms, dialogs, tables)
- **Database:** Neon Postgres via Prisma — articles + auth state only
- **Hashing:** argon2id (`@node-rs/argon2`) for the passcode
- **Email:** Resend (recovery + verification links)
- **Hosting:** Vercel · **Dev:** local (`pnpm dev`) against a Neon dev branch

## Routes

Public (one page carries the portfolio):

| Route              | Content                                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------------------- |
| `/`                | Everything: hero/about, experience, skills, projects, latest articles, contact — sections navigated by anchors |
| `/projects/[id]`   | Project case study (`content/projects/<id>.md`)                                                                |
| `/articles`        | All articles (paginated)                                                                                       |
| `/articles/[slug]` | A single article (from DB)                                                                                     |

Private (`noindex`, its own sidebar layout):

| Route               | Purpose                                                                                        |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| `/manage`           | Dashboard: article list with All / Drafts / Published filters + recovery-emails card           |
| `/manage/new`       | New article                                                                                    |
| `/manage/edit/[id]` | Edit article                                                                                   |
| `/manage/login`     | Passcode login                                                                                 |
| `/manage/reset`     | Without token: pick a masked recovery email, request link. With `?token=…`: set a new passcode |

## Repo layout

```
portfolio-yonatane/
├─ content/                      markdown content, committed (edited via git, not /manage)
│  ├─ about.md
│  ├─ experience.md
│  ├─ skills.md
│  └─ projects/
│     ├─ shipyard.md             frontmatter + case-study body
│     └─ …
├─ src/
│  ├─ app/
│  │  ├─ (site)/                 public — own layout (nav + footer)
│  │  │  ├─ page.tsx             the whole portfolio
│  │  │  ├─ articles/page.tsx
│  │  │  ├─ articles/[slug]/page.tsx
│  │  │  └─ projects/[id]/page.tsx
│  │  ├─ manage/                 private — own layout (sidebar), noindex
│  │  │  ├─ page.tsx             article list + filters + recovery emails
│  │  │  ├─ new/page.tsx
│  │  │  ├─ edit/[id]/page.tsx
│  │  │  ├─ login/page.tsx
│  │  │  ├─ reset/page.tsx
│  │  │  └─ actions.ts           Server Actions (article CRUD, logout, reset, emails)
│  │  └─ api/auth/               Route Handlers: login · recover
│  ├─ components/
│  │  ├─ site/                   public chrome + sections
│  │  ├─ ui/                     shadcn components
│  │  └─ Markdown.tsx            the one shared renderer
│  └─ lib/                       db · auth · email · markdown · content · validation
├─ prisma/                       schema · migrations · seed
├─ scripts/                      one-off ops (set-passcode)
├─ docs/                         this planning set
└─ public/
```

`(site)` is a route group — keeps public pages under their own layout without affecting URLs.

## Rendering & data flow

| Concern                    | Mechanism                                                                         |
| -------------------------- | --------------------------------------------------------------------------------- |
| Static sections + projects | Markdown files in `content/`, read at build time, rendered by the shared pipeline |
| Articles                   | Markdown in DB → same pipeline                                                    |
| `/manage` writes           | Forms → Server Actions (Zod-validated) → Prisma → revalidate                      |
| Auth endpoints             | Route Handlers under `/api/auth/*` (rate-limited, easy to test with curl)         |
| `/manage` protection       | Session check in the `/manage` layout (server-side), no middleware                |

```
Browser ──▶ Server Component ──▶ Prisma ──▶ Neon        (article reads)
   │               ▲
   │ form post     │ revalidateTag('articles')
   ▼               │
Server Action ─▶ Prisma write ─▶ revalidate ◀── done, public page is fresh in seconds
```

## Markdown pipeline (one place, used everywhere)

`src/lib/markdown.ts` + `<Markdown>` component:

- **Sources:** `content/**/*.md` (about, experience, skills, projects) and `Article.body` (DB).
- **Pipeline:** gray-matter (frontmatter) → remark-gfm → rehype-sanitize → rehype-pretty-code (Shiki) for code blocks.
- **Styling:** Tailwind Typography (`prose`) themed to the design tokens; headings, lists, code, tables, quotes styled **once**.
- Effect: making content look good = styling markdown, not styling each page. Plain markdown, not MDX — no arbitrary components inside content.

## Caching & revalidation

- `content/` markdown is static — rendered at build time.
- Article queries are wrapped in Next's data cache, tagged `articles` and `article:<slug>`.
- Every create / update / delete / publish calls `revalidateTag(...)`, so the public site reflects an edit within seconds — no redeploy.
- Drafts never render publicly; public queries filter `status = PUBLISHED`.

_Exact cache API (`use cache` vs `unstable_cache`) pinned in M3 against the installed Next version._

## Key dependencies

`next` · `react` · `typescript` · `tailwindcss` + `@tailwindcss/typography` · shadcn/ui (+ Radix, lucide-react) · `prisma` + `@prisma/client` · `@node-rs/argon2` · `resend` · `zod` · `gray-matter` · remark/rehype set (`remark-gfm`, `rehype-sanitize`, `rehype-pretty-code`).

## Config & env vars

Committed `.env.example`; real values in `.env.local` (gitignored) and Vercel project settings.

| Var                    | Purpose                                      |
| ---------------------- | -------------------------------------------- |
| `DATABASE_URL`         | Neon pooled connection (runtime)             |
| `DIRECT_URL`           | Neon direct connection (migrations)          |
| `RESEND_API_KEY`       | Resend API key                               |
| `EMAIL_FROM`           | Sender address (e.g. `portfolio@yourdomain`) |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin — emails, sitemap, metadata |

Recovery recipients are **not** an env var — they live in the DB and are managed from `/manage` (see `auth.md`).

## Deployment

- **Vercel** ← GitHub repo; framework auto-detected; `prisma generate` on build.
- **Neon:** one project; `main` branch = production, `dev` branch for local work.
- **Migrations** run from local dev against the right branch (`prisma migrate dev` to create, `migrate deploy` when releasing). No CI wiring in v1.
- Serverless note: runtime uses the pooled URL; free-tier Neon can sleep, so the first hit after idle may take ~1s.

## Conventions

- Package manager: `pnpm`. Scripts: `dev`, `build`, `lint`, `typecheck`, `db:migrate`, `db:seed`, `set-passcode`.
- Branch: `main` (renamed from `master` in M0). One or a few clear commits per milestone; branch only for risky experiments.
- Content edits (`content/*.md`) are commits; articles are edited in `/manage`.
- Docs here are revised as decisions land — architecture changes update this file in the same commit.
