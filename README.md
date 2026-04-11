# 🧮 MyeCA.in - Smart Tax Calculator Platform

A comprehensive tax filing platform with expert CA assistance, smart calculators, and professional financial services.

## 🚀 Quick Start

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

## 📁 Project Structure

```
├── client/              # React frontend (Vite)
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route pages
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utilities & API client
│   │   └── styles/      # CSS design system
│   └── public/          # Static assets
├── server/              # Express.js backend
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   └── db/              # Database operations
├── shared/              # Shared types & schemas
├── docs/                # Documentation
└── dist/                # Production build output
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, TypeScript |
| Styling | TailwindCSS, Radix UI |
| State | TanStack Query, Zustand |
| Backend | Express.js, Node.js |
| Database | Neon Postgres, Drizzle |
| Auth | Clerk |
| File Storage | Vercel Blob |

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [Deployment Guide](docs/DEPLOYMENT.md) | Production deployment instructions |
| [Website Audit](docs/WEBSITE_AUDIT.md) | Performance & SEO analysis |
| [Theming Guide](docs/THEMING_GUIDE.md) | Light mode design system |
| [Optimization Plan](docs/WebsiteOptimization.md) | Performance improvements |
| [Database Guide](docs/DatabaseManagement.md) | Database operations |
| [Dashboard Design](docs/DashboardDesign.md) | Admin dashboard specs |

## ⚙️ Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 5000 | Server port |
| `NODE_ENV` | development | Environment |
| `DATABASE_URL` |  | Neon Postgres connection string; `POSTGRES_URL` is also accepted when provisioned by Vercel Marketplace |
| `VITE_CLERK_PUBLISHABLE_KEY` |  | Clerk browser publishable key; `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is also accepted for Vercel Marketplace compatibility |
| `CLERK_SECRET_KEY` |  | Clerk server secret key |
| `BLOB_READ_WRITE_TOKEN` |  | Vercel Blob upload/download token |

## 🎯 Key Features

- **Tax Calculators** - Income tax, HRA, TDS, SIP, EMI, Capital gains
- **ITR Filing** - Step-by-step guided filing with form selection
- **AI Assistant** - Tax chatbot with intelligent suggestions
- **Document Parser** - Form 16, AIS, bank statement analysis
- **Professional Services** - GST, compliance, company registration
- **Admin Dashboard** - Analytics, user management, content

## 📝 Scripts

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

## 📄 License

MIT License - See LICENSE file for details.

---

**Built with ❤️ for Indian taxpayers | [myeca.in](https://myeca.in)**
