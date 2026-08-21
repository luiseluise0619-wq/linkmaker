# LinkMaker

**Create links. Track clicks. Understand your audience.**

> 📚 **코딩 처음이신가요?** 이 코드베이스를 웹 기초부터 차근차근 공부할 수 있는
> 아주 자세한 초보자용 한국어 학습 가이드가 있습니다 → [docs/LEARNING.md](docs/LEARNING.md)

LinkMaker is a production-ready, privacy-conscious link management and analytics
SaaS built with the modern Next.js App Router. Create editable short links,
image links and QR codes, then measure real traffic in a clean dashboard — with
no mock data and no invasive fingerprinting.

---

## Core features

- **No login — anonymous workspaces with a full dashboard.** There are no
  accounts or passwords. Shortening a link from the landing page instantly
  provisions a private **workspace** and gives you a **dashboard link**
  (`/d/<token>`) — open it on any device to manage your links, edit
  destinations, and see analytics. Each workspace is isolated (sessions are
  cookie-based; the dashboard link is the portable credential). Analytics can
  be **reset** to zero from Settings, and links also expose a read-only,
  token-gated stats page (`/s/<slug>?t=…`) for sharing.
- **Editable short links** — the short URL (`/go/<slug>`) is a permanent
  abstraction over the destination. Change where a link points anytime without
  breaking the URL, QR code or historical analytics.
- **Custom or auto-generated slugs** with validation (length, allowed
  characters, reserved-word and uniqueness checks).
- **Enable / disable** links and set **expiration dates**.
- **Image links** — upload an image (Vercel Blob), wrap it in a trackable link,
  and copy ready-made HTML / Markdown embed snippets.
- **QR codes** for every link, encoding the short URL so the code never expires
  when the destination changes. QR scans are tracked as their own source.
- **Privacy-first analytics** for every click: device, browser, OS, referrer,
  language, coarse geo (when the edge provides it), UTM parameters, bot
  classification and source (link vs QR).
- **Dashboards** — account overview, per-link detail pages, and an aggregate
  analytics page with a selectable timeline (24h / 7d / 30d / 90d), hourly and
  weekday activity, and device / browser / OS / country / referrer / UTM
  breakdowns.
- **Campaigns** to group links and measure combined performance.
- **Server-side isolation** — every workspace only sees its own links, images,
  campaigns and analytics, enforced on the server for every query.

## Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** + **shadcn/ui**-style components + **Recharts**
- **PostgreSQL** + **Prisma ORM**
- **Zod** validation everywhere on the server
- **Vercel Blob** for image storage
- Session auth via signed JWT cookies (`jose` + `bcryptjs`)

---

## Getting started (local)

### 1. Prerequisites

- Node.js 18.18+ (Node 20+ recommended)
- A PostgreSQL database

