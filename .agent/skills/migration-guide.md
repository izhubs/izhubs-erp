---
name: migration-guide
description: How to write safe, sequential database migrations for izhubs ERP.
---

# Database Migration Guide

## Rules

1. **Always sequential** — name files `001_`, `002_`, `003_`... Never skip numbers.
2. **Always idempotent** — use `IF NOT EXISTS`, `IF EXISTS`, `ON CONFLICT DO NOTHING`
3. **Never destructive without warning** — dropping columns or tables = flag in memory.md
4. **Never rename columns** — add new + deprecate old instead (backward compatible)
5. **Always add indexes** for foreign keys and commonly queried fields

## File naming

```
database/migrations/
  001_init_schema.sql       ← First migration
  002_add_custom_fields.sql ← Sequential
  003_add_projects.sql      ← Always next number
```

## Template

```sql
-- =============================================================
-- Migration 00X: [Short description]
-- Created: YYYY-MM-DD
-- =============================================================

-- ADD TABLE
CREATE TABLE IF NOT EXISTS table_name (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  -- Foreign keys
  owner_id    UUID        REFERENCES users(id) ON DELETE SET NULL,
  -- Metadata
  custom_fields JSONB     DEFAULT '{}',
  created_at  TIMESTAMP   DEFAULT NOW(),
  updated_at  TIMESTAMP   DEFAULT NOW()
);

-- ADD INDEXES
CREATE INDEX IF NOT EXISTS idx_table_name_owner ON table_name(owner_id);

-- ADD COLUMN (to existing table)
ALTER TABLE existing_table
  ADD COLUMN IF NOT EXISTS new_column VARCHAR(255);

-- ADD CONSTRAINT
ALTER TABLE existing_table
  ADD CONSTRAINT IF NOT EXISTS fk_name FOREIGN KEY (col) REFERENCES other(id);
```

## After writing a migration

1. Test locally: `docker exec -i izhubs_postgres psql -U postgres -d izhubs_erp < migration.sql`
2. Add to `memory.md` what changed
3. Update entity schema in `core/schema/entities.ts` to match
