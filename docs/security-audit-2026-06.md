# Security Audit — Myeca.in

_Date: 2026-06-04 · Branch: codex/production-pwa-conversion_

Full-application review covering both production surfaces (Vercel serverless `api/index.ts`
and the Express server in `server/`), authentication/authorization, the Postgres data layer,
PII handling, file uploads, webhooks, client-side rendering, headers/CSP, secrets, and
dependencies. The platform handles PAN, Aadhaar, bank details, and income data, so
access-control and data-exposure issues are weighted heavily.

Scope note: the live site (myeca.in) is served by the **Vercel function `api/index.ts`**
(see `vercel.json` rewrites). The Express stack in `server/` is the secondary/VPS surface.

## Findings

| # | Severity | Issue | Surface | Status |
|---|----------|-------|---------|--------|
| 1 | High | Privilege escalation: role derived from client-supplied `email` in `/sync` | Both | **Fixed** |
| 2 | High | IDOR: `/api/notifications` & `/api/user/activity` returned all users' records | Vercel (live) | **Fixed** |
| 3 | Medium | Stored XSS: regex blog sanitizer is bypassable (CSP mitigates) | Both | **Fixed** (DOMPurify at sink) |
| 4 | Medium | Postgres TLS verification disabled in prod (`rejectUnauthorized:false`) | Both | **Fixed** (configurable; needs `DATABASE_CA_CERT`) |
| 5 | Medium | No rate limiting on the production serverless API | Vercel (live) | **Mitigated** (per-instance limiter; KV recommended) |
| 6 | Medium | Missing HSTS / hardening headers on Vercel responses | Vercel (live) | **Fixed** |
| 7 | Low-Med | Hardcoded test-user admin tokens gated only by `NODE_ENV` (fail-open) | Both | **Fixed** |
| 8 | Low-Med | WhatsApp webhook fails open when Twilio token unset | Express | **Fixed** |
| 9 | Low | Host-header injection in HTTPS redirect | Express | **Fixed** |
| 10 | Low | 2FA login-verify user enumeration / disable lacks re-auth / not enforced at API boundary | Express | **Fixed** (enumeration + disable re-auth; enforcement documented) |
| 11 | Low | Non-constant-time webhook secret compare; `qs` DoS CVE; upload content-type spoofing | Both | **Fixed** |

---

## Fixed in this change

### 1. Privilege escalation via unverified `email` (High)
Both `/sync` handlers derived the user's role from `req.body.email` via
`getProvisionedRoleForEmail()` / `getBootstrapRoleForEmail()`, then wrote it to the caller's
own record and Supabase `app_metadata`. Any authenticated user could escalate by claiming an
invited/bootstrap admin/CA email.
- `api/index.ts` (`auth-sync`) and `server/routes/auth.ts` (`/sync`) now derive role **and**
  the stored email only from the verified session identity (`user.email` / `auth.email`).
  `body.email` is ignored.

> Data-integrity follow-up: audit existing `users` records for duplicate or mismatched emails
> that may have been set by this path before the fix, and re-verify any unexpected privileged roles.

### 2. IDOR on notifications/activity (High)
`api/index.ts` returned `listCollection("notifications"/"activity_logs", 100)` with no owner
filter, leaking the 100 most recent records across all users to any authenticated caller.
Both routes are now scoped with `.where("userId", "==", user.id)`, matching the Express
implementation in `server/routes/notifications.ts`.

### 3. Stored XSS via bypassable blog sanitizer (Medium)
Blog HTML was rendered with `dangerouslySetInnerHTML` after only the regex `sanitizeHtml`
in `shared/blog.ts`, whose event-handler filter requires whitespace before `on…` — so
`<img/onerror=…>` and `<svg/onload=…>` bypass it. Production CSP (`script-src-attr 'none'`)
mitigated execution, but the primary control was broken.
- The two render sinks (`client/src/components/blog/BlogArticle.tsx`,
  `client/src/pages/blog/[slug].page.tsx`) now pass content through the DOMPurify allowlist
  sanitizer (`client/src/lib/sanitize.ts`) before rendering. Regression tests added in
  `client/src/lib/sanitize.test.ts`.
