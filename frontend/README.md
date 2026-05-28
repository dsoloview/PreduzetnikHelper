# PreduzetnikHelper — Frontend

React SPA for the PreduzetnikHelper application.

## Stack

- **React 19** + **Vite**
- **Feature-Sliced Design (FSD)** — scalable folder architecture
- **shadcn/ui + Tailwind CSS v4** — component library and styling
- **TanStack Query v5** — server state, caching, background refetch
- **React Hook Form + Zod** — forms with schema validation
- **Zustand** — lightweight client state (auth)
- **React Router v7** — routing
- **i18next** — internationalization (English UI)
- **Axios** — HTTP client with interceptors

## Local Setup

Refer to the [root README](../README.md) for full setup instructions.

```bash
# From repo root
make dev-fe
```

The app will be available at `http://localhost:5173`.

> The frontend proxies `/api` requests to the backend via Vite dev server config.

## Build

```bash
pnpm --filter frontend build
```

Output goes to `frontend/dist/` and is served via nginx in Docker.
