# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

- Install deps
  ```bash path=null start=null
  npm install
  ```
- Dev server
  ```bash path=null start=null
  npm run dev
  ```
- Production build
  ```bash path=null start=null
  npm run build
  ```
- Start production server (after build)
  ```bash path=null start=null
  npm run start
  ```
- Type check (no emit)
  ```bash path=null start=null
  npx tsc --noEmit
  ```
- Lint: not configured in this repo (no ESLint config or script found)
- Tests: not configured in this repo (no test framework/scripts found)

## High-level architecture

- Framework and router
  - Next.js App Router in `src/app` with server routes under `src/app/api/**` and pages at `src/app/**/page.tsx`.
  - TypeScript with path alias `@/*` mapped to `src/*` (see `tsconfig.json`).

- Auth and state
  - `src/contexts/AuthContext.tsx` exposes `AuthProvider` and `useAuth()` with Supabase-backed auth.
  - Graceful degradation: if Supabase env vars are missing or connectivity fails, the app operates in "visitante" (guest) mode; UI disables auth-only flows.

- Supabase integration
  - `src/lib/supabase.ts` creates the browser client and provides helpers:
    - `isSupabaseConfigured()` validates envs and anon key shape.
    - `testSupabaseConnection()` performs a lightweight session check.
  - Server-side privileged operations use `createServerClient()` with `SUPABASE_SERVICE_ROLE_KEY`.

- AI/Open WebUI integration
  - `src/app/api/openwebui/route.ts`: generic proxy to an OpenAI-compatible Chat Completions endpoint hosted on your VPS (Open WebUI). Adds timeouts, input sanitization, and structured error handling.
  - `src/app/api/correct-essay/route.ts`: prompts the model to return strictly JSON with ENEM scoring breakdown, robustly extracts JSON from model output, and returns a typed result.
  - `src/app/api/extract-text/route.ts`: OCR path (see README) for image-to-text flow.
  - Configuration via env vars (names listed below).

- Pages and flows (selection)
  - `src/app/page.tsx`: landing/login/register/guest entry with theme toggle and toasts; redirects to `/envio` after auth.
  - `src/app/envio/page.tsx`: compose essay submission; supports raw text and image OCR.
  - `src/app/resultados/page.tsx`: displays final score, per-competency details, improvements/attention/congratulations.
  - `src/app/historico` and `src/app/evolucao`: user history and progress views.
  - `src/app/temas/page.tsx` and `src/app/api/temas/route.ts`: daily/random topic generation with simple in-memory caching.

- Configuration
  - `next.config.ts`:
    - `outputFileTracingRoot` pinned to the repo root to avoid monorepo/lockfile warnings during build.
    - Security response headers for API routes.
    - `images.unoptimized` and `images.domains` set for local usage.
  - `tsconfig.json`:
    - `moduleResolution: bundler`, `strict: true`, and Next.js TS plugin.
    - Path alias `@/*` ➜ `src/*` for cleaner imports.

- Analytics
  - Uses `@vercel/analytics/react`’s `<Analytics />` in `src/app/layout.tsx`.

## Environment variables (from README; set in `.env.local`)

- Open WebUI (VPS/Chat Completions)
  - `OPEN_WEBUI_BASE_URL`
  - `OPEN_WEBUI_API_KEY` (optional depending on setup)
  - `OPEN_WEBUI_MODEL` (e.g., `gemma3:4b`)
  - `OPEN_WEBUI_JWT_TOKEN` (optional)
  - `OPEN_WEBUI_API_PATH` (defaults to `/api/chat/completions`)
- Supabase
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

Refer to `README.md` for full, up-to-date environment setup and usage notes.
