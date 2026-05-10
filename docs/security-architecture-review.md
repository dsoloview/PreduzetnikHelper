# Security & Architecture Review

> Date: 2026-05-10
> Scope: backend (NestJS), frontend (React/Vite), shared, infrastructure

---

## Legend

| Icon | Meaning |
|------|---------|
| 🔴 | Critical — must fix before any production use |
| 🟡 | Important — should fix soon |
| 🟢 | Improvement — nice to have |

---

## 1. Security

### 🔴 1.1 `ValidationPipe` not stripping unknown properties

**File:** `backend/src/main.ts:9`

```ts
app.useGlobalPipes(new ValidationPipe());
```

Without `whitelist: true` and `forbidNonWhitelisted: true`, any extra field in the request body will be passed through to Prisma's `create`/`update`. An attacker can inject fields like `userId`, `id`, `status`, `invoiceNumber`, `year`, `createdAt` etc. directly.

**Fix:**
```ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}));
```

`transform: true` is also necessary so that `@Type(() => ...)` decorators in DTOs (e.g. `CreateInvoiceDto.items`) and `@Query` parameters (like `year` in invoices) actually get transformed to the correct type.

---

### 🔴 1.2 CORS wide open

**File:** `backend/src/main.ts:8`

```ts
app.enableCors();
```

`enableCors()` with no arguments means `Access-Control-Allow-Origin: *`. Any website can make authenticated requests on behalf of the user.

**Fix:**
```ts
app.enableCors({
  origin: configService.get('CORS_ORIGIN', 'http://localhost:5173'),
  credentials: true,
});
```

---

### 🔴 1.3 No `helmet` middleware

No HTTP security headers (`X-Content-Type-Options`, `Strict-Transport-Security`, `X-Frame-Options`, etc.) are set. This exposes the API to clickjacking and MIME-sniffing attacks.

**Fix:**
```bash
pnpm add helmet
```
```ts
// main.ts
import helmet from 'helmet';
app.use(helmet());
```

---

### 🔴 1.4 No rate limiting on auth endpoints

`POST /auth/login` and `POST /auth/register` have no rate limiter. This enables brute-force password attacks and mass account creation.

**Fix:**
```bash
pnpm add @nestjs/throttler
```
```ts
// app.module.ts
ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }])

// auth.controller.ts — tighter limit
@Throttle({ default: { ttl: 60000, limit: 5 } })
```

---

### 🟡 1.5 JWT — no refresh token, long-lived access token

**File:** `backend/src/auth/auth.module.ts:19`

Token lives for **7 days** by default (`JWT_EXPIRES_IN: '7d'`). There is no refresh token mechanism and no way to revoke a compromised token.

**Recommendations:**
1. Reduce access token TTL to ~15 min.
2. Implement refresh token (stored in DB or Redis) with rotation.
3. Or at minimum reduce TTL to ~1h for now.

---

### 🟡 1.6 JWT payload typed as `any`

**File:** `backend/src/auth/jwt.strategy.ts:17`

```ts
async validate(payload: any) {
```

The `any` type hides potential issues. The returned object shape (`userId` / `username`) doesn't match the `JwtPayload` interface names exactly — JWT signs `{ sub, username }` but the strategy returns `{ userId, username }`. This works but is fragile.

**Fix:**
```ts
async validate(payload: { sub: string; username: string }): Promise<JwtPayload> {
  return { userId: payload.sub, username: payload.username };
}
```

---

### 🟡 1.7 Swagger exposed unconditionally

**File:** `backend/src/main.ts:11-18`

Swagger docs are available in all environments including production. They expose the entire API schema.

**Fix:**
```ts
if (configService.get('NODE_ENV') !== 'production') {
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
}
```

---

### 🟡 1.8 User password potentially leaked via Prisma includes

**File:** `backend/src/kpo/kpo.service.ts:57-58`

```ts
const user = await this.prisma.user.findUnique({ where: { id: userId } });
const pdfData = { ...kpoData, user };
```

The full `User` object (including `password` hash) is passed to the Handlebars template. Even though it's not rendered, it's in memory and could leak through error/debug output.

**Same issue in:** `invoices.service.ts:232` — `include: { user: true }` fetches the password hash.

**Fix:** Always select only needed fields or strip password:
```ts
const user = await this.prisma.user.findUnique({
  where: { id: userId },
  omit: { password: true },
});
```

---

### 🟡 1.9 `PrismaService` reads `DATABASE_URL` directly from `process.env`

