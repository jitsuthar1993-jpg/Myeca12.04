# MyeCA.in - Smart Tax Calculator Platform

A comprehensive tax filing platform with expert CA assistance, smart calculators, and professional financial services.

## Quick Start

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Production build
npm run build
npm run start
```

Windows PowerShell alternative:

```powershell
$env:NODE_ENV='development'; tsx server/index.ts
```

## Project Structure

```text
client/              # React frontend (Vite)
  src/
    components/      # Reusable UI components
    pages/           # Route pages
    hooks/           # Custom React hooks
    lib/             # Utilities and API client
    styles/          # CSS design system
  public/            # Static assets
server/              # Express.js backend
  routes/            # API endpoints
  services/          # Business logic
  db/                # Database operations
shared/              # Shared types and schemas
docs/                # Documentation
dist/                # Production build output
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, TypeScript |
| Styling | TailwindCSS, Radix UI |
| State | TanStack Query, Zustand |
| Backend | Express.js, Node.js |
| Database | Supabase Postgres, Drizzle |
| Auth | Supabase |
| File Storage | Vercel Blob |

## Documentation

| Document | Description |
|----------|-------------|
| [Deployment Guide](docs/DEPLOYMENT.md) | Production deployment instructions |
| [Site Audit](docs/SITE_AUDIT.md) | Visual, backend, flow, link, and performance audit |
| [Design System](docs/DESIGN_SYSTEM.md) | Canonical light-only visual contract |
| [Theming Guide](docs/THEMING_GUIDE.md) | Compatibility pointer to the canonical design system |
| [Database Guide](docs/DatabaseManagement.md) | Database operations |
| [Product Blueprint](docs/MYECA_PRODUCT_BLUEPRINT.md) | Product and workflow blueprint |

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 5000 | Server port |
| `NODE_ENV` | development | Environment |
| `DATABASE_URL` |  | Supabase Postgres connection string |
| `VITE_SUPABASE_URL` |  | Supabase project URL exposed to the browser |
| `VITE_SUPABASE_ANON_KEY` |  | Supabase browser publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` |  | Supabase server secret key |
| `BLOB_READ_WRITE_TOKEN` |  | Vercel Blob upload/download token |
| `ADMIN_EMAILS` |  | Comma-separated emails promoted to admin on auth sync |
| `SESSION_SECRET` |  | Server session signing secret |
| `PII_ENCRYPTION_KEY` |  | At least 32 characters; required for encrypted PII and MFA secrets |
| `BLOG_IMPORT_SECRET` |  | Secret for blog import and webhook endpoints |
| `SECURITY_LEAD_PHONE`, `SECURITY_ADMIN_PHONE`, `SECURITY_BACKUP_PHONE` |  | Recommended incident-response phone numbers when no external security contact is configured |
| `SECURITY_EXTERNAL_NAME`, `SECURITY_EXTERNAL_ORGANIZATION`, `SECURITY_EXTERNAL_CONTACT` |  | Optional external incident-response contact details |

Run `npm run check:env` to validate required environment variables without
printing secret values. Use `npm run check:env -- --strict` before production
deployments. Production startup fails fast when required backend env values are
missing.

## Key Features

- Tax calculators: income tax, HRA, TDS, SIP, EMI, capital gains
- ITR filing: step-by-step guided filing with form selection
- AI assistant: tax chatbot with intelligent suggestions
- Document parser: Form 16, AIS, and bank statement analysis
- Professional services: GST, compliance, and company registration
- Admin dashboard: analytics, user management, and content

## Scripts

```bash
npm run dev                 # Start development server
npm run build               # Build for production
npm run start               # Run production server
npm run check               # TypeScript type checking
npm run check:env           # Validate required env names without printing values
npm run check:size          # Validate production size budgets
npm run test:unit           # Run unit tests
npm run test:e2e            # Build and run Playwright tests
npm run test:smoke          # Run route smoke checks
npm run db:generate         # Generate Drizzle migrations
npm run db:migrate          # Run Drizzle migrations
npm run db:push             # Push database schema
npm run db:migrate:preview  # Run migrations using pulled Vercel preview env
npm run db:seed:preview     # Seed using pulled Vercel preview env
```

## License

MIT License - See LICENSE file for details.

Built for Indian taxpayers: [myeca.in](https://myeca.in)
