# CLAUDE.md

Guidance for AI assistants (and humans) working in this repository.

## Project overview

**Sophia's Strength Tracker** is a single-user fitness web app for logging and
tracking workouts built around Andrew Huberman's foundational strength/fitness
protocol. It is a personal tool (built for "Sophia Mirza"), not a multi-tenant
product — there is **no authentication, no user accounts, and no per-user data
scoping**. All data belongs to one implicit user.

The app covers:
- **Strength days** (Legs, Torso & Neck, Arms/Calves/Neck) with preset
  exercises split into *shortened* and *lengthened* positions.
- **Cardio days** (Zone 2 long endurance, moderate, HIIT sprints).
- **Recovery / heat-cold** days.
- Two alternating monthly rep schemes: **Schedule A** (4–8 reps, heavy) and
  **Schedule B** (8–15 reps, hypertrophy).
- Personal records, weekly stats, a weekly protocol reference, and a static
  nutrition guide.

## Tech stack

- **Runtime/build:** Node + TypeScript (ESM), `tsx` for dev, `esbuild` +
  `vite` for production builds.
- **Server:** Express 5, single HTTP server that serves both the JSON API and
  the client.
- **Client:** React 18 + Vite, **wouter** for routing (hash-based —
  `useHashLocation`), **TanStack Query** for data fetching, **Tailwind CSS** +
  **shadcn/ui** (Radix primitives) for UI, **recharts** for charts,
  **lucide-react** for icons.
- **Database:** SQLite via **better-sqlite3**, accessed through
  **Drizzle ORM**. Schemas validated with **drizzle-zod** / **zod**.
- The DB file `data.db` is created at runtime in the project root and is
  **gitignored** — never commit it. Tables are created and seeded on server
  start (see `server/storage.ts`).

> Note: `package.json` includes many UI/Radix dependencies (full shadcn set).
> `script/build.ts` has a server-bundle allowlist that names several packages
> (openai, stripe, multer, etc.) that are **not** current dependencies — it is
> a generic template; only packages actually imported are bundled.

## Repository layout

```
.
├── client/                 # React frontend (Vite root)
│   ├── index.html          # HTML entry; mounts #root, loads /src/main.tsx
│   └── src/
│       ├── main.tsx        # React entry; forces a leading "#/" hash route
│       ├── App.tsx         # Router + providers (QueryClient, Theme, Toaster)
│       ├── index.css       # Tailwind layers + design tokens (HSL CSS vars)
│       ├── components/
│       │   ├── Sidebar.tsx        # Desktop sidebar + mobile top/bottom nav
│       │   ├── ThemeProvider.tsx  # light/dark theme context
│       │   └── ui/                # shadcn/ui primitives (generated)
│       ├── hooks/          # use-mobile, use-toast
│       ├── lib/
│       │   ├── queryClient.ts     # TanStack Query client + apiRequest helper
│       │   └── utils.ts           # cn() class-merge helper
│       └── pages/          # Dashboard, LogWorkout, Progress, Protocol,
│                           #   Nutrition, not-found
├── server/
│   ├── index.ts            # Express app bootstrap, request logging, listen
│   ├── routes.ts           # All /api/* route handlers
│   ├── storage.ts          # DB connection, table DDL, seed data, Storage class
│   ├── static.ts           # Production static file serving (dist/public)
│   └── vite.ts             # Dev-mode Vite middleware (HMR)
├── shared/
│   └── schema.ts           # Drizzle tables + zod insert schemas + TS types
├── script/build.ts         # Production build (vite client + esbuild server)
├── drizzle.config.ts       # drizzle-kit config (sqlite, ./data.db)
├── vite.config.ts          # Vite config + path aliases
├── tailwind.config.ts
└── components.json         # shadcn/ui config (new-york style)
```

### Path aliases
Configured in both `vite.config.ts` and `tsconfig.json`:
- `@/*`     → `client/src/*`
- `@shared/*` → `shared/*`
- `@assets/*` → `attached_assets/*` (directory may not exist)

Always import shared types from `@shared/schema`, and client modules via `@/…`.

## Commands

```bash
npm run dev      # Start dev server (tsx server/index.ts, NODE_ENV=development)
npm run build    # Build client (vite) + server (esbuild) into dist/
npm run start    # Run the production build: node dist/index.cjs
npm run check    # Type-check with tsc (noEmit)
npm run db:push  # Push schema changes to SQLite via drizzle-kit
```

- The server listens on `PORT` (default **5000**) at host `0.0.0.0`. This one
  port serves both the API and the client.
- In **development**, Express mounts Vite as middleware (HMR at `/vite-hmr`).
- In **production**, Express serves the static client from `dist/public` and
  falls through to `index.html` for client-side routing.
- There is **no test suite, linter, or formatter** configured. `npm run check`
  (tsc) is the only automated verification — run it after changes.

## Architecture notes

### Data flow
1. `shared/schema.ts` is the single source of truth for the data model:
   Drizzle table definitions → `createInsertSchema(...).omit({ id: true })`
   zod schemas → inferred `Insert*` and select types.
2. `server/storage.ts` owns the SQLite connection. It creates tables with raw
   `CREATE TABLE IF NOT EXISTS` DDL and seeds default `workout_days` on first
   run. The `Storage` class implements `IStorage` and is exported as the
   singleton `storage`. **All DB access goes through `storage`** — routes never
   touch the DB directly.
3. `server/routes.ts` registers REST endpoints under `/api`. Each mutating
   route validates the body with the relevant zod schema
   (`insert*Schema.safeParse`) and returns `400` with flattened errors on
   failure.
