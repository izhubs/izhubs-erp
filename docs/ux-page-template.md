# UX Spec: [Page Name]

> Copy file này để tạo UX spec cho page mới. Xóa phần hướng dẫn (italic) trước khi commit.

---

## Layout (ASCII)

```
┌─ Sidebar ──┬─ Header ──────────────────────────────────────────┐
│            │  [Page Title]                          [+ Primary] │
│            │  ──────────────────────────────────────────────── │
│            │  [🔍 Search...]  [Filter ▾] [Owner ▾]             │
│            │  Tab: All | [Status A] | [Status B]               │
│            │  ──────────────────────────────────────────────── │
│            │  [Main content here]                               │
└────────────┴────────────────────────────────────────────────────┘
```

_Draw the layout accurately. Show exact position of search, filters, tabs, content, pagination._

---

## Rules

### Primary Action
- _What does `[+ New]` button do? Modal, navigate, or inline?_

### Search
- _Per-page or global? What field does it search?_

### Filters
- _List each filter, what values it accepts, where it appears_
- _How do active filters display? (chip, highlighted tab, etc.)_

### Status Tabs
```
All (N)  |  [Status A] (N)  |  [Status B] (N)
```
_Which tabs exist? What do the counts represent?_

### Main Content

#### Table / List columns (if table view)
| Column | Width | Notes |
|--------|-------|-------|
| Name | flex | Click → drawer |
| Status | 100px fixed | Semantic badge |
| ... | ... | ... |

#### Card structure (if card/kanban view)
_What shows on each card? What triggers card click?_

### Detail view — Drawer or Page?
- **Drawer:** User needs to quickly scan many records (contacts, deals)
- **Full page:** Complex form, multi-step, or infrequent action (settings, onboarding)

_Document what's in the drawer/page: sections, fields, tabs_

### Bulk Actions (if applicable)
```
☑ N selected  [Action 1]  [Action 2]  [Delete]
```
_Only show when rows selected. Replaces filter bar._

### Pagination
- Default page size: 25
- Show: `[← Prev]  1–25 of N  [Next →]`

---

## Anti-patterns ❌
_List 3-5 specific things NOT to do on this page_

- Don't use infinite scroll (user loses position)
- Don't ...
