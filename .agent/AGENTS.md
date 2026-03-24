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

### ⚡ Anti-pattern Quick Reference

| ❌ NEVER do this | ✅ Do this instead |
|---|---|
| `import { db } from '@/core/engine/db'` (in a route) | `import * as ContactsEngine from '@/core/engine/contacts'` |
| `return NextResponse.json({...})` | `return ApiResponse.success(data)` or `ApiResponse.error(...)` |
| `DELETE FROM contacts WHERE id = $1` | `UPDATE contacts SET deleted_at = NOW() WHERE id = $1` |
| `ALTER TABLE contacts ADD COLUMN custom_note TEXT` | Use `customFields.set({ entityType, entityId, fieldKey, fieldValue })` |
| Edit `core/schema/entities.ts` to add business types | Create types in `modules/<name>/schema.ts` |
| Subscribe to DB triggers in an extension | `eventBus.on('deal.won', handler)` |

---

## Architecture in 3 sentences

**Core Engine** provides stable entities, events, and a versioned API — it never changes its contracts.
**Modules** build business logic on top of Core using only the Core API — no direct DB access.
**Extensions** listen to EventBus events and call the Core API — they are fully isolated from the DB.

```
core/schema/                   ← Source of truth (read-only for everyone else)
core/engine/                   ← Entity CRUD, EventBus, permissions, custom fields
core/api/v1/                   ← Versioned REST API (never breaking)
packages/izerp-plugin/modules/ ← Business logic (CRM, contracts, invoices) [Git Submodule]
packages/izerp-theme/components/ui/ ← IzUI Core UI components [Git Submodule]
packages/izerp-theme/templates/ ← Industry templates and dashboards [Git Submodule]
extensions/                    ← User plugins (guardrailed by SDK + manifest)
ai/                            ← MCP server + built-in agent
app/                           ← Next.js frontend (Core Shell)
```

---

## Start every AI session

If the user says **"hi"**, **"hello"**, **"good morning"**, or **"chào buổi sáng"**:
1. Immediately run the `.agent/workflows/morning-start.md` workflow.
2. Read `.agent/memory.md` → understand current state and what's in-progress
3. Read `.agent/tracks/STATUS.md` → check active tracks
4. Summarize the state to the user and ask what they want to work on today.

Every session:
1. Read the relevant skill in `.agent/skills/` before implementing
2. Check `core/schema/` for existing types before creating new ones
3. **If user wants a NEW feature** → use `conductor-new-track` skill FIRST, create SPEC.md BEFORE writing any code
4. Run `npm run test:contracts` after every significant change
5. Update `.agent/memory.md` and `.agent/tracks/STATUS.md` after completing work

**memory.md format reminder**: Update `What's Done`, `Active Backlog`, and `Dev startup` sections. Keep under 200 lines.
**CHANGELOG.md reminder**: Update `## [Unreleased]` section with any user-facing changes after each session.

---

## Available Skills

### ERP-Specific Skills (`.agent/skills/`)

> ⭐ = Native izhubs skills — ưu tiên dùng trước các generic skills.

| Skill | When to use |
|-------|-------------|
| `erp-architecture` | Understand the full system before ANY change |
| `add-entity` | Add a new core entity to the system |
| `migration-guide` | Write a DB migration correctly |
| `add-custom-field` | Add a user-defined field to an entity |
| `create-module` | Scaffold a new business module (old format) |
| `create-extension` | Build a guardrailed extension/plugin |
| `mcp-tool-design` | Add a new tool to the MCP server |
| `event-bus-patterns` | Publish or subscribe to system events |
| `clean-code-and-modularity` | Before writing ANY UI or logic — Uncle Bob + GoF |
| `database-safety` | Zod enforcement, soft-delete, immutable migrations |

#### ⭐ izhubs-native Skills (2026-03-18) — Dùng thay cho generic catalog

| Skill | Thay thế | When to use |
|-------|---------|-------------|
| `izhubs-api-route` | `api-design-principles` | Tạo hoặc review bất kỳ route nào trong `app/api/v1/` |
| `izhubs-database-engine` | `database-safety` + `postgres-best-practices` | Thêm entity mới hoặc sửa truy vấn DB |
| `izhubs-module-development` | `create-module` | Implement tính năng nghiệp vụ mới (invoices, HR, inventory) |
| `izhubs-security` | `api-security-best-practices` + `security-auditor` | Review security, implement auth, expose API public |
| `izhubs-testing` | `test-driven-development` | Viết tests cho bất kỳ loại code nào trong hệ thống |

### Project Management & Memory Skills

| Skill | When to use |
|-------|-------------|
| `conductor-new-track` | **MANDATORY** — User wants to build any new feature (even vague) → clarify spec FIRST |
| `conductor-status` | View all active tracks and project status (auto-called by /morning-start) |
| `conductor-manage` | Archive/restore/complete a track when done |
| `conductor-validator` | Validate SPEC.md before starting implementation |
| `conductor-setup` | One-time setup — initialize tracks directory (already done) |
| `context-driven-development` | Managing project context artifacts across sessions |
| `changelog-automation` | Generate changelog from commits, update CHANGELOG.md at release |

### From antigravity-awesome-skills (installed in `.agent/skills/`)

| Skill | When to use |
|-------|-------------|
| `architecture` | Before designing any new module or major feature |
| `api-design-principles` | Every time a new route is added to `core/api/v1/` |
| `api-security-best-practices` | Auth, API keys, or webhooks |
| `clean-code` | Code review or refactoring sessions |
| `database-design` | New tables, relations, or major schema changes |
| `debugging-strategies` | Systematic troubleshooting when root cause is unclear |
| `doc-coauthoring` | Writing architecture docs or contributor guides |
| `docker-expert` | Docker Compose troubleshooting or Coolify setup |
| `nextjs-best-practices` | App Router, Server Components, data fetching |
| `nextjs-app-router-patterns` | Advanced RSC, streaming, parallel routes |
| `playwright-skill` | E2E testing for critical flows (login, CRUD, onboarding) |
| `postgres-best-practices` | Query optimization, indexing, schema performance |
| `security-auditor` | Before releasing auth, API keys, or webhooks to production |
| `test-driven-development` | Write contract tests FIRST before implementation |
| `typescript-expert` | Advanced types, generics, type-level programming |
| `bullmq-specialist` | Redis queue / background jobs (v0.2+) |
| `zod-validation-expert` | Complex Zod schemas, custom refinements, inference |
| `create-pr` | Packaging community contributions into clean pull requests |

---

## Available Workflows

| Workflow | When to use |
|----------|-------------|
| `morning-start` | Start of every work session (reads memory + tracks + changelog) |
| `add-feature` | Add any new feature end-to-end |
| `commit-push` | Commit and push changes safely |
| `rollback` | Revert to a previous state |
| `review-skills` | Periodic check for new awesome-skills (monthly) |

## Track Files

```
.agent/tracks/
  STATUS.md          ← Master board of all feature tracks
  archive/           ← Completed/paused tracks
  [date]-[slug]/
    SPEC.md          ← Feature specification (created by conductor-new-track)
```

> **Rule**: Every feature starts with a SPEC.md. No code without spec.
