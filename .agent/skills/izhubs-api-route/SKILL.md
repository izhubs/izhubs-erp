---
name: izhubs-api-route
description: "Viết API route chuẩn cho izhubs ERP. Bắt buộc withPermission() + ApiResponse + Zod. Dùng khi tạo hoặc review bất kỳ route nào trong app/api/v1/."
risk: safe
source: izhubs-internal
date_added: "2026-03-18"
---

# izhubs ERP — API Route Pattern

> Mọi route PHẢI theo pattern này. Không có ngoại lệ.

## Template chuẩn

```typescript
// app/api/v1/<resource>/route.ts
import { withPermission } from '@/core/engine/rbac';
import { ApiResponse } from '@/core/engine/response';
import { z } from 'zod';
import * as Engine from '@/core/engine/<resource>';

// --- Input schema ---
const CreateSchema = z.object({
  name: z.string().min(1).max(255),
  // ...
});

// GET /api/v1/<resource>
export const GET = withPermission('<resource>:read', async (req, claims) => {
  try {
    const items = await Engine.list(claims.tenantId);
    return ApiResponse.success(items);
  } catch (err) {
    return ApiResponse.serverError(err);
  }
});

// POST /api/v1/<resource>
export const POST = withPermission('<resource>:write', async (req, claims) => {
  const body = await req.json().catch(() => null);
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return ApiResponse.validationError(parsed.error);

  try {
    const item = await Engine.create({ ...parsed.data, tenantId: claims.tenantId });
    return ApiResponse.success(item, 201);
  } catch (err) {
    return ApiResponse.serverError(err);
  }
});
```

## Rules — KHÔNG được vi phạm

| ❌ Không làm | ✅ Làm thay |
|-------------|------------|
| `NextResponse.json(...)` trực tiếp | `ApiResponse.success/error/validationError/serverError` |
| Import `db` từ `core/engine/db.ts` trong route | Import từ engine layer (`core/engine/<resource>.ts`) |
| Không có permission guard | Luôn wrap với `withPermission()` hoặc `withModule()` |
| Parse body mà không validate | Dùng Zod `safeParse()`, return `validationError` nếu fail |
| Hardcode tenantId | Lấy từ `claims.tenantId` |
| `try {}` không có `catch` | Luôn catch + return `ApiResponse.serverError(err)` |

## ApiResponse factory reference

```typescript
ApiResponse.success(data, status?)        // 200/201
ApiResponse.error(message, status?)       // 400/404/etc
ApiResponse.validationError(zodError)     // 422
ApiResponse.serverError(err)              // 500 — tự log error
```

## withModule vs withPermission

```typescript
// Dùng withPermission cho core entities (contacts, deals, users)
export const GET = withPermission('contacts:read', handler)

// Dùng withModule cho premium modules (invoices, contracts, automation)
// Tự động check cả RBAC + module activation cho tenant
export const GET = withModule('invoices', 'contacts:read', handler)
```

## Checklist trước khi commit route mới

- [ ] Wrap với `withPermission()` hoặc `withModule()`
- [ ] Tất cả input qua Zod `safeParse()`
- [ ] Không có `NextResponse.json()` trực tiếp
- [ ] `tenantId` lấy từ `claims`, không hardcode
- [ ] `try/catch` cho tất cả async operations
- [ ] Contract test trong `tests/contracts/`
