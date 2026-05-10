FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# ─── Install dependencies ────────────────────────────────────────────────────

FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/
RUN pnpm install --frozen-lockfile

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

RUN pnpm install --frozen-lockfile

COPY --from=build-shared /app/shared/dist ./shared/dist
COPY --from=build-backend /app/backend/dist ./backend/dist
COPY backend/prisma ./backend/prisma
COPY backend/prisma.config.ts ./backend/prisma.config.ts

WORKDIR /app/backend

EXPOSE 3000

CMD ["node", "dist/src/main"]
