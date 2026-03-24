# Template Preference System — Spec

**Status:** Draft — Pending Implementation  
**Priority:** P1  
**Area:** Settings → Workspace → Template

---

## 1. Mục tiêu

Cho phép mỗi user chọn **industry template** riêng của mình (dashboard layout, pipeline stages, sidebar labels) mà không ảnh hưởng đến user khác. Color theme vẫn chung toàn tenant. RBAC data access không thay đổi.

---

## 2. Khái niệm cốt lõi

### Phân tầng rõ ràng

| Layer | Scope | Ai đặt | Lưu ở đâu |
|---|---|---|---|
| **Color theme** | Tenant-wide | Admin | `tenants.custom_theme_config` (JSONB) |
| **Default template** | Tenant-wide | Admin | `tenants.default_template_id` |
| **User template preference** | Per-user | Mỗi user | `users.preferences` (JSONB) |
| **Module override** | Per-user, per-module | Mỗi user | `users.preferences.moduleOverrides` |
| **Data access (RBAC)** | Always server-enforced | System | `middleware.ts` + `users.role` |

### Ví dụ thực tế

```
Alice (CEO, Agency):
  defaultTemplate: "agency"
  moduleOverrides:
    dashboard: "virtual-office"   → xem KPI dạng VO nhưng data vẫn là của Agency tenant

Bob (Sales, Agency):
  defaultTemplate: "agency"       → xài hết mặc định Agency
  moduleOverrides: {}

Carol (Ops):
  defaultTemplate: "coworking"
  moduleOverrides:
    pipeline: "agency"            → Kanban column theo Agency stages
```

> **Quan trọng:** Template chỉ thay đổi UI/UX (labels, widgets, stage colors). Data backend vẫn cùng 1 tenant.

---

## 3. Template Structure (existing — không thay đổi)

Tham chiếu: `templates/engine/template.schema.ts`

```ts
IndustryTemplate {
  id: string                  // "virtual-office", "agency", "restaurant"...
  pipelineStages: [{          // Kanban columns + colors
    key, label, color
  }]
  navConfig: {
    sidebar: NavItem[]        // menu items với roles[] (UI-only filter)
    dashboardLayout: {
      rows: [{                // widget grid — colSpan + widgetId
        colSpan, widgetId, minRole?
      }]
    }
  }
  themeDefaults: {            // CSS vars — dùng cho tenant color, KHÔNG per-user
    '--color-primary': '#...'
  }
  customFields: []            // applied khi onboarding, không thay đổi runtime
  automations: []             // applied khi onboarding
}
```

---

## 4. User Preferences Schema

### 4.1 DB migration — `009_user_preferences.sql`

```sql
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS preferences JSONB NOT NULL DEFAULT '{}';

COMMENT ON COLUMN users.preferences IS
  'Per-user UI preferences. Does NOT affect data access or RBAC.';
```

### 4.2 TypeScript type

```ts
// core/schema/user-preferences.ts
export const UserPreferencesSchema = z.object({
  defaultTemplate: z.string().optional(),          // template id
  moduleOverrides: z.object({
    dashboard: z.string().optional(),
    pipeline:  z.string().optional(),
    leads:     z.string().optional(),
    contacts:  z.string().optional(),
  }).default({}),
  // future: compact sidebar, dark/light mode override, locale
}).default({});

export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
```

---

## 5. API

### `GET /api/v1/users/me`
Trả về user + preferences. Field `preferences` đã được parse qua Zod.

### `PATCH /api/v1/users/me/preferences`

```ts
// Body
{
  defaultTemplate?: string,
  moduleOverrides?: {
    dashboard?: string,
    pipeline?: string,
    leads?: string,
    contacts?: string,
  }
}

// Response
{ success: true, data: UserPreferences }
```

Validation: template id phải tồn tại trong `TEMPLATE_MAP` từ `templates/index.ts`.

---

## 6. Template Resolution — `lib/resolve-template.ts`

```ts
/**
 * Resolve template cho 1 module, ưu tiên:
 * 1. user.preferences.moduleOverrides[module]
 * 2. user.preferences.defaultTemplate
 * 3. tenant.default_template_id
 * 4. 'virtual-office' (hardcoded fallback)
 */
export function resolveTemplate(
  module: 'dashboard' | 'pipeline' | 'leads' | 'contacts',
  userPrefs: UserPreferences,
  tenantDefaultId?: string,
): IndustryTemplate {
  const id =
    userPrefs.moduleOverrides?.[module] ??
    userPrefs.defaultTemplate ??
    tenantDefaultId ??
    'virtual-office';
  return TEMPLATE_MAP[id] ?? TEMPLATE_MAP['virtual-office'];
}
```

---

## 7. Client Provider — `components/providers/TemplateProvider.tsx`

```tsx
// Server Component (App Router) — đọc preferences từ session cookie
// hoặc fetch từ /api/v1/users/me

export function TemplateProvider({ children, userPrefs, tenantDefault }) {
  // Context value: resolved templates per module
}

export function useTemplate(module?: ModuleKey): IndustryTemplate
// → dùng trong Dashboard, Pipeline, Sidebar
```

