# izhubs ERP — Self-Hosting Guide

> **Requirements**: Docker & Docker Compose, Node.js 20+

---

## Quick Setup (5 minutes)

```bash
# 1. Clone the repo
git clone https://github.com/izhubs/izhubs-erp.git
cd izhubs-erp

# 2. Configure environment
cp .env.example .env.local
nano .env.local   # set DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET

# 3. Start Postgres + Redis
docker compose up -d

# 4. Run database migrations
npm run db:migrate

# 5. (Optional) Load sample data
npm run seed:demo
# → demo@izhubs.com / Demo@12345  |  20 contacts + 15 deals pre-loaded

# 6. Start the app
npm run dev        # development: http://localhost:1303
# — or —
npm run build && npm start   # production mode
```

---

## Required Environment Variables

Copy `.env.example` to `.env.local` and set these before starting:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | Full PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Min 32 chars — generate: `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | ✅ | Min 32 chars — must differ from JWT_SECRET |
| `REDIS_URL` | ✅ | Redis connection string |
| `NEXT_PUBLIC_APP_URL` | ✅ (prod) | Your public URL, e.g. `https://erp.mydomain.com` |
| `NODE_ENV` | ✅ (prod) | Set to `production` |

---

## Database Migrations

Migrations are sequential, numbered SQL files in `database/migrations/`.

```bash
npm run db:migrate   # applies all pending migrations
```

**Rules:**
- Migrations only ADD — never DROP or RENAME columns
- Never edit a committed migration file
- To make changes: create a new `00X_description.sql` file

---

## Upgrading

```bash
git pull origin master
npm install         # in case new packages were added
npm run db:migrate  # apply any new migrations
# restart your app server
```

---

## Deploying to Coolify

1. **Connect your repo**: Point Coolify to your `production` branch
2. **Set environment variables** in Coolify UI:
   - Mark `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET` as **Persistent**
   - Set `NODE_ENV=production`
   - Set `NEXT_PUBLIC_APP_URL=https://your-domain.com`
3. **After first deploy**, run via Coolify terminal:
   ```bash
   npm run db:migrate
   npm run seed:demo   # optional
   ```
4. **Health check**: Coolify should hit `/api/health` — returns `{ "status": "ok", "db": true, "redis": true }`

---

## Health Check

```bash
curl http://localhost:1303/api/health
# { "status": "ok", "db": true, "redis": true }
```

Returns `503` if DB or Redis is unreachable.

---

## Verify Everything Works

```bash
npm run typecheck       # TypeScript: must be 0 errors
npm run test:contracts  # API contracts: all must pass
```

---

## Resetting Demo Data

```bash
# Wipe and re-seed (destroys all data):
# 1. Drop and recreate DB via psql
# 2. Run migrations again
npm run db:migrate
npm run seed:demo
```

> ⚠️ There is no "soft reset" in v0.1 — a full DB wipe is required. UI-based reset coming in v0.2.

---

## First Login

After running `seed:demo`:

| Field | Value |
|-------|-------|
| Email | `demo@izhubs.com` |
| Password | `Demo@12345` |
| Role | Admin |

To create your own admin account, use `/setup` on first run (before seed).
