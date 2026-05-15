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
- `VITE_SUPABASE_ANON_KEY` - Supabase browser publishable key. `SUPABASE_ANON_KEY` is also accepted for Vercel Marketplace compatibility.
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase server secret key.
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob read/write token.
- `ADMIN_EMAILS` - comma-separated emails promoted to `admin` on auth sync.
- `SESSION_SECRET` - strong random secret used for server session signing.
- `PII_ENCRYPTION_KEY` - at least 32 characters; required before enabling encrypted PII flows and two-factor authentication.
- `SECURITY_LEAD_PHONE`, `SECURITY_ADMIN_PHONE`, `SECURITY_BACKUP_PHONE` - incident-response escalation contact numbers. These are recommended when no external security contact is configured.
- `SECURITY_EXTERNAL_NAME`, `SECURITY_EXTERNAL_ORGANIZATION`, `SECURITY_EXTERNAL_CONTACT` - optional external incident-response provider details.
- `APP_URL` and `VITE_APP_URL` - deployed or local app URL.

Run the local readiness check before deploying. It reports only variable names
and validation errors; it never prints secret values.

```bash
npm run check:env
npm run check:env -- --strict
```

Use `--strict` when preparing production. Strict mode fails on both required and
recommended missing values, including admin bootstrapping and incident-response
contacts.

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

## Cloudflare Pages Build
Cloudflare Pages should use the same frontend build output as Vercel:

- Build command: `npm run build`
- Build output directory: `dist/public`

The repository includes `wrangler.toml` with `pages_build_output_dir = "./dist/public"` and a required `compatibility_date` so the output directory is explicit for Pages deployments.
The repository also pins the hosted build runtime with `.node-version`.
The Cloudflare `_redirects` file avoids a catch-all rewrite because Pages automatically serves `index.html` for SPA routes when no top-level `404.html` exists.

## Verification Checklist
- `npm run check:env -- --strict`.
- Supabase sign-in, sign-up, sign-out, `/api/v1/auth/me`, and `/api/v1/auth/sync`.
- Role-protected admin, CA, team, and user routes.
- Document upload, private download, delete, and listing via Vercel Blob plus Supabase metadata.
- Public blog/CMS routes, `/sitemap.xml`, `/robots.txt`, `/openapi.json`, `/llms.txt`.
- SPA fallback routes load from `/index.html`.