- Recommended follow-up: also run a real sanitizer server-side in `ensureHtmlContent`
  (`isomorphic-dompurify` / `sanitize-html`) so stored content is clean at write time.

### 4. Database TLS verification (Medium)
`server/db.ts` hardcoded `ssl: { rejectUnauthorized: false }` in production. Now configurable:
full verification (`rejectUnauthorized: true`) is used when `DATABASE_CA_CERT` is set
(Supabase publishes the CA bundle), otherwise it preserves the prior encrypted-but-unverified
behavior to avoid breaking the live connection. **Action required:** set `DATABASE_CA_CERT`
in production to fully close the MITM gap.

### 5. Rate limiting on the serverless API (Medium)
`api/index.ts` had no rate limiting. Added a best-effort, per-instance limiter on the
sensitive routes (`auth-sync`, `auth-logout-event`, `documents-upload`). Because Vercel runs
multiple warm instances, a KV/Redis-backed limiter (e.g. Upstash) is recommended for
cross-instance enforcement.

### 6. HSTS + hardening headers (Medium)
`vercel.json` now sends `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
and `X-Frame-Options: DENY` on all responses.

---

## Low-severity hardening (this change)

- **#7 Test-user tokens** (`shared/temporary-test-users.ts`): new `temporaryTestAuthEnabled()`
  helper changes the gate from fail-open (`NODE_ENV !== "production"`) to fail-closed — tokens
  are honored only when `NODE_ENV === "development"` or `ALLOW_TEMPORARY_TEST_USERS === "true"`,
  and never when `VERCEL_ENV === "production"`. Used by `server/middleware/auth.ts` and
  `api/_test-api.ts`.
- **#8 WhatsApp webhook** (`server/routes/whatsapp.ts`): `validateTwilioSignature` now fails
  closed in production when `TWILIO_AUTH_TOKEN` is unset.
- **#9 Host-header redirect** (`server/middleware/security.ts`): the HTTP→HTTPS redirect only
  echoes the Host header when it is an allowed origin, otherwise uses the canonical host.
- **#10 2FA** (`server/routes/2fa.ts`, `client/src/components/TwoFactorAuth.tsx`):
  `/2fa/login-verify` now returns a uniform failure response (no user/2FA enumeration), and
  `/2fa/disable` now requires re-authentication — a valid current TOTP code or an unused backup
  code (one-time, consumed on use) — with the client prompting for it. **Residual (documented,
  by design):** app-level 2FA is advisory and not enforced at the API token boundary, because a
  valid Supabase access token is the source of truth for API auth.
- **#11 Misc**: blog webhook secret comparison now uses `crypto.timingSafeEqual`
  (`server/routes/blog-webhooks.ts`); `npm audit fix` applied (`qs` DoS resolved — `npm audit`
  reports 0 vulnerabilities); both document upload paths now magic-byte validate the file buffer
  against its declared type (`server/lib/file-signature.ts`), closing the content-type spoofing gap.

## What's already done well

- PII (PAN/Aadhaar/bank) encrypted at rest with AES-256-GCM and masked on output
  (`server/utils/encryption.ts`, `server/routes/profiles.ts`).
- Parameterized SQL throughout the data shim; JSON field names allowlisted by regex; table
  names allowlisted (`server/data-admin.ts`). No SQL injection found.
- Supabase JWTs validated server-side (not just decoded).
- Strong CSP: no inline scripts in prod, `script-src-attr 'none'`, `object-src 'none'`,
  `frame-ancestors 'none'`, `base-uri`/`form-action 'self'`.
- Express routes have solid ownership/role checks (`server/utils/access-control.ts`); admin
  routes gated by `requireAdmin`; document downloads ownership-checked; private blob storage.
- No secrets committed to git (verified across history); `.env*` gitignored; `.env.example` empty.
- Error responses are generic with request IDs (no stack-trace leakage).
