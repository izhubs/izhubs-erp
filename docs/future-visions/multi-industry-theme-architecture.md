# Multi-Industry Theme Architecture — SPEC

> **Mục tiêu:** Hệ thống biến đổi toàn diện (UI, Menu, Dashboard, Module) dựa trên `industry` của Tenant và `role` của User — **không sửa core component.**
>
> **Trạng thái hiện tại:**
> - ✅ Layer 2 (Layout Engine) — đã triển khai
> - 🔲 Layer 1 (Styling) — chờ
> - 🔲 Layer 3 (Module Bundle) — chờ

---

## Kiến trúc Tổng thể

```
DB: industry_templates
      │
      ▼
lib/nav-config.ts  ←── unstable_cache (tag: nav-config-{tenantId})
      │                 [busted khi save settings]
      ▼
app/(dashboard)/layout.tsx  ←── Server Component
      │
      ├── Sidebar.tsx       ←── Dumb, nhận NavItem[] props
      └── DashboardGrid.tsx ←── Dumb, nhận DashboardWidgetRow[] props
```

**Nguyên tắc bất biến:**
1. Component UI không được chứa `if (industry === ...)` — chỉ render JSON
2. `industry_templates` table là runtime source of truth — file `.ts` chỉ là seed data
3. `tenant_modules` table là module authority sau onboarding — template không can thiệp
4. revalidateTag on-demand thay vì TTL

---

## Layer 1: Styling & Design System

### Vấn đề
Hiện tại `app/styles/_themes.scss` dùng `[data-theme="emerald"]` theo user preference (màu cá nhân). Cần thêm một lớp **industry theme** riêng biệt — không xung đột với user preference.

### Giải pháp: 2-tier theming

```
Tier 1: Industry defaults  →  [data-industry="spa"]    → --color-primary: #f472b6
Tier 2: Custom branding    →  tenants.custom_theme_config → style="--color-primary: #e91e8c"
Tier 3: User preference    →  [data-theme="emerald"]   → --color-primary: #10b981
```

**Cascade priority:** User preference > Custom branding > Industry defaults > System default

### Triển khai

#### Bước 1.1 — Thêm industry CSS classes vào `_themes.scss`

```scss
/* Industry themes — applied via data-industry on <html> */
/* Overridden by custom_theme_config injected as inline style */

[data-industry="spa"] {
  --color-primary:       #f472b6;
  --color-primary-hover: #ec4899;
  --color-primary-light: #fce7f3;
  --color-primary-muted: #831843;
}

[data-industry="restaurant"] {
  --color-primary:       #f59e0b;
  --color-primary-hover: #d97706;
  --color-primary-light: #fef3c7;
  --color-primary-muted: #78350f;
}

[data-industry="coworking"] {
  --color-primary:       #1d4ed8;
  --color-primary-hover: #1e40af;
  --color-primary-light: #dbeafe;
  --color-primary-muted: #1e3a8a;
}

[data-industry="ecommerce"] {
  --color-primary:       #f97316;
  --color-primary-hover: #ea580c;
  --color-primary-light: #ffedd5;
  --color-primary-muted: #7c2d12;
}

/* agency = indigo (same as default :root — no override needed) */
```

#### Bước 1.2 — Inject ở `app/(dashboard)/layout.tsx`

Server Component đã có token → query thêm `industry` và `custom_theme_config`:

```typescript
// Trong DashboardLayout (đã là Server Component)
const tenant = await db.query(
  `SELECT industry, custom_theme_config FROM tenants WHERE id = $1`,
  [tenantId]
);

const industry = tenant.rows[0]?.industry ?? 'default';
const customVars = tenant.rows[0]?.custom_theme_config ?? {};

// Chuyển customVars thành inline style string
const inlineStyle = Object.entries(customVars)
  .map(([k, v]) => `${k}:${v}`)
  .join(';');
```

```tsx
<html
  lang="vi"
  data-theme="indigo"
  data-industry={industry}
  style={inlineStyle ? inlineStyle : undefined}
  suppressHydrationWarning
>
```

> ⚠️ **Lưu ý bảo mật:** `custom_theme_config` chỉ nên chứa CSS variables (pattern `--color-*`).
> Validate trên API trước khi lưu: whitelist keys bắt đầu bằng `--color-` hoặc `--font-`.

#### Bước 1.3 — Tailwind mapping (nếu dùng Tailwind classes)

