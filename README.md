# LinkMaker

**Create links. Track clicks. Understand your audience.**

LinkMaker is a production-ready, privacy-conscious link management and analytics
SaaS built with the modern Next.js App Router. Create editable short links,
image links and QR codes, then measure real traffic in a clean dashboard — with
no mock data and no invasive fingerprinting.

---

## Core features

- **No-account link creation with a full dashboard** — anyone can shorten a
  URL from the landing page without signing up. A **guest account** is
  auto-provisioned for their browser session, so they immediately get the full
  dashboard (links table, analytics, editing, campaigns) — each guest sees only
  their own links. Registering later **upgrades the guest in place**, keeping
  all of their links and analytics. Links also expose a private, token-gated
  stats page (`/s/<slug>?t=…`) that can be shared read-only.
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
- **Authentication & authorization** — every account only sees its own links,
  images, campaigns and analytics, enforced server-side.

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

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | PostgreSQL connection string. Use a pooled URL on serverless. |
| `NEXT_PUBLIC_APP_URL` | ✅ | Public base URL (no trailing slash). Used to build short URLs & QR codes. |
| `AUTH_SECRET` | ✅ | Secret used to sign session JWTs. Use a long random value. |
| `ANALYTICS_SALT` | ✅ | Salt for privacy-preserving visitor-hash estimation. |
| `BLOB_READ_WRITE_TOKEN` | ⛔️ optional | Vercel Blob token. Required only for image uploads. |
| `ANALYTICS_RETENTION_DAYS` | ⛔️ optional | Retention window in days (default `365`). |
| `CRON_SECRET` | ⛔️ optional | Protects the retention cron endpoint. |

Secrets are read from the environment only — nothing is hardcoded, and no
service-role/storage credentials are ever exposed to the browser.

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
