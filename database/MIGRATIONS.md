# Database Migration Guide

> **TL;DR:** Mỗi thay đổi schema = 1 file SQL mới trong `database/migrations/`. Chạy `npm run db:migrate`. Không bao giờ sửa file cũ đã commit.

---

## Cấu trúc thư mục

```
database/
  migrations/
    001_initial_schema.sql   ← DDL gốc (squashed từ 001–008 cũ)
    002_seed_data.sql        ← System defaults (modules catalog, default tenant)
    003_industry_theme.sql   ← Thêm industry + custom_theme_config vào tenants
    004_xxx.sql              ← File tiếp theo bạn tạo
scripts/
  migrate.js                 ← Migration runner (sequential, tracked)
  _bootstrap-migration.js    ← One-time fix cho DB cũ (đã chạy, không chạy lại)
  _check-db-state.js         ← Debug: xem bảng nào đã có trong DB
```

---

## Quy tắc bắt buộc (Golden Rules)

| Rule | Chi tiết |
|------|----------|
| **1 thay đổi = 1 file mới** | `004_xxx.sql`, `005_xxx.sql`... Không bao giờ edit file đã commit |
| **Đặt tên zero-padded** | `004_` không phải `4_` — runner sort theo lexicographic order |
| **DDL vs DML tách biệt** | File `_initial_schema` chỉ chứa `CREATE TABLE` + indexes. `_seed_data` chứa `INSERT`. Không mix |
| **Luôn dùng IF NOT EXISTS** | `CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS` — idempotent |
| **Không bao giờ DROP TABLE** | Dùng soft-delete hoặc create migration `_archive_xxx` nếu thật sự cần |
| **Không edit migration đã push** | Script đã chạy trên production → edit = corrupt state |

---

## Workflow thêm migration mới

### Bước 1 — Tạo file

```powershell
# Xem file cuối cùng đang là số mấy
ls database\migrations\

# Tạo file tiếp theo (ví dụ 004)
New-Item database\migrations\004_add_pipeline_stages.sql
```

### Bước 2 — Viết SQL

```sql
-- =============================================================
-- izhubs ERP — Migration 004: Add pipeline_stages table
-- =============================================================

CREATE TABLE IF NOT EXISTS pipeline_stages (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  key        VARCHAR(50) NOT NULL,
  label      VARCHAR(100) NOT NULL,
  color      VARCHAR(20),
  position   INTEGER     NOT NULL DEFAULT 0,
  created_at TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pipeline_stages_tenant ON pipeline_stages(tenant_id);
```

### Bước 3 — Chạy

```powershell
npm run db:migrate
# Output: 🔄 Running 1 pending migration(s)...
#           ✅ 004_add_pipeline_stages.sql
#         ✅ All migrations applied successfully.
```

### Bước 4 — Verify

```powershell
node scripts/_check-db-state.js
# Kiểm tra bảng mới đã xuất hiện trong danh sách
```

---

## Câu lệnh thường dùng

```powershell
# Chạy migrations
npm run db:migrate

# Xem trạng thái DB (tables + applied migrations)
node scripts/_check-db-state.js

# Seed demo data (agency)
npm run seed:agency

# Seed industry templates vào DB (sau khi thêm template mới)
npm run seed:industry-templates-dry   # validate trước
npm run seed:industry-templates       # ghi vào DB
```

---

## Lịch sử migration

| Thư mục/File | Nội dung |
|------|----------|
| `001_initial_schema.sql` | Squash từ 001–010 cũ. Tất cả bảng cốt lõi và **Universal Extensibility Layer** (`universal_records` với `GIN` jsonb_path_ops index, `record_links`). |
| `002_seed_data.sql` | Default tenant (UUID `...0001`), official modules catalog. |
| `scripts/db-reset.js` | Script `npm run db:reset` tiện dụng để reset DB tự động và apply schema (dùng trong MVP phase không cần file `003`, `004`...). |

---

## ⚡ Sự cố đã gặp — 2026-03-17 (Session 11)

### Bối cảnh
DB local đang chạy schema **cũ từ 2026-03-16** (migrations `001_init_schema.sql` → `007_add_deals_stage_index.sql`). Session này thêm squashed migration system (`001_initial_schema.sql`, `002_seed_data.sql`) với tên file khác.

### Vấn đề
`npm run db:migrate` thấy `001_initial_schema.sql` chưa có trong `schema_migrations` → cố chạy CREATE TABLE nhưng bảng đã tồn tại một phần → lỗi `column tenant_id does not exist`.

### Giải pháp: `scripts/_bootstrap-migration.js`
Script chạy **một lần duy nhất** để:
1. Mark `001_initial_schema.sql` + `002_seed_data.sql` là đã applied (skip rebuild)
2. Tạo các bảng thiếu: `tenants`, `modules`, `tenant_modules`
3. Insert default tenant trước khi ALTER users (FK constraint)
4. ALTER TABLE users ADD COLUMN `tenant_id`, backfill existing rows
5. Insert modules catalog + indexes

Sau đó `npm run db:migrate` chỉ còn apply `003_industry_theme.sql`.

> ⚠️ **Không chạy `_bootstrap-migration.js` lần 2.** Script này idempotent nhưng mọi DB mới sẽ dùng `npm run db:migrate` từ đầu — không cần bootstrap.
>
> Nếu fresh DB (ví dụ production lần đầu, hoặc reset dev): `npm run db:migrate` sẽ tự chạy đúng thứ tự từ 001 → 003 mà không cần bootstrap.

### Trạng thái DB sau session 11
```
Tables: activities, audit_log, companies, contacts, custom_field_definitions,
        deals, import_jobs, industry_templates, modules, schema_migrations,
        tenant_modules, tenants, users, webhook_deliveries, webhooks

Applied (schema_migrations):
  001_init_schema.sql          (2026-03-16 — old)
  001_initial_schema.sql       (2026-03-17 — squashed, bootstrapped)
  002_add_user_prefs.sql       (2026-03-16 — old)
  002_seed_data.sql            (2026-03-17 — squashed, bootstrapped)
  003_add_webhooks.sql → 007_add_deals_stage_index.sql  (2026-03-16 — old)
  003_industry_theme.sql       (2026-03-17 — applied normally)

tenants.industry column: ✅ exists
tenants.custom_theme_config: ✅ exists
industry_templates table: ✅ seeded với 5 templates (agency/restaurant/coworking/ecommerce/spa)
```

### Migration bị lỗi giữa chừng
Runner tự ROLLBACK nếu lỗi. File không bị mark là applied. Fix SQL rồi chạy lại `npm run db:migrate`.

### Muốn reset hoàn toàn DB (dev only)
```powershell
docker compose down -v          # xóa volume DB
docker compose up -d postgres   # fresh DB
npm run db:migrate              # chạy lại từ đầu
npm run seed:agency             # seed demo data
```

> ⚠️ **Không bao giờ reset DB production.** Chỉ dùng cho local dev.

---

## Thêm column vào bảng đã có

```sql
-- Migration 005_add_user_timezone.sql
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
  ADD COLUMN IF NOT EXISTS bio   TEXT;
```

## Thêm index

```sql
-- Luôn dùng IF NOT EXISTS
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
```

## Đổi tên column (cẩn thận)

```sql
-- Migration 006_rename_foo_to_bar.sql
-- Chỉ làm nếu CHƯA có data production
ALTER TABLE contacts RENAME COLUMN old_name TO new_name;
```
