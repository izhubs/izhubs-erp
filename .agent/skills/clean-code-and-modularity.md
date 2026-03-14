---
name: clean-code-and-modularity
description: Clean Code (Uncle Bob) + Design Patterns (GoF) applied to izhubs ERP
---

# Clean Code & Design Patterns — izhubs ERP

> "Clean code reads like well-written prose." — Robert C. Martin (Uncle Bob), *Clean Code*

AI agents MUST follow these principles. No exceptions.

---

## Part 1 — Clean Code Principles (Uncle Bob)

### Rule 1: Meaningful Names
Names must reveal intent. No abbreviations. No vague names.

```typescript
// ❌ Bad
const d = new Date();
const u = users.filter(x => x.a);

// ✅ Good
const createdAt = new Date();
const activeUsers = users.filter(user => user.isActive);
```

### Rule 2: Functions Do ONE Thing
A function that does more than one thing needs to be split.

```typescript
// ❌ Bad — does multiple things
async function saveContactAndSendEmail(data) {
  await db.save(data);
  await sendEmail(data.email);
  await createActivity(data.id);
}

// ✅ Good — each function has a single responsibility
await saveContact(data);
await notifyContactCreated(contact); // internally handles email + activity
```

### Rule 3: No Magic Numbers or Strings
```typescript
// ❌ Bad
if (deal.probability > 70) { ... }
if (status === 'active') { ... }

// ✅ Good
const HIGH_PROBABILITY_THRESHOLD = 70;
if (deal.probability > HIGH_PROBABILITY_THRESHOLD) { ... }
if (status === DealStatus.Active) { ... }
```

### Rule 4: DRY — Don't Repeat Yourself
Any logic appearing in 2+ places → extract to `lib/utils/`, `lib/hooks/`, or `core/engine/`.

```typescript
// ❌ Bad
// contacts/page.tsx
const name = `${contact.firstName} ${contact.lastName}`;
// deals/page.tsx
const name = `${deal.contact.firstName} ${deal.contact.lastName}`;

// ✅ Good — extracted to lib/utils/format.ts
export const fullName = (p: { firstName: string; lastName: string }) =>
  `${p.firstName} ${p.lastName}`;
```

### Rule 5: Small Files
| File type | Max lines |
|-----------|-----------|
| React component | 150 lines |
| Hook | 100 lines |
| Utility function | 50 lines |
| API route handler | 80 lines |

If you exceed the limit → split immediately.

### Rule 6: No Inline CSS
```tsx
// ❌ Banned forever
<div style={{ color: 'red', padding: '8px' }}>Error</div>

// ✅ Required — use SCSS tokens and component classes
<div className="badge badge--error">Error</div>
// or CSS Modules for component-specific styles
<div className={styles.errorMessage}>Error</div>
```

Never hardcode colors/spacing. Use: `var(--color-error)`, `var(--space-2)`, etc. from `_tokens.scss`.

---

## Part 2 — Design Patterns (GoF) Applied to izhubs ERP

The izhubs ERP architecture already uses several GoF patterns. AI agents must recognize and follow them.

### Observer Pattern → EventBus
Don't call modules directly. Emit an event. Let subscribers react.

```typescript
// ✅ Correct — Observer via EventBus
eventBus.emit('deal.stage_changed', { dealId, fromStage, toStage });

// Subscribers (webhooks, email, activity log) all react independently
// ❌ Wrong — direct coupling
await sendWebhooks(deal);
await logActivity(deal);
await sendEmail(deal);
```

### Repository Pattern → Core Engine Layer
Data access is abstracted behind the engine. Components never query the DB directly.

```typescript
// ✅ Repository via core engine
const contact = await contactEngine.findById(id); // returns validated Zod result

// ❌ Direct DB query from component
const contact = await db.query('SELECT * FROM contacts WHERE id = $1', [id]);
```

### Strategy Pattern → Template System
Industry templates are interchangeable strategies that configure the same system differently.

```typescript
// ✅ Strategy pattern in templates
const template = getTemplate('restaurant'); // or 'agency', 'ecommerce'...
await applyTemplate(template, companyId);  // same interface, different behavior
```

### Factory Pattern → API Response
All API responses are built through a standardized factory function.

```typescript
// ✅ Factory
return ApiResponse.success(data, 201);
return ApiResponse.error('NOT_FOUND', 404);

// ❌ Manual ad-hoc responses
return Response.json({ data, status: 'ok' }, { status: 201 });
```

### Decorator Pattern → Middleware Composition
API route handlers are plain functions. Middleware (auth, rate limit, RBAC) are decorators applied on top.

```typescript
// ✅ Decorator via middleware composition
export const GET = compose(
  withAuth,
  withRateLimit,
  withRBAC('contacts:read'),
  handler
);
```

---

## Quick Checklist Before Every Commit

- [ ] No `style={{}}` inline styles anywhere
- [ ] No duplicated business logic (DRY)
- [ ] No `fetch()` directly in a React component
- [ ] No magic numbers/strings — use constants or enums
- [ ] No component > 150 lines
- [ ] Functions do exactly one thing
- [ ] Names are clear and descriptive — no abbreviations
- [ ] EventBus used for cross-module communication (Observer)
- [ ] All API responses via `ApiResponse` factory
