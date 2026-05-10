.PHONY: help install dev dev-be dev-fe build \
        db-up db-down db-reset db-migrate db-generate db-studio \
        test test-be lint lint-be lint-fe

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
	docker compose up -d

db-down: ## Stop PostgreSQL
	docker compose down

db-reset: ## Drop DB, re-apply all migrations (⚠ deletes data)
	pnpm --filter backend exec prisma migrate reset --force --schema=prisma/schema.prisma

db-migrate: ## Apply pending migrations
	pnpm --filter backend exec prisma migrate dev --schema=prisma/schema.prisma

db-generate: ## Re-generate Prisma client after schema changes
	pnpm --filter backend exec prisma generate --schema=prisma/schema.prisma

db-studio: ## Open Prisma Studio in browser
	pnpm --filter backend exec prisma studio --schema=prisma/schema.prisma

# ─── Test ─────────────────────────────────────────────────────────────────────

test: ## Run all backend tests
	pnpm --filter backend test

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
