# Security & Architecture Review

> Date: 2026-05-10 (rev. 3)
> Scope: backend (NestJS), frontend (React/Vite), shared, infrastructure

---

## Legend

| Icon | Meaning |
|------|---------|
| 🔴 | Critical — must fix before any production use |
| 🟡 | Important — should fix soon |
| 🟢 | Improvement — nice to have |
| ✅ | Fixed |

---

## 1. Security

### ✅ ~~1.1 `ValidationPipe` not stripping unknown properties~~

Fixed — `whitelist`, `forbidNonWhitelisted`, `transform` all enabled.

---

### ✅ ~~1.2 CORS wide open~~

Fixed — origin restricted via `CORS_ORIGIN` env variable.

---

### ✅ ~~1.3 No `helmet` middleware~~

Fixed — `helmet()` added in `main.ts`.

---

### ✅ ~~1.4 No rate limiting on auth endpoints~~

Fixed — `ThrottlerModule` globally + `@Throttle({ default: { ttl: 60000, limit: 5 } })` on `AuthController`.

---

### ✅ ~~1.5 JWT — no refresh token, long-lived access token~~

Fixed — access token TTL reduced to 15m, full refresh token rotation implemented with `httpOnly` cookie, DB-backed `RefreshToken` model.

---

### ✅ ~~1.6 JWT payload typed as `any`~~

Fixed — `validate()` now has explicit types.

---

### ✅ ~~1.7 Swagger exposed unconditionally~~

Fixed — conditional on `NODE_ENV !== 'production'`.

---

### ✅ ~~1.8 User password potentially leaked via Prisma includes~~

Fixed — `kpo.service.ts` uses `omit: { password: true }`, `invoices.service.ts` uses `user: { omit: { password: true } }`.

---

### ✅ ~~1.9 `PrismaService` reads `DATABASE_URL` directly from `process.env`~~

Fixed — now uses `config.getOrThrow<string>('DATABASE_URL')`.

---

### ✅ ~~1.10 `ConfigModule.forRoot()` has no validation~~

Fixed — custom `validate` function checks `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`.

---

### ✅ ~~1.11 PDF template path traversal risk~~

Fixed — `ALLOWED_TEMPLATES` allowlist added.

---

### 🟢 1.12 Access token stored in `localStorage`

**File:** `frontend/src/entities/user/model/auth.store.ts`

Refresh token is now in `httpOnly` cookie (good!). Access token is still in `localStorage` — acceptable for short-lived tokens (15m), but XSS can still read it.

**Low-risk mitigation (optional):** Store access token only in memory (Zustand state without `localStorage` persistence). On page reload, silently call `/auth/refresh` to get a new access token from the cookie.

This removes the last piece of sensitive data from `localStorage` entirely.

---

### ✅ ~~1.13 Password validation inconsistency between endpoints~~

Fixed — `change-password.dto.ts` now has `@MinLength(8)` + `@Matches` matching `register.dto.ts`.

---

### ✅ ~~1.14 Refresh token lookup scans all records~~

Fixed — cookie now contains `jti.rawToken`. `refresh()` and `logout()` do `findUnique({ where: { jti } })` (O(1) lookup), then a single `bcrypt.compare`. Bonus: on hash mismatch in `refresh()`, all sessions for the user are invalidated (token theft detection).

---

### ✅ ~~1.15 `POST /auth/logout` scans all tokens without filter~~

Fixed — `logout()` now uses `jti` lookup (single record), no full-table scan.

---

## 2. Architecture

### ✅ ~~2.1 `status` cast to `any`~~

Fixed — now cast to `InvoiceStatus` / `Currency` from Prisma enums.

---

### ✅ ~~2.2 Invoice number generation has a race condition~~

Fixed — `create()` now uses `this.prisma.$transaction()` with `isolationLevel: 'Serializable'`.

---

### ✅ ~~2.3 `mapToResponseDto` uses `any` type~~

Fixed — now uses `NonNullable<Awaited<ReturnType<...>>>` from Prisma.

---

### ✅ ~~2.4 No global `api/` prefix~~

Fixed — `app.setGlobalPrefix('api')`.

---

### ✅ ~~2.5 Missing `onDelete` on Invoice → Client relation~~

Fixed — `onDelete: Restrict` on both Client and BankAccount relations.

---

### 🟢 2.6 `UsersService` exposes generic CRUD methods

**File:** `backend/src/users/users.service.ts:21-36, 44-53, 70-74`

Methods `users()`, `updateUser()`, `deleteUser()` accept raw Prisma types and are not used by any controller. They are a liability — if wired to a controller later, they have no ownership checks.

**Fix:** Remove unused methods, or scope them to specific use cases with proper auth.

---

### 🟢 2.7 No pagination for list endpoints

`GET /invoices`, `GET /clients`, `GET /bank-accounts` return all records. For a solo proprietor this is probably fine for now, but good practice to add pagination support.

---

### 🟢 2.8 Puppeteer in production may be heavy

**File:** `backend/src/pdf/pdf.service.ts`

A persistent Puppeteer browser instance consumes ~100–300 MB RAM. Fine for now, consider lighter alternatives if resources become an issue.

---

### ✅ ~~2.9 `@Query('year')` not parsed to number~~

Fixed — now uses `ParseIntPipe({ optional: true })`.

---

## 3. Infrastructure & DevOps

### ✅ ~~3.1 Docker Compose has hardcoded credentials~~

Fixed — uses `env_file: .env` with `${POSTGRES_*}` variables.

---

### ✅ ~~3.2 Root `.gitignore` is too minimal~~

Fixed — `.env`, `.env.*`, `!.env.example`, `.DS_Store`, `*.local` added.

---

### 🟡 3.3 No `.env.example` file

Still missing. Should document all required variables:

```env
# Database
DATABASE_URL=postgresql://preduzetnik:preduzetnik@localhost:5432/preduzetnik
POSTGRES_USER=preduzetnik
POSTGRES_PASSWORD=preduzetnik
POSTGRES_DB=preduzetnik

# Auth
JWT_SECRET=change-me-to-random-string
JWT_REFRESH_SECRET=change-me-to-another-random-string
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_DAYS=30

# App
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
PORT=3000
```

---

## 4. Summary — Remaining Action Items

| # | Priority | Item | Effort |
|---|----------|------|--------|
| 3.3 | 🟡 | Create `.env.example` | 5 min |
| 1.12 | 🟢 | Move access token from localStorage to memory-only | 30 min |
| 2.6 | 🟢 | Remove unused generic CRUD in UsersService | 10 min |
| 2.7 | 🟢 | Add pagination to list endpoints | 30 min |
| 2.8 | 🟢 | Consider lighter PDF engine than Puppeteer | — |

### Fixed (22 of 27 items) ✅

1.1 ValidationPipe, 1.2 CORS, 1.3 Helmet, 1.4 Rate limiting, 1.5 Refresh tokens,
1.6 JWT typing, 1.7 Swagger conditional, 1.8 Password leak in PDF, 1.9 PrismaService ConfigService,
1.10 Env validation, 1.11 Template allowlist, 1.13 Password rules, 1.14 Refresh token jti lookup,
1.15 Logout scan fix, 2.1 Enum casts, 2.2 Invoice number race condition, 2.3 mapToResponseDto typing,
2.4 API prefix, 2.5 onDelete relations, 2.9 Query year parsing, 3.1 Docker credentials, 3.2 .gitignore
