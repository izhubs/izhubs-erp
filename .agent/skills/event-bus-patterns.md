---
name: event-bus-patterns
description: Publish and subscribe to system events via EventBus in izhubs ERP. The ONLY way modules and extensions communicate with Core.
---

# Skill: Event Bus Patterns

## The Golden Rule

**Modules and Extensions NEVER poll the DB or call each other directly.**  
They communicate exclusively via `eventBus` — publish/subscribe only.

## Core Event Types (`core/schema/events.ts`)

```typescript
// These are the canonical events emitted by Core Engine
type ERPEvents = {
  'contact.created':      { contact: Contact }
  'contact.updated':      { contact: Contact; changes: Partial<Contact> }
  'contact.deleted':      { contactId: string }
  'deal.created':         { deal: Deal }
  'deal.stage_changed':   { deal: Deal; fromStage: string; toStage: string }
  'deal.won':             { deal: Deal }
  'deal.lost':            { deal: Deal; reason?: string }
  'company.created':      { company: Company }
  'activity.completed':   { activity: Activity }
  'user.login':           { userId: string; email: string }
}
```

## Publishing Events (Core Engine only)

Only `core/engine/*.ts` publishes events. Never publish from a route or module.

```typescript
// core/engine/deals.ts
import { eventBus } from '@/core/engine/event-bus'

export async function updateDealStage(id: string, newStage: string) {
  const old = await getDeal(id)
  await db.query('UPDATE deals SET stage = $1 WHERE id = $2', [newStage, id])
  const updated = await getDeal(id)
  
  // Always emit AFTER the DB change is committed
  eventBus.emit('deal.stage_changed', {
    deal: updated,
    fromStage: old.stage,
    toStage: newStage,
  })
  
  // Emit semantic events for important transitions
  if (newStage === 'won') {
    eventBus.emit('deal.won', { deal: updated })
  }
  
  return updated
}
```

## Subscribing to Events (Modules & Extensions)

```typescript
// modules/notifications/events.ts
import { eventBus } from '@/core/engine/event-bus'

// Register handlers at module startup
export function registerEventHandlers() {
  eventBus.on('deal.won', async ({ deal }) => {
    await sendSlackAlert(`🎉 Deal won: ${deal.name} — $${deal.value}`)
  })

  eventBus.on('contact.created', async ({ contact }) => {
    await enrichContactFromClearbit(contact.email)
  })

  eventBus.on('deal.stage_changed', async ({ deal, fromStage, toStage }) => {
    await logAuditEvent({ entityType: 'deal', entityId: deal.id, fromStage, toStage })
  })
}
```

## Event Handler Best Practices

```typescript
// ✅ Always handle errors — never let a handler crash the publisher
eventBus.on('deal.won', async ({ deal }) => {
  try {
    await generateInvoice(deal)
  } catch (err) {
    console.error('[invoices] Failed to auto-generate invoice:', err)
    // Log but don't rethrow — other handlers must still run
  }
})

// ✅ Handlers should be idempotent (safe to run twice)
eventBus.on('contact.created', async ({ contact }) => {
  const existing = await findEnrichmentRecord(contact.id)
  if (existing) return  // Already processed
  await enrichContact(contact)
})

// ❌ Never await in publisher code before emitting
// ❌ Never call DB directly in event handlers — use Core API
// ❌ Never subscribe to events inside a component or route
```

## Module-Level Events

Modules can define and emit their own events for cross-module communication:

```typescript
// modules/invoices/events.ts
type InvoiceEvents = {
  'invoice.sent':     { invoice: Invoice; recipientEmail: string }
  'invoice.paid':     { invoice: Invoice; paidAt: string }
  'invoice.overdue':  { invoice: Invoice; daysPastDue: number }
}

// modules/emails/events.ts — listen to invoice events
eventBus.on('invoice.sent', async ({ invoice, recipientEmail }) => {
  await sendConfirmationEmail(recipientEmail, invoice)
})
```

## Initialization Pattern

Register all handlers at app startup:

```typescript
// app/startup.ts (called from middleware or route handler once)
import { registerEventHandlers as notificationHandlers } from '@/modules/notifications/events'
import { registerEventHandlers as invoiceHandlers } from '@/modules/invoices/events'

export function initializeEventBus() {
  notificationHandlers()
  invoiceHandlers()
}
```

## Checklist

- [ ] Events emitted only from `core/engine/*.ts`, never from routes
- [ ] Every emit has a corresponding TypeScript event type in `core/schema/events.ts`
- [ ] Handlers wrap logic in try/catch (never crash publisher)
- [ ] Handlers are idempotent
- [ ] New events added to the event type registry
