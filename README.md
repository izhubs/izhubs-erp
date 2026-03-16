<div align="center">

# izhubs ERP

**The CRM for agencies and freelancers who migrated from Airtable, Notion, or Google Sheets — and want AI to help them grow.**

[![License: MIT](https://img.shields.io/badge/License-MIT-6366f1.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![v0.1 Foundation MVP](https://img.shields.io/badge/status-foundation_mvp-6366f1.svg)](#roadmap)

[Website](https://izhubs.com) · [Templates on Gumroad](#templates) · [Docs](#getting-started) · [Roadmap](#roadmap)

</div>

---

## Why izhubs ERP?

Agencies and freelancers outgrow Airtable, Notion, and Google Sheets fast.
But moving to Salesforce or HubSpot means paying $100+/user/month for tools built for enterprise sales teams — not solo builders.

**izhubs ERP** fills the gap: a beautiful, self-hosted CRM built for agencies and freelancers, that imports your existing data from Airtable/Notion/Sheets in minutes, and lets AI tools extend it — without writing code.

| | HubSpot | Airtable | izhubs ERP |
|--|--|--|--|
| **Target** | Marketing teams | Spreadsheet users | **Agency / Freelancer** |
| **Self-host** | ❌ | ❌ | ✅ Free forever |
| **Import from Airtable/Notion** | Manual CSV | N/A | ✅ **AI-mapped** |
| **Vibe coding** | ❌ | ❌ | ✅ **Built-in** |
| **License** | Paid | Freemium | **MIT — truly free** |

---

## Key Features

### 📥 Import from Airtable · Notion · Google Sheets *(v0.2)*
Upload your existing client list → AI maps the columns → your data is organized in 2 minutes. No manual re-entry.

### 🎯 Agency & Freelancer Vertical First
Pipeline pre-configured for agencies: Lead → Proposal → Active → Retainer → Renewal.  
Custom fields ready for project type, retainer value, renewal date.

### 🤖 AI-Native from Day One
- **`.agent/` context layer** — Cursor, Claude, Antigravity understand the project instantly
- **MCP Server** *(v0.2)* — query your CRM data with natural language from any AI tool
- **Vibe workflows** — `@morning-start`, `@feature-cycle`, `@commit-push`

### 🎨 Theme System
5 built-in themes switchable without rebuild. User preference saved per account.

<table>
<tr>
<td>⚫ Indigo Dark (default)</td>
<td>🟢 Emerald</td>
<td>🔴 Rose</td>
<td>🟡 Amber</td>
<td>⚪ Light</td>
</tr>
</table>

### 🧩 Guardrailed Extensions
Extensions communicate only via EventBus + Core API — never direct database access.  
Community can build plugins safely. The core never breaks.

### 🌐 Internationalization
Built-in i18n with `next-intl`. Missing translations automatically fall back to English.  
Currently: 🇬🇧 English · 🇻🇳 Vietnamese

---

## Getting Started

```bash
# 1. Clone
git clone https://github.com/izhubs/izhubs-erp.git
cd izhubs-erp

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local — set DATABASE_URL, REDIS_URL, JWT_SECRET

# 3. Start services
docker compose up -d

# 4. Run database migrations
npm run db:migrate

# 5. Load sample data (recommended for first run)
npm run seed:demo
# → Creates demo@izhubs.com / Demo@12345 with 20 contacts + 15 deals

# 6. Start the app (local dev)
npm run dev

# 7. Open
open http://localhost:1303
```

### Requirements
- Docker & Docker Compose
- Node.js 20+ (for local development)

---

## Daily AI Workflow

Every feature is built through a structured cycle — no sprint planning, no standups.
If your AI tool supports slash commands or file mentions (like Antigravity or Cursor), reference the workflow files directly:

```bash
# Morning: AI reads context, summarizes what's done, asks what's next
"hi" / "good morning" / "chào buổi sáng" (or "Read .agent/workflows/morning-start.md")

# Build a feature
"Read .agent/workflows/feature-cycle.md and build CSV import for contacts"
→ AI reads workflow → implements → tests → commits

# Ship
"Run .agent/workflows/commit-push.md"
→ contract tests → typecheck → commit → push

# Rollback if needed
"Run .agent/workflows/rollback.md"
```

---

## Architecture

```
┌─────────────────────────────────┐
│         EXTENSIONS              │  ← Community plugins (SDK guardrailed)
├─────────────────────────────────┤
│         MODULES                 │  ← CRM, contracts, invoices, automation
├─────────────────────────────────┤
│         CORE ENGINE             │  ← Immutable entities, events, versioned API
└─────────────────────────────────┘
```

**Rules that never break:**
- `core/schema/` is the source of truth — no breaking changes
- All DB changes → numbered migration files
- Extensions → EventBus + API only, no direct DB access
- Custom fields → JSONB, never add columns

**Tech stack:** Next.js 14 · PostgreSQL · Redis · Zod · SCSS · next-intl · Docker

---

## Roadmap

### 🔥 NOW — v0.1 Ship (March 2026)
- [x] JWT auth (login, register, refresh)
- [x] Core API: contacts + deals CRUD
- [x] Pipeline Kanban view (drag-drop, optimistic, 7 stages)
- [x] Custom Fields UI
- [x] RBAC — roles and permissions
- [ ] **Demo data seed** (`npm run seed:demo`) ← BLOCKER
- [ ] **Gumroad templates** — Agency Starter Pack $29 · Freelancer OS $29 ← REVENUE FIRST
- [ ] Community launch (Show HN, GitHub)

### 📥 v0.2 — Import + MCP (1 month)
- [ ] **Airtable import** — AI column mapping → contacts + deals
- [ ] **Notion import** — same AI mapper
- [ ] **Google Sheets import** — CSV or API
- [ ] **MCP Server** — `ask Claude about my deals` (moved up from v0.3)
- [ ] Agency vertical polish (retainer deal type, project tracking fields)

### ☁️ v0.3 — Managed Cloud (3 months)
- [ ] **$19/mo hosted** — multi-tenant via tenant_id (schema ready since v0.1)
- [ ] Automation rules engine
- [ ] E2E Playwright tests

### 🚀 v0.4+ — Scale
- [ ] 2nd vertical (Restaurant F&B) — after Agency $5K MRR
- [ ] Extension Marketplace
- [ ] AI chatbot on your ERP data

---

## Contributing

We welcome contributions in these areas:

### 🏭 Industry Templates *(easiest to start)*
Add a pre-configured template for your industry. No deep code knowledge needed.
→ [Read the guide](templates/CONTRIBUTING_TEMPLATES.md)

### 🌐 Translations
Help translate izhubs ERP to your language.
→ Add a file to `messages/[locale].json` — missing keys auto-fallback to English.

### 🧩 Core Features
Pick an item from the [v0.1 roadmap](#roadmap) and open a PR.  
Read `.agent/AGENTS.md` first — the AI context layer explains the architecture.

### 🐛 Bug Reports
Open a GitHub Issue with steps to reproduce.

### 🔀 Branching Strategy
- Open all Pull Requests against the **`master`** branch.
- The `production` branch is strictly reserved for automated Coolify deployments.

---

## Self-Hosting

izhubs ERP is **self-host first**. Your data stays yours.

```bash
# Full setup (copy & paste)
git clone https://github.com/izhubs/izhubs-erp.git && cd izhubs-erp
cp .env.example .env.local   # fill in secrets
docker compose up -d          # start Postgres + Redis
npm run db:migrate            # apply schema
npm run seed:demo             # optional: load sample data
npm run dev                   # http://localhost:1303
```

See [docs/self-host.md](docs/self-host.md) for detailed instructions, environment variables, and Coolify deployment guide.

Cloud hosting (managed, backups, updates) coming in v0.2.

---

## License

MIT © [izhubs](https://izhubs.com) — free to use, modify, and distribute.

---

<div align="center">

**Built with ❤️ for business owners who want AI-powered tools without vendor lock-in.**

[⭐ Star this repo](https://github.com/izhubs/izhubs-erp) · [🐛 Report a bug](https://github.com/izhubs/izhubs-erp/issues) · [💬 Discussions](https://github.com/izhubs/izhubs-erp/discussions)

</div>
