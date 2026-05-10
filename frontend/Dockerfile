FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# ─── Install dependencies ────────────────────────────────────────────────────

FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY shared/package.json ./shared/
COPY frontend/package.json ./frontend/
RUN pnpm install --frozen-lockfile

# ─── Build shared ────────────────────────────────────────────────────────────

FROM deps AS build-shared
COPY shared/ ./shared/
RUN pnpm --filter @preduzetnik/shared build

# ─── Build frontend ──────────────────────────────────────────────────────────

FROM build-shared AS build-frontend
COPY frontend/ ./frontend/
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm --filter frontend build

# ─── Production image (nginx) ────────────────────────────────────────────────

FROM nginx:1.27-alpine AS runner
COPY --from=build-frontend /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