**File:** `backend/src/prisma/prisma.service.ts:9`

```ts
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
```

This bypasses `ConfigService` / `ConfigModule` validation. If the variable is missing, you get a cryptic `pg` error instead of a clear startup failure.

**Fix:** Inject `ConfigService` and validate at startup:
```ts
constructor(private config: ConfigService) {
  const url = config.getOrThrow<string>('DATABASE_URL');
  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  super({ adapter });
}
```

---

### 🟡 1.10 `ConfigModule.forRoot()` has no validation

**File:** `backend/src/app.module.ts:15`

Required env variables (`JWT_SECRET`, `DATABASE_URL`) are not validated at startup. A missing `JWT_SECRET` would silently use `undefined`, leading to completely broken auth.

**Fix:** Use `@nestjs/config` validation with Joi or a custom factory:
```ts
ConfigModule.forRoot({
  isGlobal: true,
  validate: (config) => {
    // validate JWT_SECRET, DATABASE_URL, etc.
  },
})
```

---

### 🟡 1.11 PDF template path traversal risk

**File:** `backend/src/pdf/pdf.service.ts:59`

```ts
const templatePath = path.join(process.cwd(), 'src', 'pdf', 'templates', `${templateName}.hbs`);
```

The `templateName` comes from code (not user input currently), but there's no sanitization. If in the future a user-supplied value reaches this, `../../etc/passwd` would be a valid path.

**Fix:** Validate `templateName` against an allowlist:
```ts
const ALLOWED_TEMPLATES = ['invoice', 'kpo'] as const;
if (!ALLOWED_TEMPLATES.includes(templateName)) {
  throw new InternalServerErrorException('Unknown template');
}
```

---

### 🟢 1.12 Token stored in `localStorage`

**File:** `frontend/src/entities/user/model/auth.store.ts`

`localStorage` is vulnerable to XSS. If any dependency or injected script reads `localStorage`, the token is compromised.

**Alternatives (future):**
- `httpOnly` cookie (requires backend changes)
- Or keep `localStorage` but ensure CSP headers and SRI for all scripts

---

### 🟢 1.13 Missing password strength requirements on registration

**File:** `backend/src/auth/dto/register.dto.ts:12`

Only `@MinLength(6)` is enforced. No uppercase, digit, or special char requirements.

**Fix:** Add `@Matches()` or a custom validator:
```ts
@Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/, {
  message: 'Password must contain at least 1 uppercase letter and 1 digit',
})
```

Also note: `register.dto.ts` uses `MinLength(6)`, but `change-password.dto.ts` uses `MinLength(8)`. These should be consistent.

---

## 2. Architecture

### 🟡 2.1 `status` cast to `any` bypasses type safety

**File:** `backend/src/invoices/invoices.service.ts:97, 184`

```ts
...(filters.status && { status: filters.status as any }),
status: dto.status as any,
```

The `status` string from the query/body is cast to `any` without validation that it's a valid `InvoiceStatus` enum value.

**Fix:** Use Prisma's generated enum type. Since `ValidationPipe` already validates via `@IsEnum`, the cast should be to the specific type:
```ts
status: dto.status as InvoiceStatus,
```

---

### 🟡 2.2 Invoice number generation has a race condition

**File:** `backend/src/invoices/invoices.service.ts:34-38`

```ts
const lastInvoice = await this.prisma.invoice.findFirst({ ... });
const invoiceNumber = (lastInvoice?.invoiceNumber ?? 0) + 1;
```

Two concurrent requests can get the same `invoiceNumber`. The `@@unique` constraint will cause one to fail with an unhandled Prisma error.

**Fix:** Wrap in a serializable transaction or use `$executeRaw` with `SELECT ... FOR UPDATE`, or retry on unique constraint violation.

---

### 🟡 2.3 `mapToResponseDto` uses `any` type

**File:** `backend/src/invoices/invoices.service.ts:257`

```ts
private mapToResponseDto(invoice: any): InvoiceResponseDto {
```

This loses all type safety. Use the Prisma generated type with includes:
```ts
private mapToResponseDto(
  invoice: Prisma.InvoiceGetPayload<{ include: { client: true; items: true } }>
): InvoiceResponseDto {
```

---

### 🟡 2.4 No global `api/` prefix

All routes are at the root level (`/auth/login`, `/invoices`, etc.). This will conflict if the frontend and backend are served from the same domain.

**Fix:**
```ts
app.setGlobalPrefix('api');
```

---

### 🟡 2.5 Missing `onDelete` on Invoice → Client relation

