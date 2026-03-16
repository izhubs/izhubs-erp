# Track: Automation Schema

**Created**: 2026-03-16  
**Status**: planning  
**Priority**: high — structural foundation, DB schema is a contract, must be correct before any UI or execution engine  
**Depends on**: `json-template-format` (borrows CustomFieldTypeSchema pattern)

---

## Summary

Define the JSON schema for automation rules (Trigger → Condition → Action) and create the DB table to store them. Rules are stored as JSONB — portable, shareable like n8n workflows, AI-generatable. This sprint is schema + storage only. Visual builder UI is out of scope.

## User Stories

- As an **admin**, I want to define "When a deal is won, send a webhook" without writing code
- As a **developer/AI agent**, I want a clear Zod schema so I can generate valid automation JSON
- As a **template maker**, I want to bundle automation rules in my template JSON and have them install with the template
- As a **future marketplace buyer**, I want to import an "E-commerce automation pack" (JSON file) into my izhubs instance

## Acceptance Criteria

- [ ] `core/schema/automation.ts` exports `AutomationRuleSchema` (Zod) and `AutomationRule` type
- [ ] DB migration `007_automation_rules.sql` creates `automation_rules` table with JSONB `definition` column
- [ ] `core/engine/automation.ts` has `validateRule(json)` → `Result<AutomationRule, ZodError>`
- [ ] `core/engine/automation.ts` has `executeRule(rule, event)` — runs actions if trigger + conditions match
- [ ] EventBus calls `executeRule` on every emitted event (registered as a listener in app startup)
- [ ] `GET /api/v1/automations` returns list of automation rules for org
- [ ] `POST /api/v1/automations` creates a new rule (validates JSON before storing)
- [ ] `PATCH /api/v1/automations/[id]` toggles `enabled` or updates definition
- [ ] `DELETE /api/v1/automations/[id]` soft-deletes rule
- [ ] `npm run typecheck` 0 errors, `npm run test:contracts` 34/34 pass + new automation contract tests

---

## Technical Plan

### Automation JSON Schema

```typescript
// core/schema/automation.ts

export const TriggerSchema = z.object({
  event: z.enum([
    'deal.created', 'deal.stage_changed', 'deal.won', 'deal.lost',
    'contact.created', 'contact.updated',
    'activity.completed', 'activity.overdue',
  ]),
  when: z.record(z.unknown()).optional(), // e.g. { to: 'won' } for stage_changed
});

export const ConditionSchema = z.object({
  field:    z.string(),             // e.g. 'deal.value'
  op:       z.enum(['=', '!=', '>', '<', '>=', '<=', 'contains', 'not_contains']),
  value:    z.unknown(),
  logic:    z.enum(['and', 'or']).default('and'),
});

export const ActionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('webhook'),  url: z.string().url(), method: z.enum(['GET','POST']).default('POST') }),
  z.object({ type: z.literal('email'),    to: z.string().email(), template: z.string() }),
  z.object({ type: z.literal('notify'),   message: z.string() }),             // in-app toast
  z.object({ type: z.literal('update_field'), field: z.string(), value: z.unknown() }),
]);

export const AutomationRuleSchema = z.object({
  id:          z.string().uuid(),
  name:        z.string().min(1),
  trigger:     TriggerSchema,
  conditions:  z.array(ConditionSchema).default([]),
  actions:     z.array(ActionSchema).min(1),
  enabled:     z.boolean().default(true),
});
```

### Example Rule JSON
```json
{
  "id": "550e8400-...",
  "name": "Notify Slack when big deal won",
  "trigger": { "event": "deal.stage_changed", "when": { "to": "won" } },
  "conditions": [{ "field": "deal.value", "op": ">", "value": 50000 }],
  "actions": [
    { "type": "webhook", "url": "https://hooks.slack.com/..." }
  ],
  "enabled": true
}
```

### DB Changes
**New migration:** `database/migrations/007_automation_rules.sql`
```sql
CREATE TABLE automation_rules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  definition  JSONB NOT NULL,          -- full AutomationRule JSON
  enabled     BOOLEAN NOT NULL DEFAULT true,
  created_by  UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  deleted_at  TIMESTAMPTZ             -- soft delete
);
CREATE INDEX idx_automation_rules_org ON automation_rules(org_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_automation_rules_enabled ON automation_rules(org_id, enabled) WHERE deleted_at IS NULL;
```

### API Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/automations` | `withPermission('automations:read')` | List rules for org |
| POST | `/api/v1/automations` | `withPermission('automations:write')` | Create rule |
| PATCH | `/api/v1/automations/[id]` | `withPermission('automations:write')` | Update / toggle |
| DELETE | `/api/v1/automations/[id]` | `withPermission('automations:write')` | Soft delete |

### EventBus Integration
```typescript
// In app startup (app/startup.ts or similar):
eventBus.onAny(async (event, payload) => {
  const rules = await getEnabledRulesForOrg(payload.orgId);
  for (const rule of rules) {
    await executeRule(rule, { event, payload });
  }
});
```

### New Files
- `core/schema/automation.ts` — Zod schemas + types
- `core/engine/automation.ts` — validate + execute functions
- `database/migrations/007_automation_rules.sql` — DB table
- `app/api/v1/automations/route.ts` — GET + POST
- `app/api/v1/automations/[id]/route.ts` — PATCH + DELETE
- `tests/contracts/automations.test.ts` — contract tests

---

## Implementation Phases

- [ ] Phase 1: `core/schema/automation.ts` — Zod schema + types
- [ ] Phase 2: DB migration `007_automation_rules.sql`
- [ ] Phase 3: `core/engine/automation.ts` — validate + execute functions
- [ ] Phase 4: API endpoints (CRUD)
- [ ] Phase 5: EventBus integration at startup
- [ ] Phase 6: Contract tests

---

## Out of Scope

- Visual drag-drop automation builder UI → v0.3
- Automation template bundles (in template.json) → after `json-template-format` is done
- Scheduled triggers (cron-based) → needs BullMQ, v0.3
- Complex multi-step branching logic → v0.4
- Action: `create_deal`, `create_contact` → v0.3 (avoid scope creep)
- Any UI beyond API — no automation list page in this sprint

---

## Open Questions

- [ ] Should `executeRule` be synchronous or async queue? (Decision: **async fire-and-forget** for webhooks, synchronous for `notify` and `update_field` — avoids BullMQ dependency in v0.2)
- [ ] Rate limiting on webhook actions? (Decision: **no limit in v0.2**, add in v0.3 when abuse risk is real)