### 2. Install

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Fill in the values (see [Environment variables](#environment-variables)).
At minimum you need `DATABASE_URL`, `NEXT_PUBLIC_APP_URL`, `AUTH_SECRET` and
`ANALYTICS_SALT`.

Generate secrets with:

```bash
openssl rand -base64 32
```

### 4. Set up the database

```bash
npx prisma migrate deploy   # apply migrations
# or, for local dev iterations:
npx prisma migrate dev
```

### 5. (Optional) Seed demo data — development only

```bash
npm run db:seed
```

This creates a demo account:

- **Email:** `demo@linkmaker.app`
- **Password:** `demo12345`

The seed data is clearly separated from production — the dashboards read only
real events from the database and never depend on the seed.

### 6. Run

```bash
npm run dev
```

Open http://localhost:3000.

---

## Environment variables

**Only `DATABASE_URL` is required.** Everything else is optional — the app
auto-detects its URL on Vercel and auto-manages its signing secret and salt in
the database when they aren't set.

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | PostgreSQL connection string. On Vercel, connecting a Postgres store injects it automatically. |
| `NEXT_PUBLIC_APP_URL` | optional | Public base URL. Falls back to the Vercel deployment domain. Set to your custom domain in production. |
| `AUTH_SECRET` | optional | Session-signing secret. Auto-generated and stored in the DB if unset; set it to control rotation. |
| `ANALYTICS_SALT` | optional | Visitor-hash salt. Auto-generated and stored in the DB if unset. |
| `BLOB_READ_WRITE_TOKEN` | optional | Vercel Blob token. Required only for image uploads. |
| `ANALYTICS_RETENTION_DAYS` | optional | Retention window in days (default `365`). |
| `CRON_SECRET` | optional | Protects the retention cron endpoint. |

Secrets are never hardcoded and never exposed to the browser. Auto-managed
secrets live only in your database. For production, setting `AUTH_SECRET`
explicitly is recommended so it can be rotated independently.

**Rotating the signing secret:** set (or change) `AUTH_SECRET` in your
environment and redeploy. Rotating invalidates existing sessions (a one-time
logout for everyone), which is expected. Do not edit the DB-managed secret row
directly — warm instances cache it, so only an env change + redeploy rotates
cleanly. Anonymous (guest) accounts are ephemeral and are pruned by the
retention cron once they are old and have no real clicks.

You can check configuration at any time via `GET /api/health`.

---

## Deploying to Vercel

1. Push this repo to GitHub and import it into Vercel.
2. Create a **Postgres** database (Vercel Postgres, Neon, Supabase, …) and add
   its pooled connection string as `DATABASE_URL`.
3. (Optional) Create a **Blob** store under Storage and add
   `BLOB_READ_WRITE_TOKEN` to enable image uploads.
4. Add the required environment variables (see the table above). Set
   `NEXT_PUBLIC_APP_URL` to your production domain.
5. Run the migration against your production database:

   ```bash
   DATABASE_URL="<prod-url>" npx prisma migrate deploy
   ```

   (Or add it to your build/deploy pipeline.) The `build` script runs
   `prisma generate` automatically.
6. Deploy. The included `vercel.json` registers a daily cron that prunes
   analytics events older than the retention window.

---

## Redirect & performance

The hot path is `GET /go/[slug]`:

1. A single indexed lookup by `slug`.
2. Status / expiration checks.
3. A single lightweight analytics insert (failures never block the redirect).
4. A `302` redirect (with `Cache-Control: no-store`) to the current
   destination, applying any configured UTM parameters.

Indexes are defined on the hot fields (`Link.slug`, `Link.userId`,
`LinkEvent.linkId`, `LinkEvent.timestamp`, `country`, `deviceType`,
`referrerDomain`, `visitorHash`).

---

## Privacy model

- **No raw IPs are stored.** An IP is used transiently only to derive a
  **daily-rotating, salted, one-way hash** for unique-visitor *estimates*.
- **No cross-site cookies, no fingerprinting.**
- We only record what the request already provides and never claim data we
  can't see (e.g. screen size is stored only if a client reports it).
- Unique/returning visitor counts and bot detection are labeled as
  **estimates** throughout the UI.
- Retention is configurable; a cron job prunes old events.

See the in-app [Privacy Policy](/privacy) placeholder. It is not legal advice
and makes no automatic compliance claims — adapt it before production.

---

## API

Consistent JSON responses (`{ ok, data }` / `{ ok, error }`) with proper status
codes. All endpoints require authentication and enforce per-user authorization.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/links` | List your links (search, filter, pagination). |
| `POST` | `/api/links` | Create a link. |
| `GET` | `/api/links/[id]` | Get one link. |
| `PATCH` | `/api/links/[id]` | Update a link. |
| `DELETE` | `/api/links/[id]` | Delete a link. |
| `GET` | `/api/links/[id]/analytics` | Aggregated analytics for a link. |
| `GET` | `/api/links/[id]/qr` | PNG QR code (`?download=1` to download). |
| `GET` | `/go/[slug]` | Public redirect + analytics collection. |
| `POST` | `/api/public/links` | **No-account** link creation (rate-limited); returns `manageUrl`. |
| `GET` | `/api/qr/[slug]` | Public PNG QR code for a slug (`?download=1`). |
| `GET` | `/s/[slug]?t=…` | Token-gated analytics for an anonymous link. |
| `GET` | `/api/cron/prune` | Retention job (Bearer `CRON_SECRET`). |

---

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server. |
| `npm run build` | `prisma generate` + production build. |
| `npm run start` | Start the production server. |
| `npm run lint` | ESLint. |
| `npm run typecheck` | TypeScript check. |
| `npm run db:migrate` | `prisma migrate deploy`. |
| `npm run db:migrate:dev` | `prisma migrate dev`. |
| `npm run db:seed` | Seed dev demo data. |
| `npm run db:studio` | Prisma Studio. |

---

## Architecture notes & roadmap

The code is structured so these can be added without reworking the core:
A/B testing, conversion tracking, custom/branded domains, password-protected
links, geographic/device routing, scheduled/smart redirects, webhook events,
CSV export, API keys, and team/workspace accounts. The `Link` → `LinkEvent`
model, the source abstraction on the redirect, and the service layer in
`src/lib/links.ts` and `src/lib/stats.ts` are the extension points.

> **Note on rate limiting:** the included limiter (`src/lib/ratelimit.ts`) is
> in-memory and per-instance — good enough to blunt casual abuse. For strict
> multi-instance limiting, swap its store for Redis/Upstash; the interface is
> designed to be replaced without touching call sites.
