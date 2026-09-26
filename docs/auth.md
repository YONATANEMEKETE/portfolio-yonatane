# Auth — passcode login & email recovery

Last updated: 2026-09-26 · Status: draft v2 (post-review) — M0

Single user, so this is hand-rolled (~150 lines, no Auth.js / Better Auth). Lives in `src/lib/auth.ts` + the auth routes/actions.

## Constants

| Setting           | Value                                         | Notes                                                             |
| ----------------- | --------------------------------------------- | ----------------------------------------------------------------- |
| Passcode          | min 8, max 128 chars                          | hashed with **argon2id**                                          |
| Argon2id params   | m = 19456 KiB (19 MiB), t = 2, p = 1          | OWASP baseline; stored in the PHC string, raisable later          |
| Hash library      | `@node-rs/argon2`                             | prebuilt binaries for Vercel's Linux runtime (fallback: `argon2`) |
| Session lifetime  | 30 days, fixed (no sliding)                   | logout = row deleted + cookie cleared                             |
| Session token     | 32 random bytes, base64url; stored as SHA-256 | cookie `pf_session`, HttpOnly, SameSite=Lax, `Secure` in prod     |
| Reset link        | 15 min expiry, single-use                     | requesting a new link invalidates older unused ones               |
| Email-verify link | 24 h expiry, single-use                       | sent when an address is added in `/manage`                        |
| Login throttle    | 5 failed tries / 15 min                       | then 429 "try again in X"                                         |
| Recovery throttle | 3 requests / hour                             | silent-refuse beyond that                                         |
| Recipient emails  | max 5                                         | only **verified** addresses are selectable for reset              |

`crypto.timingSafeEqual` for hash and token comparison.

## Recovery recipients (the picker)

Managed on `/manage` (requires login): add / remove up to 5 addresses. Each new address gets a **verification email** — until it's confirmed (`verifiedAt` set), it is not selectable for reset. _Why: a typo'd address would otherwise mean a reset link — and account access — lands in a stranger's inbox._

### Masking rule (server-side only)

When a logged-out user requests a reset, the server returns the list as `[{ id, masked }]` — raw addresses never leave the server. Masked = first + last char of each part, provider TLD kept:

| Real                 | Shown             |
| -------------------- | ----------------- |
| `yonatane@gmail.com` | `y***e@g***l.com` |
| `ym@outlook.com`     | `y*m@o***k.com`   |
| `a@proton.me`        | `a***@p***n.me`   |

(First+last of _each part_ — enough for you to tell your addresses apart, nothing more.)

## Flows

### 1. Login

`POST /api/auth/login` `{passcode}` →

1. Throttle check (`LoginAttempt` kind=login, ip, last 15 min ≥ 5 → 429).
2. **argon2id verify** against `AuthConfig.passcodeHash` (server-side, always). Failure → record attempt, generic error.
3. Success → create `Session` (random token; hash stored; +30d), set cookie, redirect `/manage`.

### 2. Session check

`/manage` layout (Server Component) reads the cookie → SHA-256 → `Session` lookup → missing/expired → redirect `/manage/login`.

### 3. Recovery (forgot passcode)

**Step 1 — pick a destination.** `/manage/reset` (no token):

- Server renders the masked picker (only verified addresses; if none exist yet, a hint: "log in and add one — or use `pnpm set-passcode`").
- You pick one → `POST /api/auth/recover` `{recipientEmailId}` → server validates the id exists and is verified, creates a `OneTimeToken` (purpose `passcode-reset`, +15 min, invalidating older unused ones), emails `{NEXT_PUBLIC_SITE_URL}/manage/reset?token=…` to the **real** address via Resend.
- Response is always generic ("if that address is set up, a link is on its way").

**Step 2 — set the new passcode.** The emailed link → `/manage/reset?token=…`:

- Validate (exists, unexpired, unused) → form: new passcode + confirm (min 8) → Server Action → marks token used, writes new argon2id hash, **deletes all Sessions**, creates a fresh session (you land logged in).

The passcode itself is never emailed; only a one-time link.

### 4. Logout

Server Action: delete the session row + clear cookie. "Log out everywhere" = delete all `Session` rows (M6).

## Threat notes

- **argon2id** over scrypt (your call): memory-hard, OWASP-recommended params, PHC string is self-describing.
- **No `AUTH_SECRET`, no JWT.** Sessions are random tokens + DB lookup; nothing to sign.
- **No account enumeration:** the recipient list is fixed by you, never user input; responses are generic.
- **CSRF:** Server Actions have built-in origin checks; `/api/auth/*` POSTs also verify the `Origin` header matches `NEXT_PUBLIC_SITE_URL`. `SameSite=Lax`.
- **The picker intentionally exposes masked hints to logged-out visitors** (that's the feature — you may not know your passcode, but you know your addresses). Raw addresses stay server-side; sends are throttled to 3/hour.
- **`/manage` is `noindex`** and not linked from the public site.
- **Brute force:** throttling + min length on a low-entropy passcode. If ever wanted, TOTP 2FA slots into the same table design.

## First passcode (M4)

`pnpm set-passcode` → prompts locally (never in shell history) → argon2id hash → upserts `AuthConfig`. Run once locally, once against prod. Never appears in chat, docs, or commits. Same script is the escape hatch if every other recovery path is unavailable.
