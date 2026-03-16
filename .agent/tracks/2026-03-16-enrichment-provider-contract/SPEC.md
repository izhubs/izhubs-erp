# Track: Enrichment Provider Contract

**Created**: 2026-03-16  
**Status**: planning  
**Priority**: high — API contract must be defined before community builds connectors  
**Depends on**: `json-template-format` (pattern precedent), `automation-schema` (infrastructure)  
**Phase**: v0.3 Extension Platform

---

## Summary

Define the `EnrichmentProvider` TypeScript interface and the API contract for contact enrichment modules. Community developers build connectors (LinkedIn, Apollo, Clearbit, Hunter.io) by implementing this interface. izhubs handles the UI trigger — modules handle the data. This prevents every enrichment module from inventing its own shape and breaking the UI.

## Background

Apollo.io charges $49-$99/month for contact enrichment. With izhubs' open marketplace, community builds free or paid enrichment modules. The interface must be defined before anyone builds — changing it after = breaking all existing modules.

## User Stories

- As a **user**, I want to click "Enrich" on a contact and have their LinkedIn, company size, and email verified automatically
- As a **module developer**, I want a clear TypeScript interface so I can build a LinkedIn enrichment connector without guessing the shape
- As an **org admin**, I want to configure which enrichment providers are enabled and in what order they run
- As a **template maker**, I want to bundle an enrichment provider config with my industry template

## Acceptance Criteria

- [ ] `core/interfaces/enrichment.ts` exports `EnrichmentProvider` interface and `ContactEnrichment` type
- [ ] `core/engine/enrichment.ts` has `runEnrichment(contactId, orgId)` — calls all enabled providers in sequence, merges results into `customFields`
- [ ] `GET /api/v1/contacts/[id]/enrich` triggers enrichment, returns updated contact
- [ ] Built-in stub provider `enrichment/providers/clearbit-stub.ts` implements the interface (for testing)
- [ ] Enrichment result stored in `contacts.customFields` JSONB (no new table needed)
- [ ] `npm run typecheck` 0 errors

---

## Technical Plan

### The Interface

```typescript
// core/interfaces/enrichment.ts

export interface ContactEnrichment {
  // Standardized fields — all providers map to these
  email?:       string;
  phone?:       string;
  title?:       string;         // "VP of Engineering"
  company?:     string;
  companySize?: string;         // "11-50", "51-200", etc.
  linkedinUrl?: string;
  twitterUrl?:  string;
  location?:    string;         // "San Francisco, CA"
  bio?:         string;
  avatarUrl?:   string;
  // Open extension — providers can add extra data
  raw?: Record<string, unknown>;
}

export interface EnrichmentProvider {
  id:       string;             // "clearbit" | "hunter" | "linkedin" etc.
  name:     string;
  icon:     string;             // URL to provider logo
  
  /** Check if this provider can enrich this contact (e.g., has email?) */
  canEnrich(contact: Contact): boolean;
  
  /** Run enrichment. Throw if API error. Return null if not found. */
  enrich(contact: Contact, config: Record<string, string>): Promise<ContactEnrichment | null>;
}

// Provider registry — modules register themselves here at startup
export interface EnrichmentRegistry {
  register(provider: EnrichmentProvider): void;
  getEnabled(orgId: string): Promise<EnrichmentProvider[]>;
}
```

### Merge Strategy
```typescript
// core/engine/enrichment.ts
async function runEnrichment(contactId: string, orgId: string) {
  const contact = await getContactById(contactId, orgId);
  const providers = await registry.getEnabled(orgId);
  
  let merged: ContactEnrichment = {};
  for (const provider of providers) {
    if (!provider.canEnrich(contact)) continue;
    const result = await provider.enrich(contact, await getProviderConfig(orgId, provider.id));
    if (result) merged = { ...merged, ...result }; // later providers overwrite
  }
  
  // Store in customFields under '__enriched' key
  await updateContact(contactId, orgId, {
    customFields: { ...contact.customFields, __enriched: merged, __enrichedAt: new Date().toISOString() }
  });
}
```

### DB Changes
**None** — enrichment data stored in existing `contacts.customFields` JSONB under `__enriched` key.

Optional future: `enrichment_configs` table for per-org provider API keys. Deferred to when first paid provider needs it.

### API Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/contacts/[id]/enrich` | `withPermission('contacts:write')` | Trigger enrichment, return updated contact |
| GET | `/api/v1/enrichment/providers` | `withPermission('settings:read')` | List available providers + enabled status |
| PATCH | `/api/v1/enrichment/providers/[id]` | `withPermission('settings:write')` | Enable/disable provider, set API key |

### New Files
- `core/interfaces/enrichment.ts` — interface definitions (THE contract)
- `core/engine/enrichment.ts` — registry + runEnrichment
- `enrichment/providers/clearbit-stub.ts` — stub implementation for testing
- `app/api/v1/contacts/[id]/enrich/route.ts` — POST endpoint

---

## Implementation Phases

- [ ] Phase 1: `core/interfaces/enrichment.ts` — interface definition only
- [ ] Phase 2: `core/engine/enrichment.ts` — registry + merge engine
- [ ] Phase 3: Stub provider `clearbit-stub.ts` — validates the interface works
- [ ] Phase 4: API endpoint POST `/enrich`
- [ ] Phase 5: "Enrich" button on Contact drawer (UI)

---

## Out of Scope

- Building real provider integrations (LinkedIn, Apollo) — that's community job
- Paid provider billing/metering — v0.4+
- Bulk enrichment of all contacts — v0.3b
- Enrichment history/audit log — v0.4
- Any UI beyond the "Enrich" button on contact drawer

---

## Open Questions

- [ ] Should `runEnrichment` be async fire-and-forget or wait for result? (Decision: **synchronous up to 10s timeout** — enrichment is user-initiated action, user expects to see result)
- [ ] Where do provider API keys live? (Decision: **org settings JSONB for now** — until `enrichment_configs` table needed)
