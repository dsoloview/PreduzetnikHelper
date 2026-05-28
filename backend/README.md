# PreduzetnikHelper — Backend

NestJS REST API for the PreduzetnikHelper application.

## Stack

- **NestJS 11** with TypeScript
- **Prisma 7** ORM + PostgreSQL
- **Passport + JWT** — access token in memory, refresh token in HttpOnly cookie
- **class-validator** — DTO validation
- **Helmet** — security headers
- **@nestjs/throttler** — rate limiting
- **PDFMake + DOMPurify** — PDF generation with XSS sanitization
- **Swagger** — API docs at `/api/docs` (dev only)

## Module Structure

```
src/
├── auth/           # Register, login, logout, token refresh, JWT strategy
├── users/          # User profile (PIB, MBR, company name, municipality…)
├── clients/        # Client CRUD (domestic / international)
├── bank-accounts/  # Multi-currency bank accounts
├── invoices/       # Invoice lifecycle + auto-numbering
├── kpo/            # KPO book generation from paid invoices
├── limits/         # Pausal (6M RSD) and VAT (8M RSD) threshold tracking
├── pdf/            # PDF rendering service
├── exchange-rates/ # NBS exchange rate fetcher
└── common/         # Shared building blocks (guards, decorators)
```

## Local Setup

Refer to the [root README](../README.md) for full setup instructions.

```bash
# From repo root — start only the database
make db-up

# Apply migrations
make db-migrate

# Start backend in watch mode
make dev-be
```

The API will be available at `http://localhost:3000/api`.  
Swagger UI: `http://localhost:3000/api/docs`

## Environment Variables

Copy `.env.example` to `backend/.env` and fill in the values.
See the [root README](../README.md#environment-variables) for the full list.

## Database

```bash
make db-migrate    # Apply pending migrations
make db-generate   # Regenerate Prisma client after schema changes
make db-studio     # Open Prisma Studio
make db-reset      # Drop DB and re-apply all migrations (⚠ deletes data)
```

## Testing

```bash
make test          # Run unit tests
make test-cov      # Run with coverage report
```
