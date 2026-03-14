# izhubs ERP — Architecture & Project Structure

> AI-self-buildable. Every AI tool reading this should understand, build, and extend the system correctly.
> Full detail: `.agent/AGENTS.md` và `.agent/skills/erp-architecture.md`

## Philosophy

> **"ERP phải theo doanh nghiệp, không phải ngược lại."**

## Architecture — 3 Layers

```
EXTENSIONS   ← User plugins (manifest + ExtensionBase SDK, guardrailed)
MODULES      ← Business logic (CRM, contracts, invoices, automation)  
CORE ENGINE  ← Immutable foundation (entities, events, versioned API)
```

**Golden Rules:**
- `core/schema/` là source of truth — không ai được modify contracts
- Extensions giao tiếp ONLY qua EventBus + Core API — không đụng DB trực tiếp
- Mọi DB change → migration file trong `database/migrations/`
- Custom fields → qua `custom-fields.ts`, không thêm column

## Project Structure

```
izhubs-erp/
├── .agent/              ← AI reads this FIRST
│   ├── AGENTS.md        ← Golden rules
│   ├── memory.md        ← Living context
│   ├── skills/          ← erp-architecture, add-entity, migration-guide
│   └── workflows/       ← morning-start, add-feature, commit-push, rollback, review-skills
├── core/
│   ├── schema/          ← entities.ts, events.ts, index.ts (SOURCE OF TRUTH)
│   └── engine/          ← event-bus.ts, entity-engine.ts, custom-fields.ts
├── modules/             ← crm, contracts, invoices, reports, automation
├── extensions/sdk/      ← ExtensionBase.ts, types.ts
├── templates/
│   ├── industry/        ← agency, restaurant, coworking, ecommerce
│   └── CONTRIBUTING_TEMPLATES.md
├── ai/                  ← mcp-server/, agent/
├── app/                 ← Next.js frontend
├── database/migrations/ ← Sequential SQL
├── tests/               ← unit, integration, e2e, contracts
└── docs/                ← This file + competitive analysis
```

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14 App Router |
| Database | PostgreSQL (migrations, no ORM) |
| Validation | Zod (all types from core/schema/) |
| Auth | JWT (jose) |
| Cache | Redis |
| AI | MCP Server + Built-in Agent |
| Deploy | Docker Compose + Coolify |

## Industry Templates System

**3-level niche system** — unique to izhubs ERP:
```
Level 1: Industry template (agency, restaurant, coworking, ecommerce...)
Level 2: Sub-template (fine-dining, street-food, cafe...)  
Level 3: AI-generated (user describes business → AI generates custom config)
```

## Daily Dev Workflow

```
1. "Use @morning-start"       → AI reads context, summarizes status
2. "Tôi muốn thêm [feature]" → AI reads skill → implements → tests
3. "Use @commit-push"         → contract tests → typecheck → commit
4. "Use @rollback"            → revert to any previous commit
```
