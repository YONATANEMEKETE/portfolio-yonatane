# portfolio-yonatane

Personal portfolio — one Next.js app serving the public site, the articles, and a private `/manage` CMS.

> Work in progress. Planning lives in [`docs/`](./docs) — start with [`docs/plan.md`](./docs/plan.md).

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS + shadcn/ui · Prisma + Neon Postgres (M3) · argon2id · Resend (M5) · Vercel.

## Getting started

Node ≥ 24 (see `.nvmrc`) and pnpm — the pnpm version is pinned via `packageManager` and activated automatically by corepack.

```bash
pnpm install
pnpm dev
```

## Scripts

| Command                             | What it does                                                          |
| ----------------------------------- | --------------------------------------------------------------------- |
| `pnpm dev`                          | dev server (Turbopack)                                                |
| `pnpm build` / `pnpm start`         | production build / serve                                              |
| `pnpm lint` / `pnpm lint:fix`       | ESLint                                                                |
| `pnpm format` / `pnpm format:check` | Prettier                                                              |
| `pnpm typecheck`                    | `next typegen` + `tsc --noEmit`                                       |
| `pnpm test` / `pnpm test:watch`     | Vitest                                                                |
| `pnpm audit`                        | dependency audit (fails on high severity)                             |
| `pnpm check`                        | the full gate: format:check + lint + typecheck + test + build + audit |

## Quality gates

pre-commit → lint-staged · commit-msg → commitlint · pre-push → `pnpm check` · CI → `pnpm check`. Details in [`CONTRIBUTING.md`](./CONTRIBUTING.md).
