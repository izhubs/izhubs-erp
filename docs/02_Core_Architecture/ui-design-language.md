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

## Dashboard Layout — The 1vh Rule (Critical)

> **The dashboard is the most-viewed screen. Users must see everything at a glance. No scrolling to find key numbers.**

### The Rule
**The primary dashboard view MUST fit inside `100vh` on first load.**  
Every important KPI, chart, and pipeline status must be visible without scrolling.

```
┌─────────────────────────────────────────────┐  ← 100vh boundary
│  Header (48px)                              │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │  ← KPI row (80px)
│  │Deals │ │Revenu│ │ Won  │ │Tasks │       │
│  └──────┘ └──────┘ └──────┘ └──────┘       │
│  ┌────────────────┐ ┌────────────────┐      │  ← Main content
│  │ Pipeline chart │ │ Recent deals   │      │
│  │                │ │ (max 5 rows)   │      │
│  └────────────────┘ └────────────────┘      │
│  ┌────────────────────────────────────┐     │
│  │ Activity feed (3-5 items max)      │     │
└─────────────────────────────────────────────┘  ← User must NOT scroll here
```

### After the fold
If more data exists (full deal list, full report, full activity history) → separate **dedicated pages** accessible from the dashboard widgets.  
Do NOT stack endless content below the fold on dashboard.

### Widget height rule
Each dashboard section/widget = fixed height. Never `height: auto` that grows indefinitely. 
```scss
.dashboard-widget {
  height: calc(100vh - var(--header-height) - var(--kpi-row-height) - var(--spacing));
  overflow-y: auto; // widget itself scrolls, not the page
}
```

---

## Tables — Anti-Patterns AI Gets Wrong

Tables are the most common source of broken UI in vibe-coded apps. Follow these:

### ✅ Required
```tsx
// Fixed header that sticks during scroll (sticky top)
// Virtual scrolling for > 100 rows (never render 10,000 DOM rows)
// Column min-width to prevent text wrapping in awkward places
// Empty state: show a message, never just a blank table
// Loading state: skeleton rows, not spinner
// Row click → navigate, not open modal (unless quick edit)
```

### ❌ Banned
```tsx
// NO overflow-x: scroll on mobile without warning
// NO text-overflow: ellipsis without a tooltip showing full value
// NO nested tables
// NO table without a fixed container height (infinite growing table)
// NO sorting that re-fetches all data — sort client-side for current page
// NO pagination that jumps to page 1 after every action
```

### Column widths that actually work
```
Checkbox     : 40px  (fixed)
Avatar/Icon  : 40px  (fixed)
Status badge : 100px (fixed)
Short text   : 120px (min)
Name/Title   : flex  (takes remaining space)
Date         : 120px (fixed)
Number/Amount: 100px (fixed, right-aligned)
Actions      : 80px  (fixed, right)
```

---

## Charts — Rules for Correct Implementation

Charts are the #1 place AI produces visually broken, data-incorrect code.

### Use Recharts (already in ecosystem via Next.js)
```tsx
import { AreaChart, BarChart, PieChart } from 'recharts';
// Always: ResponsiveContainer wrapping, no fixed pixel widths
```

### Chart selection guide
| Data type | Chart to use |
|-----------|-------------|
| Trend over time | `AreaChart` (filled) |
| Compare categories | `BarChart` (horizontal for long names) |
| Pipeline stage distribution | `FunnelChart` or horizontal `BarChart` |
| Win/Loss ratio | `PieChart` (max 4 segments — never more) |
| KPI single number | Big number + trend arrow → NOT a chart |

### ❌ Common AI chart mistakes to avoid
```
- Pie chart with 8+ segments → unreadable, use BarChart instead
- Y-axis starting at non-zero → misleading
- No loading state → chart flickers on data fetch
- No empty state → blank chart area looks broken
- Tooltips cut off by container overflow → always use portal
- Hardcoded height in px → use ResponsiveContainer with aspect ratio
```

---

## Rule for AI Agents

Before writing any UI component:
1. Check `app/styles/_components.scss` — the class may already exist.
2. Use token variables, never hardcode values.
3. Match the density and motion spec above.
4. Ask: *"Does this look like it belongs next to Linear or Notion?"*
5. If you're unsure — simpler is always better.

---

##3. **Themed via Variables**: The entire visual weight (paddings, border-radiuses, spacing) is controlled by `app/styles/_tokens.scss`. Adding a new "Theme" (like Compact or Spaced) completely reorganizes the workspace without touching a single React component (similar to WordPress Themes).
   👉 *See [Theme & Template Architecture](./Theme_and_Template_Architecture.md) for a deep dive on how structural CSS Themes separate from business-logic Industry Templates.*

---

## ⚠️ Known Visual Issues (To Fix — assigned to agent)

Diagnosed 2026-03-16. These cause the "hơi kỳ" feeling.

### 🔴 Bug 1 — Sidebar collapse leaves empty gap [CRITICAL]
**File:** `app/styles/_layout.scss`  
**Problem:** `.app-layout` grid column is hardcoded `var(--sidebar-width)` (240px). When sidebar collapses (`.collapsed { width: 64px }`), the grid column stays 240px → 176px dead space on the left.  
**Fix:** Use a CSS variable on `.app-layout` that updates when the sidebar class changes:
```scss
.app-layout { grid-template-columns: var(--sidebar-current-width, var(--sidebar-width)) 1fr; }
.app-layout.sidebar-collapsed { --sidebar-current-width: 64px; }
```
Or pass the class to the parent in `app/(dashboard)/layout.tsx` and drive via CSS.

### 🟠 Bug 2 — Background palette mismatch [HIGH]
**File:** `app/styles/_tokens.scss`  
**Problem:** Backgrounds use **slate** palette (`#0f172a`, `#1e293b`) but primary uses **indigo**. The blue-grey + purple clash creates visual incoherence.  
**Fix:** Replace slate backgrounds with dark-purple as per design document spec:
```scss
--color-bg:         #0f0f13;  /* ← was #0f172a (slate-900) */
--color-bg-surface: #17171f;  /* ← was #1e293b (slate-800) */
--color-bg-card:    #17171f;
--color-bg-input:   #0f0f13;
--color-bg-hover:   #1e1e28;  /* ← was #334155 (slate-700) */
--color-border:     #2a2a38;  /* ← was #334155 (too bright) */
```

### 🟡 Bug 3 — Base font size too large [MEDIUM]
**File:** `app/styles/_tokens.scss`  
**Problem:** `--font-size-base: 16px` but design spec requires **14px** (dense, Linear-like).  
**Fix:**
```scss
--font-size-base: 14px;  /* ← was 16px */
```
Also update typography references that rely on base sizing.

