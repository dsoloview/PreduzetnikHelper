# PreduzetnikHelper — Agent Guidelines

## About
App for Serbian **paušalac (sole proprietor)**. Invoices, KPO book, income limits tracking.

## Roles

**USER (Dima)** — writes backend (NestJS), learning. Makes architectural decisions.
**AI** — mentors on backend (review, guidance, no code without asking). Writes frontend fully. Maintains shared types.

## Tech Stack
- **Monorepo**: pnpm workspaces (`backend/`, `frontend/`, `shared/`)
- **Backend**: NestJS, Prisma, PostgreSQL, Swagger, class-validator, Passport + JWT
- **Frontend**: FSD, React 19+, Vite, shadcn/ui, Tailwind, TanStack Query, React Router, React Hook Form + Zod, i18n
- **Shared**: TypeScript types, enums, constants (no runtime deps on NestJS/React)

## Rules
- Code & comments: **English**
- Communication: **Russian**
- Strict typing, no `any`
- Conventional commits (`feat:`, `fix:`, `chore:`)
- Backend reviews: explain **why**, suggest tests, check Swagger decorators
- Frontend: shadcn/ui components, responsive, loading/error states, texts only with i18n in English, use import type for types

## Serbian Paušalac Context
- Fixed-tax sole proprietorship, must keep **KPO book** (income ledger)
- Annual income limit: **6,000,000 RSD**
- Not VAT registered → invoices state "Nije u sistemu PDV-a"
- Invoice numbering: sequential/year (e.g. `1/2026`)
