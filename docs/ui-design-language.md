# UI Design Language — izhubs ERP

> izhubs borrows the best from successful products. Not a copy — a carefully composed language.

---

## Inspiration Sources

| Product | What we borrow |
|---------|---------------|
| **Linear** | Dark mode density, snappy transitions, keyboard-first feeling |
| **Notion** | Clean data layout, sidebar hierarchy, readable typography |
| **Vercel Dashboard** | Monochrome elegance, clear status indicators, minimal chrome |
| **Superhuman** | Speed perception, focus on content over decoration |
| **HubSpot** | Data table clarity, pipeline Kanban conventions |

---

## Core Feeling

> **"A tool used by people who are serious about their business."**

Not corporate. Not startup-cute. Fast. Dense. Reliable. Satisfying to use.

---

## Color System

**Use CSS custom properties from `_tokens.scss`. Never hardcode.**

| Token | Default (Indigo Dark) | Purpose |
|-------|-----------------------|---------|
| `--color-bg` | `#0f0f13` | Page background |
| `--color-surface` | `#17171f` | Card, panel backgrounds |
| `--color-surface-raised` | `#1e1e28` | Hover states, elevated surfaces |
| `--color-primary` | `#6366f1` | CTAs, active states, links |
| `--color-border` | `#2a2a38` | Subtle dividers |
| `--color-text` | `#e2e2f0` | Primary text |
| `--color-text-muted` | `#9091a4` | Labels, metadata, placeholders |
| `--color-success` | `#22c55e` | Win, active, confirmed |
| `--color-warning` | `#f59e0b` | Attention, pending |
| `--color-error` | `#ef4444` | Error, lost, critical |

**Rule: 5 themes exist. All of them respect this token contract. Never add color outside the token system.**

---

## Typography (Borrow from Notion + Linear)

```scss
// From _typography.scss — enforce these, never deviate:
--font-family: 'Inter', system-ui, sans-serif;

// Size scale
--text-xs:   11px;  // metadata, timestamps, badges
--text-sm:   13px;  // table rows, labels, secondary info
--text-base: 14px;  // body text (Dense like Linear, not 16px)
--text-md:   16px;  // card titles, section headers
--text-lg:   20px;  // page titles
--text-xl:   24px;  // dashboard hero numbers

// Weight
--font-normal:   400;
--font-medium:   500;  // labels, nav items
--font-semibold: 600;  // headings, primary info
--font-bold:     700;  // numbers, KPIs
```

**14px base** (not 16px) — matches Linear's dense, information-rich feel.

---

## Spacing

**8px base grid. All spacing is multiples of 4.**

```
4px   — icon gap, tight inline spacing
8px   — component padding (small)
12px  — list item padding
16px  — card padding (default)
24px  — section gap
32px  — page section gap
48px  — major layout divisions
```

**No random margins.** All spacing via `var(--space-*)` tokens.

---

## Motion (Borrow from Linear + Superhuman)

**Motion must have purpose. Never decorative.**

| Interaction | Animation | Duration | Easing |
|-------------|-----------|----------|--------|
| Button hover | Background shift | 120ms | ease |
| Card hover | `translateY(-2px)` + shadow | 150ms | ease-out |
| Modal open | `translateY(8px)` → `0` + fade | 200ms | ease-out |
| Sidebar collapse | Width transition | 200ms | ease-in-out |
| Page transition | Slide-x or fade | 150ms | ease |
| Skeleton load | Shimmer | 1.5s loop | ease-in-out |
| Toast appear | Slide-up + fade | 250ms | ease-out |

**Rule: 0 animations over 300ms in normal interactions.** Slow = sluggish.

---

## Component Personality

### Buttons (borrow from Linear)
```
Primary:    Filled indigo, rounded-md, 36px height, semibold
Secondary:  Outlined border, transparent bg
Ghost:      Text only, hover reveals subtle bg
Danger:     Filled red, only for destructive actions (never just red as style)
```

### Cards (borrow from Vercel)
```
Background: var(--color-surface)
Border:     1px solid var(--color-border)
Radius:     8px
Shadow:     0 1px 3px rgba(0,0,0,0.3)
Hover:      Border brightens + subtle lift
```

### Tables (borrow from HubSpot)
```
Row height: 44px
Hover:      Row bg shifts to --color-surface-raised
Zebra:      NO. Single color rows only. Hover is the indicator.
Sort arrow: Always visible (muted), fills on active column
Pagination: Simple prev/next + page number display
```

### Sidebar (borrow from Notion)
```
Width:       240px expanded, 56px collapsed
Item height: 36px
Active:      var(--color-primary) with 10% opacity bg + left 2px border
Hover:       var(--color-surface-raised) bg
Icons:       16px, always present (label optional on collapse)
```

---

## Do / Don't

| ✅ Do | ❌ Don't |
|-------|----------|
| Dense data — show more, scroll less | Excessive whitespace "breathing room" on data pages |
| Skeleton loaders while fetching | Spinner blocking the whole page |
| Subtle hover states on all interactive elements | No hover feedback |
| Keyboard shortcuts for power users | Click-only interactions |
| Status badges with semantic color | Color decoration without meaning |
| Toast notifications (non-blocking) | Alert dialogs for non-critical events |
| Inline editing where natural | Modal for every small edit |

---

## Rule for AI Agents

Before writing any UI component:
1. Check `app/styles/_components.scss` — the class may already exist.
2. Use token variables, never hardcode values.
3. Match the density and motion spec above.
4. Ask: *"Does this look like it belongs next to Linear or Notion?"*
5. If you're unsure — simpler is always better.
