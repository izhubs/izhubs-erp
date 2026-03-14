<div align="center">

# izhubs ERP

**AI-extensible business management that adapts to your business — not the other way around.**

[![License: MIT](https://img.shields.io/badge/License-MIT-6366f1.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![v0.0 Scaffold](https://img.shields.io/badge/status-scaffold_complete-22c55e.svg)](#roadmap)

[Website](https://izhubs.com) · [Docs](#getting-started) · [Templates](templates/CONTRIBUTING_TEMPLATES.md) · [Roadmap](#roadmap)

</div>

---

## Why izhubs ERP?

Most ERP and CRM systems are built for IT teams, not business owners.  
**izhubs ERP** flips that — built for people who want to customize their system using AI, without writing code.

| | Traditional ERP | izhubs ERP |
|--|--|--|
| **Target** | IT admin, developer | Business owner, solo builder |
| **Setup** | Days of configuration | Docker + AI-guided wizard |
| **Customize** | Write code or pay consultant | Describe to AI → done |
| **Extend** | Complex plugin system | Vibe-code with guardrails |
| **UI** | Functional but outdated | Beautiful-first |
| **License** | Paid / Open Core | **MIT — truly free** |

---

## Key Features

### 🏭 Industry Templates
Pre-configured pipelines, custom fields, and automations for your specific business type.

| Template | Stages | Sub-templates |
|----------|--------|---------------|
| 🎯 **Agency / Freelancer** | lead → proposal → active → renewal | — |
| 🍽️ **Restaurant / F&B** | inquiry → reservation → seated → done | Fine dining, Street food, Cafe |
| 🏢 **Coworking / Office** | lead → consulting → site visit → won | — |
| 🛒 **E-commerce** | new order → shipped → delivered | — |
| ✨ **Your industry** | AI-generated from your description | [Contribute one →](templates/CONTRIBUTING_TEMPLATES.md) |

### 🤖 AI-Native from Day One
- **`.agent/` context layer** — every AI tool (Cursor, Claude, Antigravity) understands the project instantly
- **MCP Server** — query your ERP data with natural language from any AI tool
- **Vibe workflows** — `@morning-start`, `@feature-cycle`, `@commit-push`, `@rollback`

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

# 2. Copy env
cp .env.example .env.local

# 3. Start with Docker
docker compose up -d

# 4. Open
open http://localhost:3000/setup
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

### ✅ v0.0 — Scaffold (March 2026)
Full project foundation: AI context layer, core schema, templates, SCSS themes, PWA, i18n, app shell, DB migrations, lib stubs.

### 🔨 v0.1 — Foundation MVP *(in progress)*
- [ ] JWT auth (login, register, refresh)
- [ ] Core API: contacts + deals CRUD
- [ ] Pipeline Kanban view
- [ ] Custom Fields UI
- [ ] RBAC — roles and permissions

### 📋 v0.2 — Business Logic
- [ ] Automation rules engine
- [ ] Email integration (SMTP + Resend)
- [ ] CSV import / export
- [ ] Webhook outbound (n8n, Zapier, Make)
- [ ] Messaging (Telegram, Zalo, Slack)

### 🧩 v0.3 — Extension System
- [ ] Extension Marketplace
- [ ] MCP Server (AI tool integration)
- [ ] GraphQL API

### 🤖 v0.5 — AI Native
- [ ] Chat with your ERP data
- [ ] Natural language automation builder
- [ ] AI-generated insights

### 🏢 v1.0 — Enterprise Ready
- [ ] SSO (SAML, OIDC)
- [ ] Multi-tenant cloud
- [ ] Security audit

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

---

## Self-Hosting

izhubs ERP is **self-host first**. Your data stays yours.

```yaml
# docker-compose.yml is ready to go
docker compose up -d
```

Cloud hosting (managed, backups, updates) coming in v0.2.

---

## License

MIT © [izhubs](https://izhubs.com) — free to use, modify, and distribute.

---

<div align="center">

**Built with ❤️ for business owners who want AI-powered tools without vendor lock-in.**

[⭐ Star this repo](https://github.com/izhubs/izhubs-erp) · [🐛 Report a bug](https://github.com/izhubs/izhubs-erp/issues) · [💬 Discussions](https://github.com/izhubs/izhubs-erp/discussions)

</div>
