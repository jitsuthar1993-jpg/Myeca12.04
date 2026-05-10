# ðŸ§® MyeCA.in - Smart Tax Calculator Platform

A comprehensive tax filing platform with expert CA assistance, smart calculators, and professional financial services.

## ðŸš€ Quick Start

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Production build
npm run build
npm run start
```

**Windows PowerShell alternative:**
```powershell
$env:NODE_ENV='development'; tsx server/index.ts
```

## ðŸ“ Project Structure

```
â”œâ”€â”€ client/              # React frontend (Vite)
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ components/  # Reusable UI components
â”‚   â”‚   â”œâ”€â”€ pages/       # Route pages
â”‚   â”‚   â”œâ”€â”€ hooks/       # Custom React hooks
â”‚   â”‚   â”œâ”€â”€ lib/         # Utilities & API client
â”‚   â”‚   â””â”€â”€ styles/      # CSS design system
â”‚   â””â”€â”€ public/          # Static assets
â”œâ”€â”€ server/              # Express.js backend
â”‚   â”œâ”€â”€ routes/          # API endpoints
â”‚   â”œâ”€â”€ services/        # Business logic
â”‚   â””â”€â”€ db/              # Database operations
â”œâ”€â”€ shared/              # Shared types & schemas
â”œâ”€â”€ docs/                # Documentation
â””â”€â”€ dist/                # Production build output
```

## ðŸ› ï¸ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, TypeScript |
| Styling | TailwindCSS, Radix UI |
| State | TanStack Query, Zustand |
| Backend | Express.js, Node.js |
| Database | Supabase Postgres, Drizzle |
| Auth | Supabase |
| File Storage | Vercel Blob |

## ðŸ“– Documentation

| Document | Description |
|----------|-------------|
| [Deployment Guide](docs/DEPLOYMENT.md) | Production deployment instructions |
| [Site Audit](docs/SITE_AUDIT.md) | Visual, backend, flow, link, and performance audit |
| [Theming Guide](docs/THEMING_GUIDE.md) | Light mode design system |
| [Design System](docs/DESIGN_SYSTEM.md) | Canonical design system |
| [Database Guide](docs/DatabaseManagement.md) | Database operations |
| [Product Blueprint](docs/MYECA_PRODUCT_BLUEPRINT.md) | Product and workflow blueprint |

## âš™ï¸ Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 5000 | Server port |
| `NODE_ENV` | development | Environment |
| `DATABASE_URL` |  | Supabase Postgres connection string; `DATABASE_URL` is also accepted when provisioned by Vercel Marketplace |
| `VITE_SUPABASE_ANON_KEY` |  | Supabase browser publishable key; `SUPABASE_ANON_KEY` is also accepted for Vercel Marketplace compatibility |
| `SUPABASE_SERVICE_ROLE_KEY` |  | Supabase server secret key |
| `BLOB_READ_WRITE_TOKEN` |  | Vercel Blob upload/download token |

## ðŸŽ¯ Key Features

- **Tax Calculators** - Income tax, HRA, TDS, SIP, EMI, Capital gains
- **ITR Filing** - Step-by-step guided filing with form selection
- **AI Assistant** - Tax chatbot with intelligent suggestions
- **Document Parser** - Form 16, AIS, bank statement analysis
- **Professional Services** - GST, compliance, company registration
- **Admin Dashboard** - Analytics, user management, content

## ðŸ“ Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Run production server
npm run check    # TypeScript type checking
npm run db:generate # Generate Drizzle migrations
npm run db:migrate  # Run Drizzle migrations
npm run db:push     # Push database schema
npm run db:migrate:preview # Run migrations using pulled Vercel preview env
npm run db:seed:preview    # Seed using pulled Vercel preview env
```

## ðŸ“„ License

MIT License - See LICENSE file for details.

---

**Built with â¤ï¸ for Indian taxpayers | [myeca.in](https://myeca.in)**
