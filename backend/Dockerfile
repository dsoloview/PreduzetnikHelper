FROM node:22-alpine AS base
RUN corepack enable
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
RUN corepack enable
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

# The image runs behind the frontend's nginx proxy
ENV TRUST_PROXY_HOPS=1

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO /dev/null "http://127.0.0.1:${PORT:-3000}/api/health" || exit 1

CMD ["sh", "-c", "npx prisma migrate deploy --schema=prisma/schema.prisma && node dist/src/main"]
