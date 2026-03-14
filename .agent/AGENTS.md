# izhubs ERP — AI Agent Guide

> Read this FIRST before every session. This is the source of truth for AI tools.

## What is this project?

**izhubs ERP** — open-source, AI-extensible business management platform.
Built by izhubs.com. Target: business owners who customize via AI tools — without needing to deeply code.

Repository: `github.com/izhubs/erp`
Stack: Next.js 14 + PostgreSQL + Redis + Docker

---

## Golden Rules — NEVER break these

1. **`core/schema/` is IMMUTABLE** — never modify entity type contracts. Extensions and modules only import from here.
2. **Extensions communicate ONLY via EventBus or Core API** — never access the database directly.
3. **Every DB change needs a migration** — create a file in `database/migrations/` with sequential numbering.
4. **All shared types live in `core/schema/`** — never define duplicate types in modules or extensions.
5. **Custom fields go through `core/engine/custom-fields.ts`** — never add columns directly to core tables.
6. **Contract tests must pass before every push** — run `npm run test:contracts`.
7. **DIRECT DATABASE ACCESS IS BANNED** — Only `core/engine/` may talk directly to the database. All modules, extensions, the frontend, and any external tools (n8n, webhooks, MCP) MUST call the versioned REST API (`core/api/v1/`). No exceptions.
8. **REUSE OVER REPEAT — MODULAR BY DEFAULT** — Any logic that appears in 2+ places MUST be extracted to `lib/utils/`, `lib/hooks/`, or `core/engine/`. No inline CSS (`style={{}}`). No hardcoded colors/spacing (use `var(--token)`). No component > 150 lines. Read `.agent/skills/clean-code-and-modularity.md` before writing any UI or logic.

---

## Architecture in 3 sentences

**Core Engine** provides stable entities, events, and a versioned API — it never changes its contracts.
**Modules** build business logic on top of Core using only the Core API — no direct DB access.
**Extensions** listen to EventBus events and call the Core API — they are fully isolated from the DB.

```
core/schema/    ← Source of truth (read-only for everyone else)
core/engine/    ← Entity CRUD, EventBus, permissions, custom fields
core/api/v1/    ← Versioned REST API (never breaking)
modules/        ← Business logic (CRM, contracts, invoices, reports, automation)
extensions/     ← User plugins (guardrailed by SDK + manifest)
ai/             ← MCP server + built-in agent
app/            ← Next.js frontend
```

---

## Start every AI session

If the user says **"hi"**, **"hello"**, **"good morning"**, or **"chào buổi sáng"**:
1. Immediately run the `.agent/workflows/morning-start.md` workflow.
2. Read `memory.md` → understand current state and what's in-progress
3. Summarize the state to the user and ask what they want to work on today.
2. Read the relevant skill in `.agent/skills/` before implementing
3. Check `core/schema/` for existing types before creating new ones
4. Run `npm test` after every significant change
5. Update `memory.md` after completing work

---

## Available Skills

| Skill | When to use |
|-------|-------------|
| `erp-architecture` | Understand the full system before any change |
| `add-entity` | Add a new core entity to the system |
| `migration-guide` | Write a DB migration correctly |
| `add-custom-field` | Add a user-defined field to an entity |
| `create-module` | Scaffold a new business module |
| `create-extension` | Build a guardrailed extension/plugin |
| `mcp-tool-design` | Add a new tool to the MCP server |
| `event-bus-patterns` | Publish or subscribe to system events |

### From antigravity-awesome-skills (installed in .agent/skills/)

| Skill | When to use |
|-------|-------------|
| `architecture` | Before designing any new module or major feature |
| `api-design-principles` | Every time a new route is added to `core/api/v1/` |
| `test-driven-development` | Write contract tests FIRST before implementation |
| `database-design` | New tables, relations, or major schema changes |
| `security-auditor` | Before releasing auth, API keys, or webhooks to production |
| `api-security-best-practices` | When implementing Public API / API key system |
| `docker-expert` | Docker Compose troubleshooting or Coolify setup |
| `playwright-skill` | E2E testing for critical flows (login, CRUD, onboarding) |
| `debugging-strategies` | Systematic troubleshooting when root cause is unclear |
| `create-pr` | Packaging community contributions into clean pull requests |
| `doc-coauthoring` | Writing architecture docs or contributor guides |

---

## Available Workflows

| Workflow | When to use |
|----------|-------------|
| `morning-start` | Start of every work session |
| `add-feature` | Add any new feature end-to-end |
| `commit-push` | Commit and push changes safely |
| `rollback` | Revert to a previous state |
| `review-skills` | Periodic check for new awesome-skills (monthly) |
