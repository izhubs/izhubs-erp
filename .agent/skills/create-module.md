---
name: create-module
description: Scaffold a new business module in izhubs ERP. Modules use Core API only — zero direct DB access.
---

# Skill: Create Module

## What is a Module?

A module is self-contained business logic built **on top of Core Engine**, never inside it.

```
modules/
  crm/          ← contacts, pipeline, activities (built-in)
  contracts/    ← contract lifecycle (v0.2)
  invoices/     ← billing (v0.2)
  your-module/  ← you are here
```

## Step-by-step: Scaffold a new module

### 1. Create the module directory

```bash
mkdir modules/<module-name>
```

Minimum structure:
```
modules/<module-name>/
  index.ts          ← Public API surface (what other modules can call)
  engine.ts         ← Business logic (calls Core API internally)
  schema.ts         ← Module-specific Zod schemas
  events.ts         ← Events this module emits/listens to
  README.md         ← What this module does, who owns it
```

### 2. Define module-specific schema (`schema.ts`)

```typescript
import { z } from 'zod'

// Module-specific types — NOT added to core/schema/entities.ts
export const InvoiceSchema = z.object({
  id: z.string().uuid(),
  dealId: z.string().uuid(),
  amount: z.number().positive(),
  dueAt: z.string().datetime(),
  status: z.enum(['draft', 'sent', 'paid', 'overdue']),
})
export type Invoice = z.infer<typeof InvoiceSchema>
```

### 3. Business logic via Core API (`engine.ts`)

```typescript
// ✅ Call Core API — never import from core/engine/db.ts
async function createInvoiceForDeal(dealId: string, amount: number) {
  // Verify deal exists via Core API
  const dealRes = await fetch(`${process.env.INTERNAL_API_URL}/api/v1/deals/${dealId}`)
  if (!dealRes.ok) throw new Error('Deal not found')
  
  // Module-specific DB table (not core tables)
  const result = await moduleDb.query(
    'INSERT INTO invoices (deal_id, amount) VALUES ($1, $2) RETURNING *',
    [dealId, amount]
  )
  return InvoiceSchema.parse(result.rows[0])
}
```

### 4. Listen to Core events (`events.ts`)

```typescript
import { eventBus } from '@/core/engine/event-bus'

// Subscribe — never hook directly into DB triggers
eventBus.on('deal.won', async ({ deal }) => {
  await engine.generateInvoiceForWonDeal(deal)
})
```

### 5. Expose route under Core API namespace

```
app/api/v1/invoices/route.ts   ← Delegates to module engine
```

```typescript
import { withPermission } from '@/core/engine/rbac'
import { ApiResponse } from '@/core/engine/response'
import * as InvoicesEngine from '@/modules/invoices/engine'

export const POST = withPermission('invoices:write', async (req) => {
  const body = await req.json()
  const invoice = await InvoicesEngine.create(body)
  return ApiResponse.success(invoice, 201)
})
```

## Rules for modules

- ❌ Never import `db` from `core/engine/db.ts` — use Core API or a module-level DB pool
- ❌ Never modify `core/schema/entities.ts` — define types in `modules/<name>/schema.ts`
- ✅ Module tables get their own migrations in `database/migrations/`
- ✅ All routes use `withPermission()` + `ApiResponse`
- ✅ Publish events via `eventBus.emit()` after every state change

## Checklist before shipping

- [ ] Module has its own `README.md`
- [ ] No direct `db.query()` on core tables
- [ ] Zod schemas defined in module (not in core)
- [ ] Events subscribed via `eventBus.on()`, not DB triggers
- [ ] Migration file created for new tables
- [ ] Contract test added in `tests/contracts/`
