# Deployment

## Overview
- Vite builds the client to `dist/public`.
- Vercel serves static assets from `dist/public` on the CDN.
- Express API routes are exposed through `api/index.ts` as a Vercel Node.js Function.
- Data is stored in Supabase Postgres via Drizzle.
- Authentication is handled by Supabase.
- Private user uploads and public CMS media use Vercel Blob.

## Required Environment Variables
Set these in Vercel and in `.env` for local development:

- `DATABASE_URL` - Supabase Postgres connection string for Drizzle.
- `VITE_SUPABASE_URL` - Supabase project URL. `SUPABASE_URL` is also accepted for server-side compatibility.
- `VITE_SUPABASE_ANON_KEY` - Supabase browser publishable key. `SUPABASE_ANON_KEY` is also accepted for Vercel Marketplace compatibility.
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase server secret key.
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob read/write token.
- `ADMIN_EMAILS` - comma-separated emails promoted to `admin` on auth sync.
- `SESSION_SECRET` - strong random secret used for server session signing.
- `PII_ENCRYPTION_KEY` - at least 32 characters; required before enabling encrypted PII flows and two-factor authentication.
- `SECURITY_LEAD_PHONE`, `SECURITY_ADMIN_PHONE`, `SECURITY_BACKUP_PHONE` - incident-response escalation contact numbers. These are recommended when no external security contact is configured.
- `SECURITY_EXTERNAL_NAME`, `SECURITY_EXTERNAL_ORGANIZATION`, `SECURITY_EXTERNAL_CONTACT` - optional external incident-response provider details.
- `APP_URL` and `VITE_APP_URL` - deployed or local app URL.

Optional search-engine variables:

- `VITE_GOOGLE_SITE_VERIFICATION` - Google Search Console HTML verification token when DNS TXT verification is not used.
- `INDEXNOW_KEY` - IndexNow key for Bing and participating search engines. Use 8-128 letters, numbers, or dashes; the server exposes it at `/<INDEXNOW_KEY>.txt`.

Optional WhatsApp client workflow variables:

- `META_WHATSAPP_ACCESS_TOKEN` - Meta WhatsApp Cloud API token for client workflow messages and inbound media.
- `META_WHATSAPP_PHONE_NUMBER_ID` - WhatsApp phone-number ID used by the Graph API send and media endpoints.
- `META_WHATSAPP_BUSINESS_ACCOUNT_ID` - WhatsApp Business Account ID for template and account operations.
- `META_WHATSAPP_VERIFY_TOKEN` - webhook verification token for `/api/whatsapp/client/webhook`.
- `META_APP_SECRET` - Meta app secret used to validate `X-Hub-Signature-256`.
- `META_WHATSAPP_GRAPH_VERSION` - Graph API version, for example `v23.0`.
- `VITE_WHATSAPP_PUBLIC_NUMBER` - public WhatsApp number used by website `wa.me` links.

Run the local readiness check before deploying. It reports only variable names
and validation errors; it never prints secret values.

```bash
npm run check:env
npm run check:env -- --strict
```

Use `--strict` when preparing production. Strict mode fails on both required and
recommended missing values, including admin bootstrapping and incident-response
contacts.

In `NODE_ENV=production`, the server fails startup when any required env var is
missing. The backend also refuses to use hardcoded Supabase fallback values in
production, so Vercel env values must be present before deployment.

## Local Development
```bash
npm install
npm run dev
```

The local Express server listens on port `5000`.

## Database
```bash
npm run db:generate
npm run db:migrate
```

After pulling Vercel preview envs locally, use:

```bash
npm run db:migrate:preview
npm run db:seed:preview
```

Use a fresh Supabase database for this migration. Legacy provider data is not imported.

## Vercel Build
```bash
npm run build
vercel build
```

After a production deploy, verify that the canonical domain and the Vercel alias
serve the same SEO shell for priority search routes:

```bash
npm run check:priority-structured-data
npm run check:seo-deployment-parity
npm run check:indexnow-key
npm run check:search-goal-readiness
```

`check:priority-structured-data` verifies that priority ITR shells emit the
expected JSON-LD types without duplicate `@id` identities or relative schema
URLs. `check:seo-deployment-parity` compares `https://myeca.in` with
`https://myeca12-04.vercel.app` by default and fails when the custom domain is
still on an older deployment. If it fails with a domain-access problem, update
the alias from the Vercel account that owns `myeca.in`, then rerun the parity
check. `check:search-goal-readiness` is the final evidence gate; it is expected
to fail until Google/Bing owner evidence, field INP, IndexNow submission,
custom-domain parity, and a live-valid ITR outreach tracker are all recorded.
It requires the full Google and Bing evidence checklist, and rejects repo-only
statuses for owner-side milestones, so account evidence rows need `recorded` or
`live_verified` proof before completion can be claimed.
Run `check:indexnow-key` only after `INDEXNOW_KEY` is set in the deployment
environment; the output redacts the key-file URL while proving the file is live.

## Cloudflare Pages Build
Cloudflare Pages should use the same frontend build output as Vercel:

- Build command: `npm run build`
- Build output directory: `dist/public`
- Root directory: repository root
- Build system version: latest/v3 build image
- Node.js version: `22.16.0`

The repository includes `wrangler.toml` with `pages_build_output_dir = "./dist/public"` and a required `compatibility_date` so the output directory is explicit for Pages deployments.
The repository also pins the hosted build runtime with `.node-version`, `.nvmrc`, and `package.json` `engines.node`.
The Cloudflare `_redirects` file avoids a catch-all rewrite because Pages automatically serves `index.html` for SPA routes when no top-level `404.html` exists.

Validate the Cloudflare Pages output from GitHub Actions or locally:

```bash
npm run test:cloudflare-pages
```

This command runs the production build, starts `wrangler pages dev` against `dist/public`, checks for invalid redirect rules, and verifies that a deep SPA route plus a built asset return 2xx.

If the external Cloudflare Pages GitHub App check fails instantly while `Cloudflare Pages Validate` passes, inspect the Cloudflare dashboard deployment log for account-side settings that are not visible in GitHub, especially project build command/output directory, root directory, build system version, preview branch controls, GitHub App installation access, environment-variable requirements, and Pages project connection state.

## Verification Checklist
- `npm run check:env -- --strict`.
- Confirm production API responses include `X-Request-Id`, and backend error JSON includes `requestId`.
- Supabase sign-in, sign-up, sign-out, `/api/v1/auth/me`, and `/api/v1/auth/sync`.
- Role-protected admin, CA, team, and user routes.
- Document upload, private download, delete, and listing via Vercel Blob plus Supabase metadata.
- Public blog/CMS routes, `/sitemap.xml`, `/robots.txt`, `/openapi.json`, `/llms.txt`.
- SPA fallback routes load from `/index.html`.
