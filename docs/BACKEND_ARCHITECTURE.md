# MyeCA.in Backend Architecture

## Overview

The backend is an Express application exposed on Vercel through `api/index.ts`. Vite serves the React application from `dist/public`, while `/api/*` and generated public assets such as `/sitemap.xml`, `/robots.txt`, `/openapi.json`, and `/llms.txt` are handled by the Vercel Node.js Function.

## Platform

| Area | Current Standard |
| --- | --- |
| Hosting | Vercel static hosting and Vercel Node.js Functions |
| Auth | Supabase bearer-token authentication |
| Roles | Supabase-backed roles: `admin`, `team_member`, `ca`, `user` |
| Database | Supabase Postgres with Drizzle |
| Uploads | Vercel Blob |
| API | Express routes mounted from the shared app entrypoint |

## Request Flow

```text
Browser
  -> Vercel CDN for static assets and SPA routes
  -> Vercel Function for /api/* routes
  -> Supabase token verification middleware
  -> Express route handlers
  -> Supabase repositories or Vercel Blob as needed
```

## Authentication

The frontend keeps the existing `Authorization: Bearer <token>` API contract. The token now comes from Supabase through the client auth adapter. Server middleware verifies the Supabase token and syncs user metadata into Supabase through `/api/v1/auth/sync`.

Admin bootstrapping is controlled by `ADMIN_EMAILS`; legacy password accounts are not migrated and there is no local password auth baseline.

## Data And Uploads

Drizzle migrations define the Postgres schema under `server/db/schema.ts`. Runtime code accepts either `DATABASE_URL` or Vercel Marketplace Supabase aliases such as `DATABASE_URL`.

Private user documents are uploaded to Vercel Blob through authenticated API routes, with ownership metadata stored in Supabase. Public CMS or blog media can use public Blob objects when content must be CDN-addressable.

## Operations

Use these commands for the Vercel preview database after pulling env vars:

```bash
npx vercel env pull .vercel/.env.preview.local --environment=preview --yes
npm run db:migrate:preview
npm run db:seed:preview
```

For local development, run:

```bash
npm install
npm run dev
```

The local server listens on port `5000`.
