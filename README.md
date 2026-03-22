<div align="center">

# izhubs ERP

**Open-source CRM for agencies and freelancers — self-hosted, AI-native, import from Airtable/Notion in minutes.**

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-6366f1.svg)](https://opensource.org/licenses/AGPL-3.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![Tests](https://img.shields.io/badge/tests-58%20passing-22c55e.svg)](#)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[Live Demo](#interactive-demo) · [Quick Start](#getting-started) · [Roadmap](#roadmap)

</div>

---

## Why izhubs?

Agencies and freelancers outgrow Airtable and Notion fast. HubSpot starts at $100+/user/month and was built for enterprise sales teams, not solo builders.

**izhubs ERP** fills the gap.

| | HubSpot | Airtable | **izhubs ERP** |
|--|--|--|--|
| Target | Marketing teams | Spreadsheet users | **Agency / Freelancer** |
| Self-host | ❌ | ❌ | ✅ Free forever |
| Import from Airtable/Notion | Manual | N/A | ✅ **AI-mapped in 2 min** |
| AI coding workflows | ❌ | ❌ | ✅ **Built-in** |
| License | Paid | Freemium | **AGPL-3.0** |

---

## What's Shipped (v0.1)

### 📥 AI CSV Import
Drag-drop your Airtable/Notion/Sheets export → AI maps columns → contacts and deals appear in your pipeline. GPT-4o-mini with offline fuzzy fallback — no API key required.

### 🎯 Pipeline Kanban Board
Drag-drop across 7 stages with optimistic updates. Board stats: total pipeline value, won revenue, deal count.

### 🎪 Interactive Demo — Try Without Signing Up
Pick your industry + role → auto-login with a 30-min demo JWT → explore a full dashboard pre-loaded with realistic data.

```
Available industries: Agency · Freelancer · Coworking · Restaurant · Café
```

### 🧩 Module Registry
App Store UI for activating ERP modules. Feature toggle stored in DB — flip `is_active`, no re-deploy needed.

### 🤖 AI-Native Agent Layer
The `.agent/` directory gives any AI IDE (Cursor, Antigravity, Claude) instant context:
- `memory.md` — project rules, what's shipped, what's next
- `tracks/` — per-feature specs (SPEC.md) + STATUS.md board
- `workflows/` — `/morning-start`, `/feature-cycle`, `/commit-push`

---

## Getting Started

```bash
# 1. Clone
git clone https://github.com/izhubs/izhubs-erp.git
cd izhubs-erp

# 2. Configure environment
cp .env.example .env.local
# Set DATABASE_URL and JWT_SECRET

# 3. Postgres up
docker compose up -d postgres

# 4. Migrate + seed
npm run db:migrate
npm run seed:agency      # 15 contacts + 15 deals, agency pipeline

# 5. Run
npm run dev              # → http://localhost:1303
```

**Or try the interactive demo** at [localhost:1303/demo](http://localhost:1303/demo) — no signup needed.

### Requirements
- Docker & Docker Compose
- Node.js 20+

---

## AI Development Workflow

Designed for solo builders who use AI IDEs. Every feature follows a structured cycle:

```bash
/morning-start   # AI reads context, summarizes what's done, proposes today's task
/feature-cycle   # AI clarifies spec → implements → tests → commits
/commit-push     # typecheck + contract tests → commit → push
/rollback        # revert to last clean state
```

Drop into Cursor or Antigravity and start building. The `.agent/` layer prevents AI from going off-spec.

---

## Architecture

```
EXTENSIONS  ← Community plugins (SDK guardrailed, V8 isolate sandbox)
MODULES     ← CRM, contracts, invoices, automation (fat module pattern)
CORE ENGINE ← Immutable entities, events, versioned API
```

**Hard rules:**
- Only `core/engine/*.ts` may call `db.query()` — routes import from engine
- All routes use `ApiResponse` factory — never `NextResponse.json()` directly
- All DB changes → sequential numbered migration files (`database/migrations/`)
- Never `DELETE FROM` — soft-delete with `deleted_at`
- Custom fields → JSONB, never add columns

**Documentation:**
- [System Architecture](docs/02_Core_Architecture/architecture.md)
- [Data Layer Architecture](docs/02_Core_Architecture/data-layer-architecture.md)
- [CRM Domain Model (Leads vs Deals)](docs/02_Core_Architecture/crm-domain-model.md)

**Stack:** Next.js 14 App Router · PostgreSQL · Zod · SCSS · next-intl · Docker

---

## Roadmap

### ✅ v0.1 — Foundation MVP (March 2026)
- [x] JWT auth (access 15m + refresh 7d, httpOnly cookies)
- [x] Contacts + Deals CRUD API with Zod validation
- [x] Pipeline Kanban — drag-drop, optimistic updates, 7 stages
- [x] RBAC — `withPermission()` guard, 4 roles
- [x] Soft-delete — no hard deletes, ever
- [x] AI CSV Import — GPT-4o-mini + fuzzy fallback, wizard UI
- [x] Interactive Demo — industry + role selector, auto-login
- [x] Module Registry — App Store UI, `withModule()` guard
- [x] 58 contract tests passing
- [x] 5 industry seeds (agency, freelancer, coworking, restaurant, café)
- [x] Multi-tenant schema — `tenant_id` on all tables
- [ ] **Gumroad templates** — Agency Starter $29 · Freelancer OS $29 ← **NEXT**
- [ ] README GIF demo
- [ ] Community launch (Show HN + GitHub release)

### 📥 v0.2 — Import + MCP (1 month)
- [ ] Airtable import — native API + CSV, AI mapper
- [ ] Notion import — CSV export, same mapper
- [ ] Google Sheets import — Sheets API or CSV
- [ ] **MCP Server** — `ask Claude about my deals`
- [ ] Agency vertical polish (retainer type, project tracking fields)
- [ ] JSON template format — portable for Gumroad distribution

### ☁️ v0.3 — Managed Cloud (3 months)
- [ ] $19/mo hosted — multi-tenant (schema already ready)
- [ ] Automation rules engine (Trigger → Condition → Action)
- [ ] E2E Playwright tests

### 🚀 v0.4+ — Scale
- [ ] 2nd vertical (Restaurant) — after Agency hits $5K MRR
- [ ] Extension Marketplace
- [ ] AI chatbot on your ERP data

---

## Contributing

### 🏭 Industry Templates *(easiest entry point)*
Copy `scripts/seeds/seed-agency.js`, add your industry data, add a `npm run seed:yourname` script.  
No deep code knowledge required.

### 🌐 Translations
Add `messages/[locale].json`. Missing keys auto-fallback to English.

### 🧩 Core Features
Pick a v0.2 roadmap item, open a PR against `master`.  
Read `.agent/AGENTS.md` first — full architecture explained for AI and humans.

### 🔀 Branching
- PRs → `master`
- `production` → Coolify auto-deploy only

---

## Self-Hosting

```bash
git clone https://github.com/izhubs/izhubs-erp.git && cd izhubs-erp
cp .env.example .env.local && nano .env.local   # set DATABASE_URL + JWT_SECRET
docker compose up -d postgres
npm run db:migrate && npm run seed:agency
npm run dev                                      # http://localhost:1303
```

Detailed guide: [docs/self-host.md](docs/self-host.md) · Managed cloud hosting coming in v0.3.

---

## License

AGPL-3.0 © [izhubs](https://izhubs.com)

---

<div align="center">

**Built for business owners who want powerful tools without vendor lock-in.**

[⭐ Star this repo](https://github.com/izhubs/izhubs-erp) · [🐛 Issues](https://github.com/izhubs/izhubs-erp/issues) · [💬 Discussions](https://github.com/izhubs/izhubs-erp/discussions)

</div>
