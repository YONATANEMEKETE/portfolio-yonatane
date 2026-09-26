# Plan — portfolio rebuild

Last updated: 2026-09-26 · Status: **M1 in progress** — M0 docs approved; repo + tooling set up (see `docs/tooling.md`); first deploy pending

## What we're building

A single Next.js app that is both the portfolio and its own backend:

- **Static sections** — about, experience, skills, projects — authored as **markdown files** in `content/` (no database).
- **Articles** — markdown stored in Postgres; listed on `/articles` and on the home page.
- **`/manage`** — private area: article list with filters, editor (`/manage/new`, `/manage/edit/[id]`), recovery-email list — behind a passcode login with email recovery.

Decided stack (details in `architecture.md`): Next.js 16 (App Router) · TypeScript · Tailwind + shadcn/ui · Prisma + Neon Postgres · argon2id hashing · Resend · Vercel.

## Working agreements

- **Specs before code.** Each milestone starts with its scope (below) reviewed before building.
- **Nothing is committed or pushed without asking first.**
- Deploy early and continuously: production exists from M1; every later milestone ships into it.
- Order of work is fixed; scope can be cut, never silently added.

## Milestones

### M0 — Decisions + docs ✓ done

**Scope:** lock stack; write `docs/` (plan, architecture, data-model, auth, design stub); rename branch to `main`.
**Done when:** docs reviewed and approved. First commit only on your go.

### M1 — Scaffold + first deploy

**Scope:** `create-next-app` (App Router, TS, Tailwind), shadcn/ui init, site chrome (nav/footer), placeholder route for every page in `architecture.md`, GitHub remote, Vercel project, first production deploy.
**Done when:** placeholder site live on a Vercel URL; repo pushed.

### M2 — Static sections (markdown content)

**Scope:** real content as markdown — `content/about.md`, `experience.md`, `skills.md`, `content/projects/*.md` (frontmatter + case-study body, mined from `portfolio-ymk` git history); the shared Markdown pipeline + typography styling; home page = everything (hero/about, experience, skills, projects, article slots, contact); `/projects/[id]` detail pages.
**Done when:** all content pages correct on mobile + desktop with real copy.

### M3 — Database + articles (read path)

**Scope:** Prisma schema + first migration; Neon set up (prod branch + dev); seed 2–3 articles; `/articles` list (paginated) + `/articles/[slug]` + the home page's articles section — same Markdown pipeline as static content; caching + revalidation tags.
**Done when:** published posts render from Neon in production; editing a row changes the live site after revalidation.

### M4 — Passcode login

**Scope:** argon2id hashing (`@node-rs/argon2`); auth tables in use; set-passcode script; `/manage/login`; session cookie; `/manage` locked and `noindex`; logout; login throttling; unit tests for auth helpers.
**Done when:** unauthenticated `/manage` redirects to login; correct passcode gets in; 5 wrong tries lock out for 15 min.

### M5 — Email recovery

**Scope:** Resend integration; recovery-email manager on `/manage` (add/remove addresses, each confirmed via its own verification link); "forgot passcode" → pick a **masked** recipient → one-time link → set new passcode (invalidates old sessions); request throttling; real inbox round-trip test.
**Done when:** a real email arrives at a chosen, verified address; the link works once; expired/used links are rejected.

### M6 — `/manage` CMS

**Scope:** `/manage` article list with All / Drafts / Published filters; editor at `/manage/new` + `/manage/edit/[id]` — title, slug (auto + editable), excerpt, markdown body with preview, tags, publish/unpublish; delete with confirm; publish revalidates the public site instantly; "log out everywhere".
**Done when:** a post can be written and published entirely from `/manage`, no deploy needed.

### M7 — Launch polish

**Scope:** SEO (metadata, sitemap, robots, RSS, OG images), 404 page, custom domain, analytics (optional), performance pass, final content review.
**Done when:** portfolio live on its domain; a stranger can find, read, and subscribe to the articles.

## Open items

| #   | Item                                                                                               | Needed by                       |
| --- | -------------------------------------------------------------------------------------------------- | ------------------------------- |
| 1   | Design inspos from Yonatane → `docs/design.md`                                                     | M1 styling                      |
| 2   | ~~GitHub repo name + visibility~~ ✓ created by you (public)                                        | —                               |
| 3   | Custom domain name (do we have one?)                                                               | M7 — earlier helps email sender |
| 4   | OK to mine `portfolio-ymk` git history for old content                                             | M2                              |
| 5   | First passcode chosen (never typed into chat or docs)                                              | M4                              |
| 6   | Confirm: readable slugs in URLs, `/manage/edit/[id]` route name, recovery-emails card on `/manage` | M1                              |
