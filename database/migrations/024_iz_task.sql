-- =============================================================
-- izhubs ERP — Universal Task Engine (iz-task)
-- Tables: tasks, task_subtasks
-- =============================================================

-- ============================================================
-- TASKS (Polymorphic core)
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Polymorphic Entity Reference
  entity_type     VARCHAR(50)   NOT NULL, -- e.g., 'biz-ops.campaign', 'crm.deal'
  entity_id       UUID          NOT NULL,

  title           TEXT          NOT NULL,
  description     TEXT,
  
  status          VARCHAR(20)   NOT NULL DEFAULT 'todo'
                    CHECK (status IN ('todo','in_progress','review','done','cancelled')),
                    
  priority        VARCHAR(20)   NOT NULL DEFAULT 'medium'
                    CHECK (priority IN ('low','medium','high','urgent')),
                    
  due_date        TIMESTAMPTZ,
  
  assignee_id     UUID          REFERENCES users(id) ON DELETE SET NULL,
  creator_id      UUID          REFERENCES users(id) ON DELETE SET NULL,
  
  parent_task_id  UUID, -- Self-referencing FK for subtasks (Optional alternative to task_subtasks)
  
  sort_order      FLOAT         NOT NULL DEFAULT 0, -- For Kanban/List reordering
  
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Self-reference FK explicitly added purely for optional native hierarchy (Phase 3)
ALTER TABLE tasks ADD CONSTRAINT fk_task_parent FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE CASCADE;

-- ── Indexes ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_tasks_polymorphic ON tasks(tenant_id, entity_type, entity_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_status      ON tasks(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_assignee    ON tasks(assignee_id) WHERE deleted_at IS NULL;

-- ── Updated_at triggers ─────────────────────────────────────
DROP TRIGGER IF EXISTS tasks_updated_at ON tasks;
CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── RLS ─────────────────────────────────────────────────────
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tasks_tenant_isolation ON tasks;
CREATE POLICY tasks_tenant_isolation ON tasks AS PERMISSIVE FOR ALL USING (
  COALESCE(current_setting('app.current_tenant_id', true), '') = ''
  OR tenant_id::text = current_setting('app.current_tenant_id', true)
);

-- ============================================================
-- TASK SUBTASKS (Simple checklist approach, preferred for UI)
-- ============================================================
CREATE TABLE IF NOT EXISTS task_subtasks (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id         UUID          NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  tenant_id       UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title           TEXT          NOT NULL,
  is_completed    BOOLEAN       NOT NULL DEFAULT false,
  sort_order      INTEGER       NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subtasks_task ON task_subtasks(task_id);

DROP TRIGGER IF EXISTS task_subtasks_updated_at ON task_subtasks;
CREATE TRIGGER task_subtasks_updated_at BEFORE UPDATE ON task_subtasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE task_subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_subtasks FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS task_subtasks_tenant_isolation ON task_subtasks;
CREATE POLICY task_subtasks_tenant_isolation ON task_subtasks AS PERMISSIVE FOR ALL USING (
  COALESCE(current_setting('app.current_tenant_id', true), '') = ''
  OR tenant_id::text = current_setting('app.current_tenant_id', true)
);

-- ── Seed izTask module flag ──────────────────────────────────
INSERT INTO modules (id, name, description, category, icon, is_official)
VALUES (
  'iz-task',
  'Universal Task Engine',
  'Polymorphic task and subtask engine for generic entity attachments.',
  'core',
  '✅',
  true
) ON CONFLICT (id) DO NOTHING;
