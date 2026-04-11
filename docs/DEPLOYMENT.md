# Deployment

## Overview
- Vite builds the client to `dist/public`.
- Vercel serves static assets from `dist/public` on the CDN.
- Express API routes are exposed through `api/index.ts` as a Vercel Node.js Function.
- Data is stored in Neon Postgres via Drizzle.
- Authentication is handled by Clerk.
- Private user uploads and public CMS media use Vercel Blob.

## Required Environment Variables
Set these in Vercel and in `.env` for local development:

- `DATABASE_URL` - Neon Postgres connection string. `POSTGRES_URL` and `POSTGRES_URL_NON_POOLING` are also accepted when provisioned by Vercel Marketplace.
- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk browser publishable key. `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is also accepted for Vercel Marketplace compatibility.
- `CLERK_SECRET_KEY` - Clerk server secret key.
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob read/write token.
- `ADMIN_EMAILS` - comma-separated emails promoted to `admin` on auth sync.
- `APP_URL` and `VITE_APP_URL` - deployed or local app URL.

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

Use a fresh Neon database for this migration. Legacy provider data is not imported.

## Vercel Build
```bash
npm run build
vercel build
```

## Verification Checklist
- Clerk sign-in, sign-up, sign-out, `/api/v1/auth/me`, and `/api/v1/auth/sync`.
- Role-protected admin, CA, team, and user routes.
- Document upload, private download, delete, and listing via Vercel Blob plus Neon metadata.
- Public blog/CMS routes, `/sitemap.xml`, `/robots.txt`, `/openapi.json`, `/llms.txt`.
- SPA fallback routes load from `/index.html`.
