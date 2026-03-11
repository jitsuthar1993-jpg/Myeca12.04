# Deployment

This consolidates previous deployment docs into a single guide for local, production, and Replit.

## Overview
- Client builds to `dist/public` via Vite.
- Server bundles to `dist/index.js` via esbuild.
- Production serves static files from `dist/public` (handled in `server/serveStatic`).
- Default port is `5000`.

## Required Environment Variables
Set the following before running production:
- `JWT_SECRET` — required in production.
- `DATABASE_URL` — e.g. `file:./dev.db` (SQLite) or Postgres URL.
- `NODE_ENV` — `production` for `npm run start`, `development` for local dev.

### Windows note
- PowerShell: `$env:NODE_ENV='development'; tsx server/index.ts`
- CMD: `set NODE_ENV=development && tsx server/index.ts`
- Or install `cross-env` and use it in scripts.

## Local Development
```bash
npm install
npm run dev  # starts Express + Vite dev middleware on port 5000
```
If `npm run dev` fails due to Windows env var syntax, use the PowerShell command above.

## Production Build & Start
```bash
npm ci
npm run build  # produces dist/index.js and dist/public
npm run start  # runs dist/index.js (port 5000)
```

## Static Assets
Place SEO assets in `client/public/` so Vite copies them to `dist/public`:
- `robots.txt`
- `sitemap.xml`
- `manifest.json`
- `sw.js` (if used)

If assets are in the repository root `public/`, move them to `client/public/` before `npm run build`.

## Replit Deployment
- The project includes `.replit` config with:
  - Build: `npm run build`
  - Run: `npm run start`
- Add secrets under Deployments → Environment Variables:
  - `JWT_SECRET` (required)
  - `NODE_ENV=production`
  - `DATABASE_URL` (optional but recommended)

## Troubleshooting
- Port already in use (`EADDRINUSE`): stop the other process, or temporarily change the port in `server/index.ts` for local testing.
- Missing `JWT_SECRET`: set it in environment; production requires it.
- Static files 404 in production: ensure assets are in `client/public/` so they end up in `dist/public`.

## Verification Checklist
- App starts without errors.
- Auth works and JWTs are issued.
- Static pages and assets are served from `dist/public`.
- Database connectivity verified (if applicable).