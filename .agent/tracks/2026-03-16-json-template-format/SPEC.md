# Track: JSON Template Format

**Created**: 2026-03-16  
**Status**: planning  
**Priority**: high — structural foundation, must be done before marketplace or AI generation  
**Risk refs**: master-plan.md § Monetization, § WordPress Pattern Map

---

## Summary

Migrate industry templates from TypeScript files to a single `template.json` per industry. Define a Zod-validated schema so templates are portable, shareable (like n8n workflows), and AI-generatable. Non-developers can create and sell templates without writing code.

## User Stories

- As a **template maker** (domain expert), I want to define my pipeline by editing a JSON file so that I don't need to know TypeScript
- As an **agent or AI**, I want a clear JSON schema so I can generate a valid template from a natural language description
- As a **user installing a template**, I want to `POST /api/v1/templates/install` with a JSON file and have it apply automatically
- As a **developer**, I want `TemplateDefinitionSchema` (Zod) so my IDE catches invalid templates at authoring time

## Acceptance Criteria

- [ ] `core/schema/template.ts` exports `TemplateDefinitionSchema` (Zod) and `TemplateDefinition` type
- [ ] `templates/industry/agency/template.json` is the reference implementation — valid against the schema
- [ ] `core/engine/templates.ts` has `validateTemplate(json)` → `Result<TemplateDefinition, ZodError>`
- [ ] `core/engine/templates.ts` has `applyTemplate(orgId, template)` → applies stages + customFields to org
- [ ] `GET /api/v1/templates` returns list of installed templates for current org
- [ ] `POST /api/v1/templates/install` accepts JSON body, validates, applies to org
- [ ] All existing TypeScript template files (`stages.ts`, `fields.ts`, `aiPrompt.ts`) in agency/ are replaced by `template.json`
- [ ] `npm run typecheck` passes, `npm run test:contracts` 34/34 passes

---

## Technical Plan

### JSON Schema (core of this track)
```typescript
// core/schema/template.ts
export const TemplateDefinitionSchema = z.object({
  id:          z.string().regex(/^[a-z-]+$/),
  name:        z.string().min(1),
  description: z.string(),
  version:     z.string().default('1.0.0'),
  stages:      z.array(z.string().min(1)).min(2).max(20),
  customFields: z.array(z.object({
    key:      z.string().regex(/^[a-z_]+$/),
    label:    z.string(),
    type:     CustomFieldTypeSchema,          // reuse from entities.ts
    options:  z.array(z.string()).optional(), // for select/multiselect
    required: z.boolean().default(false),
  })).default([]),
  aiPrompt:    z.string().optional(),
  metadata: z.object({
    author:   z.string().optional(),
    website:  z.string().url().optional(),
    license:  z.string().default('MIT'),
  }).optional(),
});
```

### Reference template.json
```json
{
  "id": "agency",
  "name": "Creative Agency",
  "description": "Pipeline for creative agencies managing client projects",
  "version": "1.0.0",
  "stages": ["Lead", "Discovery", "Proposal", "Production", "Review", "Done"],
  "customFields": [
    { "key": "project_type", "type": "select", "label": "Project Type",
      "options": ["Branding", "Web", "Video", "Print"] },
    { "key": "budget", "type": "number", "label": "Budget (USD)" },
    { "key": "deadline", "type": "date", "label": "Deadline" }
  ],
  "aiPrompt": "This is a creative agency pipeline. Deals represent client projects...",
  "metadata": { "author": "izhubs", "license": "MIT" }
}
```

### DB Changes
No new tables. `applyTemplate()` writes to existing:
- `options` table: `pipeline.stages` key (via Options API — require v0.2 options engine)
- `custom_field_definitions` table: insert rows per customField

### API Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/templates` | `withPermission('settings:read')` | List installed templates |
| POST | `/api/v1/templates/install` | `withPermission('settings:write')` | Validate + apply template JSON |
| GET | `/api/v1/templates/gallery` | public | List built-in templates (no auth) |

### New Files
- `core/schema/template.ts` — Zod schema + type
- `core/engine/templates.ts` — validate + apply functions
- `app/api/v1/templates/route.ts` — GET list, POST install
- `app/api/v1/templates/gallery/route.ts` — public gallery
- `templates/industry/agency/template.json` — reference (REPLACES .ts files)

### Delete Files
- `templates/industry/agency/index.ts`
- `templates/industry/agency/stages.ts`
- `templates/industry/agency/fields.ts`
- `templates/industry/agency/aiPrompt.ts`

---

## Implementation Phases

- [ ] Phase 1: `core/schema/template.ts` — Zod schema definition
- [ ] Phase 2: `core/engine/templates.ts` — validate + apply functions
- [ ] Phase 3: `templates/industry/agency/template.json` — migrate reference template
- [ ] Phase 4: API endpoints (GET gallery, POST install)
- [ ] Phase 5: Contract tests for template validation

---

## Out of Scope

- Template Builder UI (drag-drop editor) → v0.3
- Marketplace listing UI → v0.4
- Template uninstall / rollback → v0.3
- Automation workflow JSON format → separate track `automation-schema`
- EnrichmentProvider interface → separate track `enrichment-provider-contract`
- Any other templates beyond agency/ reference

---

## Open Questions

- [ ] Does `applyTemplate()` override or merge existing stages? (Decision: **merge** — never destructive)
- [ ] Should Options API (v0.2) be prerequisite, or write stages directly? (Decision: **write directly** — Options API is v0.2, stages can be stored in a simple `org_settings` JSONB column v0.1.5)
