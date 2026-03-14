---
name: database-safety
description: Core rules for preventing and catching database logic errors during AI vibe coding
---

# Database Safety Guardrails

Because DB logic errors are not visually apparent like UI errors, AI vibe coding in izhubs ERP relies on strict layers of defense to protect data integrity and business logic.

## The 3 Pillars of DB Safety

> ⚠️ **GOLDEN RULE: No direct DB access.** Only `core/engine/` may query the database directly.
> Everything else — modules, extensions, frontend pages, external tools (n8n, Zapier, LLM agents) —
> **MUST** go through `core/api/v1/`. No exceptions.

### Enforced Access Flow
```
┌─────────────────────────────────────┐
│  Frontend / Modules / Extensions    │  ← NOT allowed to import from core/engine/db.ts
│  n8n / Zapier / MCP / Webhooks     │
└──────────────────┬──────────────────┘
                   │ HTTP calls only
           core/api/v1/ (REST)         ← The only gate
                   │
           core/engine/                ← The ONLY layer that talks to PostgreSQL
                   │
             PostgreSQL
```

### 1. Zod Contract Enforcement (The Shield)
The database structure CAN drift, but the application's understanding of it must never be compromised.
**Rule:** Every single entity fetched from the database MUST be passed through its Zod schema before being returned to the application.

```typescript
// BAD: Trusting the database raw output blindly
const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
return result.rows[0]; // If the DB schema changed, the app crashes unpredictably later

// GOOD: Enforcing the contract
import { UserSchema } from '../schema/entities';
const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
return UserSchema.parse(result.rows[0]); // Throws an explicit ZodError immediately if data is malformed
```

### 2. Contract Testing (The Validator)
Before any API route is written, the core engine logic that touches the DB must have a contract test.

**Rule:** Every entity must have a test in `tests/contracts/[entity].test.ts` that verifies:
- `create` returns a valid Zod object
- `read` returns exactly the expected fields
- Database constraints (e.g. unique emails) throw the correct Postgres errors
- Audit logs are correctly generated for the action

Run tests before committing: `npm run test:contracts`

### 3. Immutable Migrations (The Ledger)
AI agents are **banned** from running raw `ALTER TABLE` commands in the terminal or using auto-sync ORMs.

**Rule:** 
- If the schema needs to change, create a new file in `database/migrations/` (e.g. `006_add_status_to_deal.sql`).
- Only use safe migrations (default values for new columns, idempotent checks).
- Read `.agent/skills/migration-guide.md` before making any DB changes.

---

## What to do when a DB error happens?

If a Zod validation error or Postgres constraint error occurs during vibe coding:
1. **DO NOT blindly change the Zod schema** to match the broken DB state. The Zod schema is the source of truth.
2. **DO NOT delete random rows** to "fix" a constraint.
3. First, identify if the SQL query is wrong (e.g., missing a `JOIN`) or if the initial DB migration was flawed.
4. If the migration was flawed, write a NEW migration to fix it. Do not edit an already-committed migration file unless you are on a local branch and know it hasn't been merged to master.
