---
name: izhubs-database-engine
description: "Viết database engine layer cho izhubs ERP. Chỉ core/engine/ được gọi db.query(). Bắt buộc Zod parse DB output, soft-delete, transaction. Dùng khi thêm entity mới hoặc sửa truy vấn DB."
risk: safe
source: izhubs-internal
date_added: "2026-03-18"
---

# izhubs ERP — Database Engine Pattern

> `core/engine/` là CỔNG DUY NHẤT đến database. Không có nơi nào khác được gọi `db.query()`.

## Template engine chuẩn

```typescript
// core/engine/<entity>.ts
import { db } from './db';
import { z } from 'zod';
import { eventBus } from './event-bus';

// --- Schema (Zod bắt buộc cho mọi DB output) ---
export const EntitySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string(),
  createdAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable(),
});
export type Entity = z.infer<typeof EntitySchema>;

// --- List ---
export async function list(tenantId: string): Promise<Entity[]> {
  const { rows } = await db.query(
    `SELECT * FROM entities
     WHERE tenant_id = $1 AND deleted_at IS NULL
     ORDER BY created_at DESC`,
    [tenantId]
  );
  return rows.map(r => EntitySchema.parse(r));  // Zod parse bắt buộc
}

// --- Create ---
export async function create(data: { tenantId: string; name: string }): Promise<Entity> {
  const { rows } = await db.query(
    `INSERT INTO entities (tenant_id, name) VALUES ($1, $2) RETURNING *`,
    [data.tenantId, data.name]
  );
  const entity = EntitySchema.parse(rows[0]);
  eventBus.emit('entity.created', { entity });   // Emit sau khi tạo
  return entity;
}

// --- Soft delete (KHÔNG BAO GIỜ DELETE vật lý) ---
export async function remove(id: string, tenantId: string): Promise<void> {
  await db.query(
    `UPDATE entities SET deleted_at = NOW() WHERE id = $1 AND tenant_id = $2`,
    [id, tenantId]
  );
  eventBus.emit('entity.deleted', { id });
}
```

## Rules không được vi phạm

| ❌ Không làm | ✅ Làm thay |
|-------------|------------|
| `DELETE FROM table` | `UPDATE SET deleted_at = NOW()` |
| Return DB rows trực tiếp | Luôn `Schema.parse(row)` trước khi return |
| String interpolation trong SQL | Parameterized queries `$1, $2, ...` |
| Viết query trong route handler | Viết trong `core/engine/<entity>.ts` |
| Multi-table write không có transaction | Dùng `db.withTransaction(async (client) => {...})` |
| Query không có `tenant_id` filter | Luôn filter `AND tenant_id = $N` |

## Transaction pattern

```typescript
// Dùng khi cần write nhiều table cùng lúc
const result = await db.withTransaction(async (client) => {
  const { rows: [deal] } = await client.query(
    `INSERT INTO deals (...) VALUES (...) RETURNING *`, [...]
  );
  await client.query(
    `INSERT INTO activities (deal_id, ...) VALUES ($1, ...)`, [deal.id, ...]
  );
  return DealSchema.parse(deal);
});
```

## Migration rules

```
database/migrations/
  001_initial_schema.sql   ← DDL only (CREATE TABLE + indexes)
  002_seed_data.sql        ← System INSERTs (default tenant, modules)
  00N_description.sql      ← Mỗi thay đổi = file mới, KHÔNG edit file cũ
```

- Chỉ ADD, không bao giờ DROP hay RENAME column trong production
- File migration mới luôn là additive: `ALTER TABLE ... ADD COLUMN ...`
- Sau migration: `npm run db:migrate` — không restart app cần thiết

## Checklist trước khi commit engine mới

- [ ] Tất cả DB output qua `Schema.parse()`
- [ ] Không có `DELETE FROM` — dùng soft-delete
- [ ] Multi-table writes trong `db.withTransaction()`
- [ ] Query có `tenant_id` filter
- [ ] EventBus emit sau mỗi state change
- [ ] Migration file tương ứng nếu có thay đổi schema
