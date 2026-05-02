# Architecture

## Monorepo Structure
```
PreduzetnikHelper/
├── backend/          # NestJS app
├── frontend/         # React app (Vite)
├── shared/           # Shared types & contracts
├── docs/             # Documentation
└── agents.md         # AI agent guidelines
```

Package manager: **pnpm** with workspaces.

---

## Backend Modules

| Module | Responsibility |
|---|---|
| **AuthModule** | JWT + Passport authentication, multi-user (all entities scoped by `userId`) |
| **ClientModule** | Client/counterparty CRUD (company details, tax IDs) |
| **InvoiceModule** | Invoice CRUD, PDF generation (Serbian/English), tax calculations |
| **KpoModule** | KPO book — auto-entries from paid invoices + manual entries |
| **NbsModule** | NBS exchange rate service — daily cache of RSD/EUR/USD rates |
| **LimitsModule** | Income limit tracking (6M RSD annual, 8M RSD rolling 365-day VAT threshold) |
| **TaxCalendarModule** | Tax payment reminders (monthly deadline: 15th) |

---

## Shared Types Strategy
- `shared/` is a workspace package imported by both backend and frontend
- Contains: DTO interfaces, enums, constants, API response types
- No runtime dependencies on NestJS or React
- Backend uses shared types in Swagger decorators and DTOs
- Frontend uses the same types for API call typing

---

## Backend Patterns (NestJS)
- **Modular structure**: each feature = separate module
- **DTO validation**: class-validator + class-transformer in pipes
- **Swagger-first**: all endpoints documented via decorators (`@ApiProperty()`, `@ApiResponse()`)
- **Repository pattern**: Prisma services separated from business logic
- **Error handling**: global exception filters
- **Swagger UI**: available at `/api/docs`

---

## Frontend Patterns
- **Feature-based structure**: folders per feature (invoices/, clients/, kpo/)
- **Reusable components**: shadcn/ui as the foundation
- **API layer**: typed hooks via TanStack Query
- **Forms**: React Hook Form + Zod schemas
- **Routing**: React Router with lazy-loaded routes

---

## Roadmap

### Phase 1 — MVP
- [ ] Monorepo setup (pnpm workspaces, shared package)
- [ ] AuthModule (JWT registration/login)
- [ ] ClientModule (CRUD)
- [ ] InvoiceModule (CRUD + PDF generation)
- [ ] Frontend: auth, clients, invoice creation/viewing

### Phase 2 — KPO & Limits
- [ ] KpoModule (auto-entries from invoices + manual)
- [ ] LimitsModule (6M/8M tracking, warnings)
- [ ] NbsModule (daily exchange rate caching)
- [ ] Frontend: KPO book view, dashboard with limits

### Phase 3 — Polish
- [ ] TaxCalendarModule (reminders)
- [ ] Multi-currency invoices with NBS rates
- [ ] Export (KPO to Excel/PDF)
- [ ] Professional PDF invoice templates
