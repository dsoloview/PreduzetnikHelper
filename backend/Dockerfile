FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
WORKDIR /app

# ─── Install dependencies ────────────────────────────────────────────────────

FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/
# Prisma schema must be present before generating the client
COPY backend/prisma ./backend/prisma
COPY backend/prisma.config.ts ./backend/prisma.config.ts
RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm --filter backend exec prisma generate --schema=prisma/schema.prisma

# ─── Build shared ────────────────────────────────────────────────────────────

FROM deps AS build-shared
COPY shared/ ./shared/
RUN pnpm --filter @preduzetnik/shared build

# ─── Build backend ───────────────────────────────────────────────────────────

FROM build-shared AS build-backend
COPY backend/ ./backend/
RUN pnpm --filter backend build

# ─── Production image ────────────────────────────────────────────────────────

FROM node:22-alpine AS runner
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/
# Prisma schema must be present before generating the client
COPY backend/prisma ./backend/prisma
COPY backend/prisma.config.ts ./backend/prisma.config.ts

RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm --filter backend exec prisma generate --schema=prisma/schema.prisma

COPY --from=build-shared /app/shared/dist ./shared/dist
COPY --from=build-backend /app/backend/dist ./backend/dist

WORKDIR /app/backend

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy --schema=prisma/schema.prisma && node dist/src/main"]
