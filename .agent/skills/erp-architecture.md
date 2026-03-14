---
name: erp-architecture
description: Full system understanding for izhubs ERP. Read before any significant change.
---

# izhubs ERP — Architecture Overview

## The Three Layers

```
┌─────────────────────────────────────────┐
│           EXTENSIONS                    │  User plugins. Guardrailed by SDK.
│  (manifest.json, ExtensionBase SDK)     │  Communicate via EventBus + API only.
├─────────────────────────────────────────┤
│             MODULES                     │  Business logic (CRM, contracts, invoices)
│  (use Core API only, no direct DB)      │  Each module is self-contained.
├─────────────────────────────────────────┤
│            CORE ENGINE                  │  Immutable foundation.
│  (entities, events, API, permissions)   │  Never change contracts here.
└─────────────────────────────────────────┘
```

## Core Entities (core/schema/entities.ts)

| Entity | Key Fields | Relations |
|--------|-----------|-----------|
| `User` | id, name, email, role | owns Contacts, Deals |
| `Contact` | id, name, email, phone | belongs to Company, has Deals |
| `Company` | id, name, website, industry | has many Contacts |
| `Deal` | id, name, value, stage, ownerId | belongs to Contact + Company |
| `Activity` | id, type, subject, dueAt | linked to Contact, Deal, or Company |

## Event System (core/schema/events.ts)

All state changes emit events. Extensions and modules subscribe — never hook directly.

```typescript
// Always emit after mutating state
eventBus.emit('contact.created', { contact })
eventBus.emit('deal.stage_changed', { deal, fromStage, toStage })
eventBus.emit('deal.won', { deal })
```

## Custom Fields (core/engine/custom-fields.ts)

User-defined fields are stored in a `custom_fields` JSONB column — not as new DB columns.

```typescript
// Adding a custom value
await customFields.set({
  entityType: 'deal',
  entityId: deal.id,
  fieldKey: 'lead_source',
  fieldValue: 'Google Ads',
})
```

## API Conventions (core/api/v1/)

- All endpoints are versioned: `/api/v1/...`
- Always use parameterized queries — never string interpolation
- Validate all input with Zod before processing
- Return consistent shape: `{ data, error, meta }`

## File Naming Conventions

- Entities: PascalCase types, camelCase files (`entities.ts`)
- API routes: kebab-case paths (`/api/v1/deals`)
- Tests: same path as source + `.test.ts` suffix

## What NOT to do

- ❌ Import `pg` directly in modules or extensions — use Core API
- ❌ Add columns to core tables — use custom_fields
- ❌ Modify `core/schema/entities.ts` contracts unless it's a new field (not rename/remove)
- ❌ Skip migration files — every DB change needs one
