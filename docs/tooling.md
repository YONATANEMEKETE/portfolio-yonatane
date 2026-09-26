# Tooling & quality gates

Last updated: 2026-09-26 · Status: **executed** — M1 repo setup done. This file records what was set up and why.

## Version pinning

| Thing                      | Pin                           | Where                            | Notes                                                                                                                              |
| -------------------------- | ----------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Node                       | ≥ 24 (`engines.node: ">=24"`) | `package.json` + `.nvmrc` = `24` | CI runs the 24 LTS line — same as Vercel's default (24.x). Local Node 26 also satisfies the range.                                 |
| pnpm                       | `12.6.0` (+ sha512)           | `packageManager` field           | Already self-enforcing locally — the system `pnpm` _is_ the corepack shim. CI installs the pinned version via `pnpm/action-setup`. |
| Next.js / React / Tailwind | 16.3.6 / 19.2.8 / 4.3.3       | package.json + lockfile          | The lockfile is the real dependency pin.                                                                                           |
| App deps                   | caret + committed lockfile    | `pnpm-lock.yaml`                 | CI installs with `--frozen-lockfile`.                                                                                              |

Versions at setup: husky 9.1.7 · lint-staged 17.5.1 · commitlint 21.2.3 · prettier 3.9.9 · prettier-plugin-tailwindcss 0.8.1 · eslint-config-prettier 10.1.8 · vitest 5.0.1 · shadcn 4.21.0 · motion 13.4.3 · zod 4.6.5 · react-hook-form 7.88.0 · @hookform/resolvers 5.9.1 · @node-rs/argon2 2.2.1.

## Platform notes

- **ESLint stays on 9.x.** Upgrading to 10 was attempted and reverted: `eslint-config-next`'s bundled plugins (`eslint-plugin-react`, `-import`, `-jsx-a11y`) crash under ESLint 10 until they catch up. Revisit when Next ships ESLint-10-compatible config.
- **shadcn CLI v4** changed its `init` flags: `-b` = component base (`radix | base | aria`), preset chosen via `-p`. Setup ran `shadcn init -b radix -p nova`.
- **Next 16 realities:** `next lint` is removed (use `eslint .`); `next build` no longer lints; `next typegen` generates route types without a build (used in `typecheck`); Turbopack is the default bundler; `next-env.d.ts` churns between `dev` and `typegen` runs → gitignored.
- `@types/node` pinned to `^24` (vitest 5 requires `^22 || >=24`).

## Scripts

| Script                | Runs                                                                                          |
| --------------------- | --------------------------------------------------------------------------------------------- |
| `format`              | `prettier --write .`                                                                          |
| `format:check`        | `prettier --check .`                                                                          |
| `lint` / `lint:fix`   | `eslint .` / `eslint . --fix`                                                                 |
| `typecheck`           | `next typegen && tsc --noEmit`                                                                |
| `test` / `test:watch` | `vitest run` / `vitest`                                                                       |
| `audit`               | `pnpm audit --audit-level=high`                                                               |
| **`check`**           | format:check → lint → typecheck → test → build → audit (the full gate — CI runs exactly this) |

## Hooks (husky)

| Hook       | Runs                                                            | Why                                                                                       |
| ---------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| pre-commit | `lint-staged` (eslint --fix + prettier --write on staged files) | fast; keeps junk out of commits                                                           |
| commit-msg | `commitlint` (Conventional Commits)                             | commit rules enforced, not just documented                                                |
| pre-push   | `pnpm check`                                                    | the real gate — pushes go straight to `main`, so the local hook is what prevents breakage |

`HUSKY=0` in CI. `--no-verify` for emergencies only.

## CI — `.github/workflows/ci.yml`

`actions/checkout@v7` → `pnpm/action-setup@v6` (reads `packageManager`) → `actions/setup-node@v7` (`node-version-file: .nvmrc`, pnpm cache) → `pnpm install --frozen-lockfile` → `pnpm check` (includes the build). Triggers on push + PR; superseded runs are cancelled.

## Convention files

- `CONTRIBUTING.md` — commit + branch rules (enforced by commitlint).
- `README.md` — stack, scripts, gates.
- `.env.example` — env var template (filled in M3/M5).

## Deviations from the original step list

- **ESLint 9 kept** (10 attempted → plugin crash) — see platform notes.
- **`@types/node` 24** — vitest peer requirement.
- **shadcn flags** — CLI changed: `-b radix -p nova`.
- **No fnm** — `engines.node >= 24` lets local Node 26 stay; CI/Vercel run 24 LTS.
- **`check` includes `build`**; the separate `verify` script was dropped as redundant (per review).
- Environment setup executed: pnpm pinned via corepack (`corepack use pnpm@12.6.0`), hooks scaffolded, docs updated.
