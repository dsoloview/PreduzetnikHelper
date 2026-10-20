.PHONY: help install dev dev-be dev-fe build \
        db-up db-down db-reset db-migrate db-generate db-studio db-logs \
        test test-be test-fe test-e2e test-watch test-cov lint lint-be lint-fe \
        typecheck typecheck-fe build-shared \
        prod-up prod-down prod-logs prod-backup

# ─── Meta ─────────────────────────────────────────────────────────────────────

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2}'

# ─── Install ──────────────────────────────────────────────────────────────────

install: ## Install all dependencies
	pnpm install

# ─── Dev ──────────────────────────────────────────────────────────────────────

dev: ## Start backend + frontend in parallel
	pnpm --parallel run dev 2>/dev/null || \
	(pnpm --filter backend start:dev & pnpm --filter frontend dev)

dev-be: ## Start backend only (watch mode)
	pnpm --filter backend start:dev

dev-fe: ## Start frontend only (Vite)
	pnpm --filter frontend dev

# ─── Build ────────────────────────────────────────────────────────────────────

build: ## Build all packages
	pnpm --filter @preduzetnik/shared build
	pnpm --filter backend build
	pnpm --filter frontend build

build-shared: ## Build shared package only
	pnpm --filter @preduzetnik/shared build

# ─── Database ─────────────────────────────────────────────────────────────────

db-up: ## Start PostgreSQL via Docker Compose
	@test -f .env || (cp .env.example .env && echo "ℹ  .env created from .env.example")
	docker compose up -d

db-down: ## Stop PostgreSQL
	docker compose down

db-logs: ## Follow PostgreSQL logs
	docker compose logs -f postgres

db-reset: ## Drop DB, re-apply all migrations (⚠ deletes data)
	pnpm --filter backend exec prisma migrate reset --force --schema=prisma/schema.prisma

db-migrate: ## Apply pending migrations
	pnpm --filter backend exec prisma migrate dev --schema=prisma/schema.prisma

db-generate: ## Re-generate Prisma client after schema changes
	pnpm --filter backend exec prisma generate --schema=prisma/schema.prisma

db-studio: ## Open Prisma Studio in browser
	pnpm --filter backend exec prisma studio --schema=prisma/schema.prisma

# ─── Test ─────────────────────────────────────────────────────────────────────

test: ## Run backend and frontend unit tests
	pnpm --filter backend test
	pnpm --filter frontend test

test-be: ## Run backend unit tests
	pnpm --filter backend test

test-fe: ## Run frontend unit tests
	pnpm --filter frontend test

# Creates a throwaway database next to E2E_DATABASE_URL for each run and drops it afterwards
E2E_DATABASE_URL ?= postgresql://$${POSTGRES_USER:-preduzetnik}:$${POSTGRES_PASSWORD:-preduzetnik}@localhost:5432/$${POSTGRES_DB:-preduzetnik}

test-e2e: ## Run backend e2e tests against the local PostgreSQL (make db-up first)
	E2E_DATABASE_URL="$(E2E_DATABASE_URL)" pnpm --filter backend test:e2e

test-watch: ## Run backend tests in watch mode
	pnpm --filter backend test:watch

test-cov: ## Run backend tests with coverage
	pnpm --filter backend test:cov

# ─── Lint / Type-check ────────────────────────────────────────────────────────

lint: ## Lint all packages
	pnpm --filter backend lint
	pnpm --filter frontend lint

lint-be: ## Lint backend only
	pnpm --filter backend lint

lint-fe: ## Lint frontend only
	pnpm --filter frontend lint

typecheck: ## TypeScript type-check all packages
	pnpm --filter @preduzetnik/shared exec tsc --noEmit
	pnpm --filter backend exec tsc --noEmit
	pnpm --filter frontend exec tsc --noEmit

typecheck-fe: ## TypeScript type-check frontend only
	pnpm --filter frontend exec tsc --noEmit

# ─── Production (docker-compose.prod.yml) ─────────────────────────────────────

PROD = docker compose -f docker-compose.prod.yml

prod-up: ## Build and start the production stack
	$(PROD) up -d --build

prod-down: ## Stop the production stack (data and backups are kept)
	$(PROD) down

prod-logs: ## Follow production logs
	$(PROD) logs -f

prod-backup: ## Take a database backup right now
	$(PROD) exec backup /usr/local/bin/backup.sh --once
