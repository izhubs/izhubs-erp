---
name: add-custom-field
description: Add a user-defined custom field to any core entity. Always use core/engine/custom-fields.ts — never add columns directly.
---

# Skill: Add Custom Field

## Rule #1 — NEVER add a DB column for user-defined data

Custom fields go in the `custom_fields` JSONB column. Adding columns = migration hell.

```
❌ ALTER TABLE contacts ADD COLUMN lead_source TEXT;
✅ Use customFields.set({ entityType, entityId, fieldKey, fieldValue })
```

## File: `core/engine/custom-fields.ts`

This is the ONLY place that reads/writes custom field data.

```typescript
// Set a custom field value
await customFields.set({
  entityType: 'contact' | 'deal' | 'company' | 'activity',
  entityId: string,        // UUID of the record
  fieldKey: string,        // e.g. 'lead_source', 'vat_number'
  fieldValue: unknown,     // any JSON-serializable value
})

// Get custom field values for a record
const fields = await customFields.get({
  entityType: 'contact',
  entityId: contactId,
})
// Returns: Record<string, unknown>

// Get all records that have a specific custom field key
const results = await customFields.query({
  entityType: 'deal',
  fieldKey: 'lead_source',
  fieldValue: 'Google Ads',  // optional filter
})
```

## Adding a new custom field to a module

1. **Define the field metadata** in the module's config (not in core schema):
```typescript
// modules/crm/custom-field-definitions.ts
export const CRM_CUSTOM_FIELDS = {
  lead_source: { label: 'Lead Source', type: 'select', options: ['Google', 'Referral', 'Cold'] },
  vat_number: { label: 'VAT Number', type: 'text' },
}
```

2. **Write via Core API** (from the UI or a route):
```typescript
// From a Next.js API route (never from frontend directly)
await fetch('/api/v1/contacts/{id}/custom-fields', {
  method: 'PATCH',
  body: JSON.stringify({ fieldKey: 'lead_source', fieldValue: 'Google' })
})
```

3. **Read in UI** — merge custom_fields with the entity:
```typescript
const contact = await ContactsEngine.getContact(id)
// contact.customFields is already merged in the engine layer
```

## What NOT to do

- ❌ Add a column to `contacts`, `deals`, or any core table for user data
- ❌ Store custom field definitions in `core/schema/entities.ts`
- ❌ Access `custom_fields` JSONB directly from a route — always use the engine
- ❌ Mix system fields with custom fields in the same namespace

## Checklist before shipping

- [ ] Custom field is defined in the module, not in core schema
- [ ] Read/write goes through `core/engine/custom-fields.ts`
- [ ] UI uses `/api/v1/{entity}/{id}/custom-fields` endpoint
- [ ] Field definition includes: key, label, type, validation rules
