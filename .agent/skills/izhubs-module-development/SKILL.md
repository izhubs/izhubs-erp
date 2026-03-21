---
name: izhubs-module-development
description: "Tạo module ERP mới theo Fat Module pattern của izhubs. Bao gồm DB migration, engine, API routes, UI components, và tests. Dùng khi implement tính năng nghiệp vụ mới như invoices, HR, inventory."
risk: safe
source: izhubs-internal
date_added: "2026-03-18"
---

# izhubs ERP — Fat Module Development

## Fat Module = tự chứa hoàn toàn

```
modules/<name>/
  index.ts              ← IzhubsModule interface (metadata + activate/deactivate)
  engine/
    <entity>.ts         ← Business logic, DB queries
    schema.ts           ← Zod schemas cho module này
  components/
    <Feature>.tsx       ← React components
    <Feature>.module.scss
  hooks/
    use<Feature>.ts     ← React hooks (TanStack Query nếu đã adopt)
  types.ts              ← TypeScript types export
```

## Bước 1 — Đăng ký module trong Registry

```typescript
// modules/<name>/index.ts
import type { IzhubsModule } from '@/core/types/module.interface';

const module: IzhubsModule = {
  id: '<name>',                      // slug nhất quán với DB
  name: 'Tên hiển thị',
  description: 'Mô tả ngắn gọn',
  version: '1.0.0',
  icon: '📦',
  category: 'operations',           // crm | finance | operations | hr
  permissions: ['<name>:read', '<name>:write', '<name>:delete'],

  async activate(tenantId: string) {
    // Chạy khi tenant bật module — seed defaults nếu cần
  },
  async deactivate(tenantId: string) {
    // Soft-disable, KHÔNG xóa data
  },
};
export default module;
```

## Bước 2 — Thêm Permissions vào RBAC

```typescript
// core/engine/rbac.ts — thêm vào Permission type
export type Permission =
  | 'contacts:read'
  // ... existing ...
  | '<name>:read'      // ← thêm vào đây
  | '<name>:write'
  | '<name>:delete';

// Và cập nhật ROLE_PERMISSIONS matrix
```

## Bước 3 — Migration file

```sql
-- database/migrations/00N_<name>_module.sql
CREATE TABLE <name>_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id),
  -- fields...
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ                          -- soft delete
);

CREATE INDEX <name>_items_tenant_idx ON <name>_items(tenant_id)
  WHERE deleted_at IS NULL;
```

## Bước 4 — Engine layer

```typescript
// modules/<name>/engine/<entity>.ts
import { db } from '@/core/engine/db';
import { EntitySchema } from '../schema';
import { eventBus } from '@/core/engine/event-bus';

export async function list(tenantId: string) {
  const { rows } = await db.query(
    `SELECT * FROM <name>_items WHERE tenant_id = $1 AND deleted_at IS NULL`,
    [tenantId]
  );
  return rows.map(r => EntitySchema.parse(r));
}
```

## Bước 5 — API Routes

```typescript
// app/api/v1/<name>/route.ts
import { withModule } from '@/core/engine/rbac';  // <-- withModule, không phải withPermission
import { ApiResponse } from '@/core/engine/response';
import * as Engine from '@/modules/<name>/engine/<entity>';

export const GET = withModule('<name>', '<name>:read', async (req, claims) => {
  const items = await Engine.list(claims.tenantId);
  return ApiResponse.success(items);
});
```

## Bước 6 — Seed module vào modules catalog

```sql
-- database/migrations/002_seed_data.sql (hoặc dedicated seed)
INSERT INTO modules (id, name, description, category, icon, is_core)
VALUES ('<name>', 'Tên module', 'Mô tả', 'operations', '📦', false)
ON CONFLICT (id) DO NOTHING;
```

## Checklist hoàn thành module

- [ ] `modules/<name>/index.ts` implement `IzhubsModule` interface
- [ ] Permissions thêm vào `core/engine/rbac.ts` Permission type + ROLE_PERMISSIONS
- [ ] Migration file `00N_<name>.sql` với tenant_id + soft-delete + index
- [ ] Engine dùng Zod parse DB output
- [ ] Route dùng `withModule()` (không phải `withPermission()`)
- [ ] Module seeded vào `modules` table
- [ ] Contract test `tests/contracts/<name>-api.test.ts` tối thiểu 3 cases
- [ ] `README.md` trong module folder

## Module Categories

| Category | Ví dụ |
|----------|-------|
| `crm` | Contacts, Deals, Pipeline |
| `finance` | Invoices, Payments, Contracts |
| `operations` | Tasks, Projects, Inventory |
| `hr` | Employees, Attendance, Payroll |
| `marketing` | Campaigns, Email, Landing Pages |

## UI & Data Formatting Standard

Để đảm bảo User Settings (đơn vị tiền tệ, múi giờ) hoạt động đồng bộ:
1. **Tiền tệ (Tuyệt đối KHÔNG hardcode `₫`, `VND`, hay `toLocaleString('vi-VN')`)**:
   - **Server Components**: Sử dụng `<Money value={...} />` từ `@/components/shared/Money`. Dùng `<Money value={...} compact />` nếu cần số tóm tắt (VD: 1.5M).
   - **Client Components**: Dùng hook `const { fmt, fmtCompact } = useCurrency()` từ `@/lib/hooks/useCurrency`.
2. **Ngày giờ (Tuyệt đối KHÔNG dùng raw Date string)**:
   - Dùng các hàm từ `@/lib/userTime` (`formatDate`, `formatDateTime`, `formatTime`) để render ngày giờ đúng Timezone mà user đã chọn.
