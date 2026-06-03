# MyeCA VPS Migration Runbook

This folder contains the repo-side artifacts for the staged-hybrid VPS migration.
The main app moves to the Edge/App VPS first, while Supabase Auth/Postgres and
Vercel Blob remain managed for v1. Do not copy real secrets into this repository.
Supabase Auth/Postgres and Vercel Blob remain managed during this first cutover.

## Topology

- Edge/App VPS: Traefik plus the MyeCA Express/Vite app for `myeca.in`,
  `www.myeca.in`, and `edge-staging.myeca.in`.
- Tools VPS: Traefik plus Umami, Listmonk, Chatwoot, n8n, DocuSeal, and Twenty.
- Data layer: staged-hybrid. Keep managed Supabase Auth/Postgres and Vercel Blob
  until the VPS app path has passed production checks.

## Provisioning Order

1. Create both VPSs and open only SSH, 80, and 443.
2. Disable password SSH login, enable unattended security updates, and install
   fail2ban.
3. Install Docker Engine and Docker Compose.
4. Create the external proxy network on each VPS:

```bash
docker network create web
```

5. Copy the matching `.env.example` to `.env` on the server, fill secrets, and
   secure it:

```bash
cp .env.example .env
chmod 600 .env
```

6. Start `ops/vps/edge/compose.yml` on the Edge/App VPS.
7. Start `ops/vps/tools/traefik/compose.yml`, then each tool compose file on the
   Tools VPS.

## DNS And SSL

- Export current Vercel DNS records before changing nameservers.
- Move authoritative DNS to Cloudflare only after the staging host works.
- Start A records as DNS-only so Let's Encrypt HTTP-01 can issue certificates.
- After certificate checks pass, enable the Cloudflare proxy for HTTP/HTTPS
  records and set SSL/TLS to Full strict.
- Keep the Traefik dashboard unexposed. Use an SSH tunnel for inspection.

## Cutover

1. Verify `https://edge-staging.myeca.in/api/health`.
2. Verify login, consultation requests, document upload/download, sitemap,
   robots, `llms.txt`, and priority public routes.
3. Lower TTL, update `myeca.in` and `www.myeca.in` to the Edge/App VPS, then run
   the live verification commands from the project deployment docs.
4. Keep Vercel unchanged as rollback for at least 72 hours.

## Rollback

- Restore the exported Vercel DNS records.
- Keep the Vercel deployment and Supabase/Vercel Blob credentials active until
  the VPS path has passed 72 hours of clean checks.

## Later Phase

After the first cutover is stable, evaluate replacing Vercel Blob with
S3-compatible storage and decide whether auth should remain managed or move to a
self-hosted provider.
