---
name: clean-code-and-modularity
description: Rules for writing reusable, modular, and clean code in izhubs ERP
---

# Clean Code & Modularity Rules — izhubs ERP

AI agents must follow these principles at all times. This is non-negotiable.

---

## Core Law: "Write it once. Use it everywhere."

If you write the same logic twice, you are doing it wrong.

---

## 1. Reusable Logic (NOT inline)

### ❌ Bad — duplicating logic per file
```typescript
// contacts/page.tsx
const name = contact.firstName + ' ' + contact.lastName;

// deals/page.tsx
const name = deal.contact.firstName + ' ' + deal.contact.lastName;
```

### ✅ Good — extract to a shared utility
```typescript
// lib/utils/format.ts
export function fullName(entity: { firstName: string; lastName: string }) {
  return `${entity.firstName} ${entity.lastName}`;
}

// contacts/page.tsx
fullName(contact)

// deals/page.tsx
fullName(deal.contact)
```

**Rule:** Any logic that appears in 2+ places MUST be extracted into:
- `lib/utils/` — pure functions (formatting, transformations)
- `lib/hooks/` — React hooks (data fetching, state)
- `core/engine/` — business logic

---

## 2. No Inline CSS

### ❌ Banned
```tsx
<div style={{ color: 'red', padding: '8px', fontSize: '14px' }}>Error</div>
```

### ✅ Required
```tsx
// Use SCSS classes from app/styles/_components.scss
<div className="badge badge--error">Error</div>

// Or CSS Modules if component-specific
<div className={styles.errorMessage}>Error</div>
```

**Rules:**
- Inline `style={{}}` is banned except for truly dynamic values (e.g. calculated widths from user input).
- All static styles → SCSS classes in `app/styles/_components.scss` or a CSS Module.
- Color, spacing, typography → Use CSS custom properties from `app/styles/_tokens.scss`.
- Never hardcode hex colors (`#ff0000`). Use `var(--color-error)` from the token system.

---

## 3. Modular File Structure

Every feature must follow this pattern (no monolith files):

```
features/contacts/
  components/
    ContactCard.tsx        ← Single responsibility: render one contact
    ContactTable.tsx       ← Renders the list, uses ContactCard
    ContactFilters.tsx     ← Filter bar only
  hooks/
    useContacts.ts         ← Data fetching logic, not in the component
    useContactFilters.ts   ← Filter state management
  utils/
    contact.format.ts      ← fullName(), formatPhone(), etc.
  types.ts                 ← Local type overrides (imports from core/schema first)
  index.ts                 ← Single export point for the feature
```

**Rules:**
- One component per file. No component files > 200 lines.
- Data fetching goes in hooks, not in the component body.
- Don't mix layout and business logic in the same component.

---

## 4. API Calls: Always Abstracted

### ❌ Bad — fetch inside component
```tsx
const res = await fetch('/api/v1/contacts?page=1');
const data = await res.json();
```

### ✅ Good — extracted to a service layer
```typescript
// lib/api/contacts.ts
export async function getContacts(page: number) {
  const res = await apiClient.get(`/api/v1/contacts?page=${page}`);
  return ContactListSchema.parse(res.data); // Always Zod-validate
}

// components:
const contacts = await getContacts(1);
```

---

## 5. Component Size Limits

| File type | Max lines |
|-----------|-----------|
| Component | 150 lines |
| Hook | 100 lines |
| Utility function | 50 lines |
| API route handler | 80 lines |

If you exceed these limits → Split into smaller units.

---

## Quick Checklist Before Commit
- [ ] No `style={{}}` inline styles
- [ ] No duplicated business logic
- [ ] No `fetch()` directly inside a component
- [ ] No colors or spacing hardcoded (use `var(--token)`)
- [ ] No component > 150 lines
- [ ] Shared utilities extracted to `lib/`