**File:** `backend/prisma/schema.prisma:116`

```prisma
client Client @relation(fields: [clientId], references: [id])
```

No `onDelete` behavior is specified. Deleting a client that has invoices will throw a foreign key error with no user-friendly message.

**Fix:** Either:
- `onDelete: Restrict` (explicit) + handle the error in `ClientsService.remove()`
- Or `onDelete: SetNull` if invoices should survive client deletion

Same applies to `Invoice → BankAccount` (line 117).

---

### 🟢 2.6 `users` service exposes too-generic CRUD methods

**File:** `backend/src/users/users.service.ts:21-36, 44-53, 70-74`

Methods `users()`, `updateUser()`, `deleteUser()` accept raw Prisma types and are not used by any controller. They are a liability — if wired to a controller later, they have no ownership checks.

**Fix:** Remove unused methods, or scope them to specific use cases with proper auth.

---

### 🟢 2.7 No pagination for list endpoints

`GET /invoices`, `GET /clients`, `GET /bank-accounts` return all records. For a solo proprietor this is probably fine for now, but it's good practice to add pagination support.

**Fix:** Add `@Query('page')` and `@Query('limit')` with defaults (e.g., 50).

---

### 🟢 2.8 Puppeteer in production may be heavy

**File:** `backend/src/pdf/pdf.service.ts`

A persistent Puppeteer browser instance is kept alive. This consumes ~100–300 MB RAM. For a small app this is fine, but consider switching to a lighter library (e.g., `@react-pdf/renderer`, `pdfmake`, `wkhtmltopdf`) if resources become an issue.

---

### 🟢 2.9 `@Query('year')` not parsed to number

**File:** `backend/src/invoices/invoices.controller.ts:41`

```ts
@Query('year') year?: number,
```

Without `transform: true` in `ValidationPipe` (see 1.1), `year` arrives as a `string`. This means `filters.year` in the Prisma `where` clause compares `string` vs `int`, which may cause unexpected results or Prisma errors.

**Fix:** Either add `@Type(() => Number)` + `@IsOptional() @IsInt()`, or enable `transform: true` globally (see 1.1).

---

## 3. Infrastructure & DevOps

### 🔴 3.1 Docker Compose has hardcoded credentials

**File:** `docker-compose.yml:9-11`

```yaml
POSTGRES_USER: preduzetnik
POSTGRES_PASSWORD: preduzetnik
```

These are committed to git. Even for dev, this is a bad practice as it normalizes committing secrets.

**Fix:** Use `.env` file with `env_file:` in docker-compose, and ensure `.env` is in `.gitignore`. Provide `.env.example` instead.

---

### 🟡 3.2 Root `.gitignore` is too minimal

**File:** `.gitignore`

Only `.idea` and `node_modules` are ignored at root level. Missing:
- `.env` / `.env.*` (root-level env files)
- `.DS_Store`
- `*.local`

---

### 🟡 3.3 No `.env.example` file

There's no `.env.example` documenting required variables. New developers won't know what to set.

**Required variables:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/preduzetnik
JWT_SECRET=your-secret-here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

---

## 4. Summary — Priority Action Items

| # | Priority | Item | Effort |
|---|----------|------|--------|
| 1.1 | 🔴 | `ValidationPipe` whitelist + transform | 5 min |
| 1.2 | 🔴 | Restrict CORS origin | 5 min |
| 1.3 | 🔴 | Add `helmet` | 5 min |
| 1.4 | 🔴 | Rate limiting on auth | 15 min |
| 3.1 | 🔴 | Move docker credentials to `.env` | 10 min |
| 1.6 | 🟡 | Type JWT payload | 5 min |
| 1.7 | 🟡 | Conditional Swagger | 5 min |
| 1.8 | 🟡 | Strip password from User in PDF | 10 min |
| 1.9 | 🟡 | PrismaService use ConfigService | 10 min |
| 1.10 | 🟡 | Validate env on startup | 15 min |
| 2.2 | 🟡 | Fix invoice number race condition | 20 min |
| 2.4 | 🟡 | Add global `api/` prefix | 5 min |
| 2.5 | 🟡 | Add `onDelete` to relations | 10 min |
| 2.9 | 🟡 | Fix `year` query param type | 5 min |
| 1.5 | 🟡 | Reduce JWT TTL / add refresh | 1–3h |
| 3.2 | 🟡 | Fix root `.gitignore` | 2 min |
| 3.3 | 🟡 | Create `.env.example` | 5 min |