4. The client uses TanStack Query. The default `queryFn` builds the URL by
   `queryKey.join("/")`, so **query keys are URL path segments**, e.g.
   `useQuery({ queryKey: ["/api/stats"] })`. Mutations use the `apiRequest`
   helper and then `queryClient.invalidateQueries(...)` to refresh.

### Data model (tables)
- `workout_days` — workout templates (name, dayType, description, lucide icon).
  Seeded; effectively read-only via the API.
- `workout_sessions` — a logged session (dayTypeId, date `YYYY-MM-DD`,
  schedule `A`/`B`, durationMinutes, notes, completed, energyLevel 1–5).
- `exercise_sets` — sets per session (exerciseName, muscleGroup, rangeType
  `shortened`/`lengthened`, setNumber, reps, weightKg, completed, notes).
- `personal_records` — PRs (exerciseName, muscleGroup, weightKg, reps, date).
- `cardio_sessions` — cardio logs (cardioType `zone2`/`moderate`/`hiit`,
  activity, durationMinutes, notes).

Booleans are stored as SQLite integers via Drizzle's `{ mode: "boolean" }`.
Dates are stored as ISO date strings, not native date types.

### API endpoints (all JSON, prefix `/api`)
- `GET    /workout-days`
- `GET    /sessions`, `GET /sessions/:id`, `POST /sessions`,
  `PATCH /sessions/:id`, `DELETE /sessions/:id`
  (delete also removes the session's sets)
- `GET    /sessions/:id/sets`, `POST /sets`, `PATCH /sets/:id`, `DELETE /sets/:id`
- `GET    /prs`, `POST /prs`
- `GET    /cardio`, `POST /cardio`
- `GET    /stats` — `{ weeklyCount, totalWorkouts, prCount, recentSessions }`

### Client pages (`client/src/pages/`)
- **Dashboard** (`/`) — stats + recent sessions + quick links (data-driven).
- **LogWorkout** (`/log`) — the core flow: pick a day + schedule, start a
  session, load preset exercises, log sets, finish. Preset exercises and
  per-exercise weight/form guidance live as **hardcoded maps at the top of
  `LogWorkout.tsx`** (`presetExercises`, `weightGuide`) keyed by workout-day
  name — keep these in sync with the seeded `workout_days`.
- **Progress** (`/progress`) — charts (recharts) over sessions and PRs.
- **Protocol** (`/protocol`) — **static** weekly schedule reference.
- **Nutrition** (`/nutrition`) — **static** nutrition guide (meals, hydration).
- **not-found** — fallback route.

Routing is **hash-based** (`useHashLocation`); `main.tsx` ensures the URL
always has a `#/` so deep links and static hosting work without server rewrites.

## Conventions

- **Language/modules:** TypeScript, ESM (`"type": "module"`), strict mode on.
  Prefer explicit shared types from `@shared/schema` over `any`.
- **Server:** keep all DB logic in `storage.ts` behind the `IStorage`
  interface; keep routes thin (parse → validate → call storage → respond).
  Validate every write with a zod schema before persisting.
- **Client data:** use TanStack Query for all server state; query keys are the
  API path as an array. After a mutation, invalidate the affected query keys.
  Don't hand-roll `fetch` in components — use `apiRequest` / the query client.
- **UI:** compose with shadcn/ui primitives from `@/components/ui`. Use the
  `cn()` helper (`@/lib/utils`) for conditional class names. Use Tailwind
  utility classes; reference theme colors via the CSS variables / semantic
  Tailwind tokens (`bg-background`, `text-muted-foreground`, `text-primary`,
  etc.) rather than hardcoded hex. The accent palette is burnt-orange
  (`--primary: 18 86% 52%`) with amber accents; light + dark themes are driven
  by the `.dark` class toggled in `ThemeProvider`.
- **Icons:** lucide-react. Workout `dayType` → icon maps are duplicated across
  a few pages; keep them consistent.
- **Fonts:** DM Sans (body) and DM Serif Display (headings/display), loaded in
  `client/index.html` and referenced via `var(--font-body)` / `var(--font-display)`.
- **Testability hooks:** interactive elements carry `data-testid` attributes
  (e.g. `button-start-workout`, `input-weight-0`). Preserve and follow this
  pattern when adding UI.
- **Adding a model/field:** update `shared/schema.ts` (table + insert schema +
  types), add the matching column to the `CREATE TABLE` DDL in `storage.ts`,
  extend `IStorage` + `Storage`, then wire routes and client. Run
  `npm run check`. (No migrations are tracked; the app self-creates tables.)

## Git workflow

- Active development branch for this work: **`claude/claude-md-docs-iqh3zv`**.
- Do all work on the designated branch; never push to `master` without
  explicit permission. Push with `git push -u origin <branch>`.
- Do not create pull requests unless explicitly asked.
- Never commit `data.db*`, `.env*` (except `.env.example`), `node_modules/`,
  or `dist/` — all are gitignored.

## Gotchas

- `data.db` is created on first server start; deleting it resets all data and
  re-seeds the workout days. It must never be committed (contains app data).
- `client/src/lib/queryClient.ts` has an `API_BASE` derived from a
  `"__PORT_5000__"` placeholder. When the placeholder is unsubstituted (the
  normal case) it resolves to `""`, so the client calls same-origin `/api/...`.
  Leave this mechanism intact unless you understand the deploy substitution.
- There is no auth layer — do not assume request-scoped users.
- Preset exercise lists and weight guidance are **client-side hardcoded** and
  keyed by workout-day *name*; renaming a seeded day in `storage.ts` will
  silently break preset loading in `LogWorkout.tsx`.
</content>
</invoke>