Trong `tailwind.config.ts`:
```ts
colors: {
  theme: {
    primary:       'var(--color-primary)',
    'primary-hover': 'var(--color-primary-hover)',
    'primary-light': 'var(--color-primary-light)',
    'primary-muted': 'var(--color-primary-muted)',
  }
}
```

Dùng: `className="bg-theme-primary text-white"` thay vì `className="bg-indigo-500"`.

#### API: Lưu custom branding

`PATCH /api/v1/tenant/settings`
```json
{
  "custom_theme_config": {
    "--color-primary": "#e91e8c",
    "--color-primary-hover": "#c2185b"
  }
}
```
→ Gọi `revalidateTag('nav-config-{tenantId}')` sau khi lưu để bust cache.

---

## Layer 2: Layout & Navigation Engine ✅ Done

### Đã triển khai

| File | Mô tả |
|------|-------|
| `database/migrations/003_industry_theme.sql` | Thêm `industry`, `custom_theme_config` vào `tenants`; tạo `industry_templates` |
| `templates/engine/template.schema.ts` | `NavItemSchema`, `NavConfigSchema`, `DashboardWidgetRowSchema` |
| `templates/industry/{spa,restaurant,agency,coworking,ecommerce}.ts` | 5 templates với `navConfig` + `themeDefaults` |
| `scripts/seed-industry-templates.ts` | Upsert templates vào DB một lần |
| `lib/nav-config.ts` | Server fetch + `unstable_cache` + role filter |
| `app/api/v1/tenant/nav-config/route.ts` | GET endpoint cho client |
| `components/ui/Sidebar.tsx` | Dumb component — nhận `NavItem[]` prop |
| `components/ui/DashboardGrid.tsx` | Dumb 12-col grid — nhận `DashboardWidgetRow[]` prop |
| `app/(dashboard)/layout.tsx` | Server Component — fetch + pass props |

### Vấn đề còn mở — cần xử lý dần

#### 2A. Icon Registry có thể thiếu

**Vấn đề:** Khi thêm template mới với icon `UtensilsCrossed`, nhưng quên thêm vào `ICON_MAP` trong `Sidebar.tsx`, icon sẽ render trống mà không có error.

**Giải pháp:**
```typescript
// Trong seed-industry-templates.ts — thêm validation bước này:
import { ICON_MAP } from '@/components/ui/Sidebar';  // export ICON_MAP
const unknownIcons = sidebar
  .flatMap(i => [i.icon, ...(i.children?.map(c => c.icon) ?? [])])
  .filter(icon => !ICON_MAP[icon]);

if (unknownIcons.length > 0) {
  console.warn(`⚠️  Unknown icons: ${[...new Set(unknownIcons)].join(', ')}`);
}
```

#### 2B. Widget Registry chưa có widget thật

**Vấn đề:** `WIDGET_MAP` trong `DashboardGrid.tsx` hiện trả `PlaceholderWidget` cho tất cả. Dashboard trông như mockup.

**Kế hoạch widget rollout:**

| widgetId | Module | Priority |
|----------|--------|----------|
| `pipeline-summary` | crm | P0 — dùng được cho mọi industry |
| `revenue-today` | reports | P0 |
| `tasks-due-today` | crm | P0 |
| `recent-activity` | crm | P0 |
| `appointments-today` | spa/restaurant | P1 |
| `reservations-today` | restaurant | P1 |
| `orders-today` | ecommerce | P1 |
| `occupancy-rate` | coworking | P2 |

**Cách đăng ký:**
```typescript
// components/ui/DashboardGrid.tsx
import PipelineSummaryWidget from '@/modules/crm/widgets/PipelineSummaryWidget';
import RevenueTodayWidget    from '@/modules/reports/widgets/RevenueTodayWidget';

const WIDGET_MAP: Record<string, React.ComponentType<{ widgetId: string }>> = {
  'pipeline-summary': PipelineSummaryWidget,
  'revenue-today':    RevenueTodayWidget,
};
```

#### 2C. Tenant chưa có industry = fallback nav

Tenant đăng ký mới chưa chọn industry → `getNavConfig()` trả `null` → `DashboardLayout` dùng `DEFAULT_NAV`. Cần dẫn user đến onboarding wizard.

**Giải pháp:**
```typescript
// Trong DashboardLayout, nếu navConfig === null:
if (!navConfig && pathname !== '/setup') {
  redirect('/setup?step=industry');
}
```

