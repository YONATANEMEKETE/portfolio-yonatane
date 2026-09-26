# Contributing

Solo repo, but the rules still apply — they're enforced by hooks and CI, not just documented here.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/), enforced by `commitlint` on the `commit-msg` hook.

| Type       | Use for                    |
| ---------- | -------------------------- |
| `feat`     | new user-facing capability |
| `fix`      | bug fix                    |
| `chore`    | tooling, deps, maintenance |
| `docs`     | documentation only         |
| `ci`       | pipeline changes           |
| `refactor` | no behavior change         |
| `perf`     | performance                |
| `test`     | tests only                 |
| `style`    | formatting only            |
| `build`    | build system changes       |

Format: `type(optional-scope): imperative summary` — e.g. `feat(manage): add article filters`.
Keep the summary under ~72 characters; details go in the body.

## Branches

- `main` is the trunk — **pushing directly to `main` is the normal workflow.**
- Use a short-lived branch (`feat/…`, `fix/…`) only when a change is risky enough that you want CI on it _before_ it lands.
- Never force-push `main`.
- `main` stays green: the pre-push hook runs the full check locally, CI verifies after every push.

## Quality gates

| Gate       | Runs                                                    |
| ---------- | ------------------------------------------------------- |
| pre-commit | `lint-staged` — eslint --fix + prettier on staged files |
| commit-msg | `commitlint`                                            |
| pre-push   | `pnpm check`                                            |
| CI         | `pnpm check`                                            |

Bypass with `--no-verify` only for genuine emergencies — CI still runs.

## Scripts

See the scripts table in [`README.md`](./README.md).
