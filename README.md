# PreduzetnikHelper

> Business management tool for Serbian **paušalac** (flat-rate sole proprietors)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)

---

## What is this?

Serbian paušalac (flat-rate entrepreneur) faces specific accounting obligations:

- **KPO Book** — a mandatory income ledger that must be maintained per legal requirements
- **6,000,000 RSD annual limit** — exceeding it removes the flat-rate status
- **8,000,000 RSD VAT threshold** — tracked separately for domestic supplies only
- Invoices must state *"Nije u sistemu PDV-a"* (not VAT registered)
- Sequential invoice numbering per year (e.g. `1/2026`, `2/2026`)

PreduzetnikHelper automates all of this in one place.

---

## Features

| Module | Description |
|---|---|
| **Auth** | JWT + HttpOnly refresh token cookie, bcrypt, token rotation |
| **Profile** | Company info: PIB, MBR, activity code, municipality, address |
| **Clients** | CRUD with domestic / international types, tax ID handling |
| **Bank Accounts** | Multi-currency (RSD / EUR / USD), SWIFT, IBAN, default account |
| **Invoices** | Full CRUD, status flow `DRAFT → SENT → PAID / CANCELLED`, auto-numbering |
| **PDF Export** | Invoice and KPO book PDFs via PDFMake with DOMPurify sanitization |
| **KPO Book** | Auto-generated from paid invoices, PDF export per year |
| **Limits Tracker** | Real-time pausal (6M) and VAT (8M) thresholds with progress bars |
| **Dashboard** | Revenue stats, limit cards, status breakdown, recent invoices, top clients |
| **NBS Exchange Rates** | Auto-fetch official middle rates from National Bank of Serbia |
| **Settings** | Change password |

---

## Tech Stack

### Monorepo Structure (pnpm workspaces)

```
PreduzetnikHelper/
├── backend/      # NestJS API
├── frontend/     # React SPA
└── shared/       # Shared TypeScript types & constants
```

### Backend
- **NestJS 11** — modular architecture, decorators, DI
- **Prisma 7** — type-safe ORM, PostgreSQL
- **Passport + JWT** — access token in memory, refresh token in HttpOnly cookie
- **class-validator + class-transformer** — DTO validation
- **Helmet + Throttler** — security headers and rate limiting
- **PDFMake + DOMPurify** — PDF generation with XSS sanitization
- **Swagger** — auto-generated API docs (dev only)

### Frontend
- **React 19** + **Vite**
- **Feature-Sliced Design (FSD)** — scalable architecture
- **shadcn/ui + Tailwind CSS v4** — component library
- **TanStack Query** — server state management
- **React Hook Form + Zod** — forms with schema validation
- **Zustand** — client state
- **React Router v7** — routing
- **i18next** — internationalization

---

## Quick Start

### Prerequisites
- **Node.js 20+** and [pnpm](https://pnpm.io/installation)
- [Docker](https://docs.docker.com/get-docker/) & Docker Compose (used only to run PostgreSQL)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/dsoloview/PreduzetnikHelper.git
cd PreduzetnikHelper

# 2. Install dependencies
pnpm install

# 3. Configure backend environment
cp backend/.env.example backend/.env
# → edit backend/.env: set JWT_SECRET / JWT_REFRESH_SECRET to long random strings

# 4. Start PostgreSQL (Docker)
make db-up

# 5. Apply database migrations
make db-migrate
```

### Run

In two separate terminals:

```bash
make dev-be   # Backend on http://localhost:3000
make dev-fe   # Frontend on http://localhost:5173
```

Or both at once:

```bash
make dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000/api`
- Swagger docs: `http://localhost:3000/api/docs`

---

## Available Commands

```bash
make help         # Show all available commands
make dev          # Start backend + frontend in parallel
make dev-be       # Backend only (watch mode)
make dev-fe       # Frontend only (Vite dev server)
make db-up        # Start PostgreSQL container
make db-down      # Stop PostgreSQL
make db-migrate   # Apply pending migrations
make db-studio    # Open Prisma Studio
make db-reset     # Drop DB and re-apply all migrations (⚠ deletes data)
make test         # Run backend tests
make lint         # Lint all packages
make typecheck    # TypeScript type-check all packages
```

---

## Environment Variables

### `backend/.env` — backend runtime

Copy `backend/.env.example` → `backend/.env`.

| Variable | Description |
|---|---|
| `DATABASE_URL` | Full PostgreSQL connection string |
| `JWT_SECRET` | Access token secret (min 32 chars) |
| `JWT_EXPIRES_IN` | Access token TTL (e.g. `15m`) |
| `JWT_REFRESH_SECRET` | Refresh token secret (min 32 chars) |
| `REFRESH_TOKEN_EXPIRES_DAYS` | Refresh token TTL in days |
| `CORS_ORIGIN` | Allowed frontend origin (e.g. `http://localhost:5173`) |
| `PDF_PROVIDER` | `pdfmake` (default, no Chrome) or `puppeteer` |

### `.env` — PostgreSQL container (optional)

Used only by `docker-compose.yml`. Defaults are sane for local dev, so this file is optional.

| Variable | Description |
|---|---|
| `POSTGRES_USER` | PostgreSQL username (default: `preduzetnik`) |
| `POSTGRES_PASSWORD` | PostgreSQL password (default: `preduzetnik`) |
| `POSTGRES_DB` | PostgreSQL database name (default: `preduzetnik`) |

---

## Project Architecture

### Backend Module Structure

```
src/
├── auth/           # Authentication & JWT strategy
├── users/          # User profile management
├── clients/        # Client CRUD
├── bank-accounts/  # Bank account management
├── invoices/       # Invoice lifecycle
├── kpo/            # KPO book generation
├── limits/         # Pausal & VAT limit tracking
├── pdf/            # PDF generation service (PDFMake)
├── exchange-rates/ # NBS exchange rate fetcher
└── common/         # Shared building blocks (guards, decorators)
```

### Frontend FSD Structure

```
src/
├── app/            # App providers, router, global styles
├── pages/          # Route-level pages
├── widgets/        # Composite UI blocks (header, sidebar, dashboard sections)
├── features/       # User-facing features (forms, dialogs, business actions)
├── entities/       # Business entities (user, invoice, client, bank account…)
├── shared/         # Reusable UI kit, lib, hooks, API clients
└── assets/         # Static assets
```

---

## Security

- Passwords hashed with **bcrypt**
- Refresh tokens stored as **hashed values** in DB with JTI rotation
- Access tokens kept **in memory only** (not localStorage)
- Refresh token in **HttpOnly, SameSite=Strict cookie**
- **Helmet** with strict CSP for the API
- **Rate limiting** on auth endpoints
- PDF templates sanitized with **DOMPurify** (prevents XSS via invoice data)
- CORS restricted to configured origin and allowed methods only

---

## License

MIT © [Dmitrii Solovev](https://github.com/dsoloview)