---

## Layer 3: Module Bundle (Chưa triển khai)

### Vấn đề

**Conflict of authority:** Nếu Template nói `disabledModules: ['projects']` nhưng Admin mua thêm và bật `projects` trong DB → ai thắng?

**Câu trả lời đã chốt:** DB (`tenant_modules`) luôn thắng sau onboarding.

### Giải pháp: Template = Onboarding Defaults Only

```
Khi tạo Tenant mới:
  Template.requiredModules → INSERT INTO tenant_modules (is_active = true)
  Template.suggestedModules → INSERT INTO tenant_modules (is_active = false, visible = true)
  
Khi thay đổi industry sau đó:
  KHÔNG tự động thêm/xoá modules
  Chỉ show suggestion popup: "Industry mới này thường dùng [X, Y, Z]. Bật không?"
```

### Triển khai

#### Bước 3.1 — API `apply-theme`

`POST /api/v1/tenant/apply-theme`
```json
{ "industryId": "spa" }
```

Hành động phía server:
1. Update `tenants.industry = 'spa'`
2. Đọc `industry_templates.required_modules` cho `spa`
3. Upsert vào `tenant_modules` (chỉ INSERT, không DELETE module hiện có)
4. Invalidate cache: `revalidateTag('nav-config-{tenantId}')`
5. Return `{ applied: true, modulesActivated: [...], suggestions: [...] }`

#### Bước 3.2 — Hook `useModules()`

```typescript
// lib/hooks/useModules.ts
export function useModules() {
  // Fetch từ /api/v1/tenant/modules (cached per session)
  // Return: { isEnabled: (moduleId: string) => boolean }
}
```

**Dùng trong UI:**
```tsx
const { isEnabled } = useModules();
// Show/hide feature — NOT security, just UX
{isEnabled('contracts') && <Link href="/contracts">Hợp đồng</Link>}
```

> ⚠️ **Nhắc lại:** `isEnabled()` chỉ là UX hint. Backend API `/api/v1/contracts` phải tự check `tenant_modules.is_active`
> qua middleware `withModule('contracts')`.

#### Bước 3.3 — Middleware `withModule`

```typescript
// core/engine/rbac.ts — đã có withRole, thêm withModule
export function withModule(moduleId: string) {
  return async (req: Request, tenantId: string) => {
    const row = await db.query(
      `SELECT is_active FROM tenant_modules WHERE tenant_id=$1 AND module_id=$2`,
      [tenantId, moduleId]
    );
    if (!row.rows[0]?.is_active) {
      return Response.json({ error: 'Module not active' }, { status: 403 });
    }
  };
}
```

---

## Rollout Phases

```
Phase 0 (DONE — Session này):
  └── Layer 2: DB migration + Schema + 5 templates + Sidebar/DashboardGrid dumb components

Phase 1 (Next sprint):
  ├── Layer 1: _themes.scss industry classes + inject data-industry in layout
  ├── Layer 2: 4 P0 widgets (pipeline-summary, revenue-today, tasks-due-today, recent-activity)
  └── Layer 2: Onboarding redirect khi tenant chưa có industry

Phase 2:
  ├── Layer 3: API apply-theme + onboarding module activation
  ├── Layer 3: useModules() hook + withModule middleware
  └── Layer 1: Settings UI — color picker → custom_theme_config lưu DB

Phase 3:
  ├── Layer 2: Industry-specific P1 widgets (appointments-today, reservations-today...)
  └── Layer 3: "In-app store" — tenant bật/tắt module thủ công
```

---

## Files Liên quan

| Layer | File | Mục đích |
|-------|------|----------|
| L1 | `app/styles/_themes.scss` | Thêm `[data-industry]` selectors |
| L1 | `app/(dashboard)/layout.tsx` | Inject `data-industry` + `style` attribute |
| L2 | `lib/nav-config.ts` | Central fetch – thêm `tenant.industry` query |
| L2 | `components/ui/Sidebar.tsx` | Export `ICON_MAP` để validate |
| L2 | `components/ui/DashboardGrid.tsx` | Populate `WIDGET_MAP` theo sprint |
| L3 | `app/api/v1/tenant/apply-theme/route.ts` | Chưa tồn tại – cần tạo |
| L3 | `lib/hooks/useModules.ts` | Chưa tồn tại – cần tạo |
| L3 | `core/engine/rbac.ts` | Thêm `withModule()` |
