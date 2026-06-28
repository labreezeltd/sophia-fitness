# Savora

A members-only dining & lifestyle discount club (in the mould of tastecard).
A two-sided marketplace: **members** pay a subscription to unlock discounts at
partner **venues**; venues pay to be sent paying customers. The platform earns
from both sides and runs on autopilot.

**Operated by Axiom Technologies Group Ltd** — see `shared/company.ts`.

## Stack

- **Frontend:** React + Vite + wouter + TanStack Query + Tailwind / shadcn-ui
- **Backend:** Express + Drizzle ORM + SQLite (better-sqlite3)

## Run locally

```bash
npm install
npm run dev          # http://localhost:5000
```

Production build:

```bash
npm run build
npm start            # serves the built app
```

## What's in the app

| Area | Route | What it does |
|---|---|---|
| Landing | `/` | Member + partner value proposition |
| Discover | `/discover` | Search/filter partner venues & offers |
| Venue + redeem | `/partner/:id` | Live redeem flow (calculates savings + commission) |
| Join | `/join` | Membership signup (monthly/annual) |
| Member card | `/card` | Digital card, savings history, referral code |
| For partners | `/partners` | Plans + venue application form |
| Owner console | `/console` | Dual-revenue KPIs, charts, approval queue, automations |
| Growth engine | `/growth` | Marketing studio, partner CRM, autopilot, outbox |

## Deploy (get a live link)

Pick one — both have a free tier and read the config in this repo:

### Render (recommended, simplest)
1. Push to GitHub (done).
2. https://dashboard.render.com → **New → Blueprint** → select this repo.
3. Render reads `render.yaml`, builds and deploys. You get a public URL.

### Railway
1. https://railway.app → **New Project → Deploy from GitHub repo**.
2. Railway reads `railway.json` (build `npm run build`, start `npm start`).

### Any Docker host (Fly.io, a VPS, etc.)
```bash
docker build -t savora .
docker run -p 5000:5000 savora
```

> **Data note:** SQLite stores data in `data.db`, which reseeds on a fresh
> container. For persistent production data, attach a disk/volume and point
> `data.db` at it (or move to Postgres — Drizzle already abstracts the queries).

## Going live with real accounts

The prototype works with zero external accounts. To take real payments and send
real email, create the accounts listed in **`SETUP.md`** and fill in **`.env`**
(copy from `.env.example`). Nothing in the code needs restructuring — the same
buttons that simulate today will perform the real action once keys are present.