---

## 8. Widget Map — `components/dashboard/WIDGET_MAP.tsx`

Map `widgetId → React component`, dùng để render `dashboardLayout.rows`:

| widgetId | Component | Mô tả |
|---|---|---|
| `kpi-mrr` | `<KpiMrr />` | Monthly Recurring Revenue |
| `kpi-active-clients` | `<KpiActiveClients />` | Active deals count |
| `kpi-renewals-due` | `<KpiRenewalsDue />` | Renewal stage count |
| `kpi-churn-rate` | `<KpiChurnRate />` | Lost / total ratio |
| `arr-line-chart` | `<ArrLineChart />` | Revenue trend 6 months |
| `revenue-by-package-donut` | `<RevenueDonut />` | Donut by custom_field |
| `top-customers-table` | `<TopCustomers />` | Top 5 by deal value |
| `recent-activity-feed` | `<RecentActivity />` | Latest contacts |
| `pipeline-summary` | `<PipelineSummary />` | Stage bar chart |
| `tasks-due-today` | `<TasksDueToday />` | (future) |
| `reservations-today` | `<ReservationsToday />` | Restaurant only |
| `revenue-today` | `<RevenueToday />` | Restaurant only |

Dashboard page sẽ:
1. Đọc `template.navConfig.dashboardLayout.rows`
2. Với mỗi row: `WIDGET_MAP[row.widgetId]`, filter bởi `row.minRole`
3. Grid layout theo `colSpan` (12-column grid)

---

## 9. Settings UI — `/settings/template`

**Trang "Workspace & Template":**

```
┌─────────────────────────────────────────────────────────┐
│  🧩 Workspace Template                                   │
│  Chọn giao diện và workflow phù hợp với loại hình       │
│  kinh doanh của bạn. Color theme do Admin quyết định.   │
│                                                         │
│  Template mặc định                                      │
│  ┌────────────────────────────────────────────────────┐ │
│  │ ○ 🏢 Virtual Office   ● 🎯 Agency    ○ 🤝 Coworking│ │
│  │ ○ 🍽️ Restaurant       ○ ☕ Café      ○ 💼 Freelancer│ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  Ghi đè theo module (tùy chọn)                         │
│  Dashboard:   [ Agency           ▾ ]                    │
│  Pipeline:    [ Coworking         ▾ ]                   │
│  Leads:       [ Dùng template mặc định ▾ ]             │
│                                                         │
│  [ Lưu thay đổi ]   [ Đặt lại mặc định ]              │
└─────────────────────────────────────────────────────────┘
```

---

## 10. Ảnh hưởng đến các component

| Component | Thay đổi |
|---|---|
| `Sidebar.tsx` | Đọc `template.navConfig.sidebar`, filter bởi `user.role` |
| `dashboard/page.tsx` | Đọc `dashboardLayout.rows` → render WIDGET_MAP |
| `PipelineViews.tsx` | Đọc `template.pipelineStages` thay vì hardcode stages |
| `KanbanBoard.tsx` | `columns` = `pipelineStages` từ template |
| `DashboardCharts.tsx` | Có thể giữ nguyên — được gọi bởi widget components |

---

## 11. Không thay đổi

- **RBAC**: `middleware.ts`, `withPermission()`, `user.role` — không đổi
- **Data engine**: `listDeals()`, `listContacts()` — không đổi (vẫn query theo tenant)
- **Color theme**: vẫn tenant-wide, admin set trong Settings → Appearance
- **`customFields`** + **`automations`** trong template: chỉ apply khi onboarding, không runtime

---

## 12. Implementation Order

```
Phase 1 — Foundation
  [1] 009_user_preferences.sql
  [2] core/schema/user-preferences.ts (Zod schema)
  [3] PATCH /api/v1/users/me/preferences (API)
  [4] lib/resolve-template.ts

Phase 2 — UI Wire
  [5] TemplateProvider + useTemplate() hook
  [6] Settings → /settings/template page
  [7] Sidebar.tsx đọc navConfig.sidebar từ template
  [8] Dashboard page đọc dashboardLayout + WIDGET_MAP

Phase 3 — Pipeline
  [9] PipelineViews.tsx + KanbanBoard.tsx dùng pipelineStages từ template
  [10] Deal stage dropdown dùng stages từ template của user
```

---

## 13. Open Questions

- **Q:** Khi user dùng template "Coworking" pipeline nhưng deal có stage "inquiry" (chỉ có ở Restaurant) → hiển thị gì?  
  **A đề xuất:** Luôn hiển thị đúng stage key từ DB. Nếu stage không có trong template hiện tại → show stage key raw + màu neutral `#94a3b8`.

- **Q:** Admin có thể lock template cho toàn tenant không?  
  **A đề xuất:** Phase 2 — `tenants.lock_template: boolean`. Nếu locked → user không được override.
