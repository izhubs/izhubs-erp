-- =============================================================
-- izhubs ERP — Migration 009: Module Registry
-- Created: 2026-03-17
-- Purpose: Catalog of all available modules in the system.
--          Modules are registered here by devs (official or 3rd-party).
--          Actual activation per tenant is tracked in tenant_modules (010).
-- =============================================================

CREATE TABLE IF NOT EXISTS modules (
  id            VARCHAR(100) PRIMARY KEY,           -- e.g. 'crm', 'contracts', 'invoices'
  name          VARCHAR(255) NOT NULL,
  description   TEXT,
  version       VARCHAR(50)  NOT NULL DEFAULT '1.0.0',
  category      VARCHAR(100) NOT NULL               -- 'core' | 'finance' | 'operations' | 'communication'
                  CHECK (category IN ('core', 'finance', 'operations', 'communication')),
  icon          VARCHAR(10),                        -- emoji icon
  is_official   BOOLEAN      NOT NULL DEFAULT true, -- false = 3rd-party community module
  config_schema JSONB        NOT NULL DEFAULT '{}', -- JSON Schema for module config options
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ---- Seed: Official Core Modules ----
INSERT INTO modules (id, name, description, version, category, icon, is_official) VALUES
  ('crm',        'CRM Pipeline',      'Quản lý Pipeline deals và Contacts. Kanban board drag-drop.',       '1.0.0', 'core',          '📊', true),
  ('contracts',  'Hợp đồng',          'Tạo và quản lý hợp đồng. Template hợp đồng theo gói dịch vụ.',    '1.0.0', 'finance',       '📋', true),
  ('invoices',   'Hóa đơn',           'Quản lý hóa đơn, recurring billing, xuất hóa đơn VAT.',           '1.0.0', 'finance',       '🧾', true),
  ('reports',    'Báo cáo',           'Dashboard báo cáo MRR, Churn, Pipeline, Occupancy.',               '1.0.0', 'operations',    '📈', true),
  ('mail-log',   'Nhật ký Bưu phẩm',  'Log bưu phẩm đến/đi, thông báo khách, trạng thái xử lý.',        '1.0.0', 'operations',    '📬', true),
  ('room-booking','Đặt Phòng',        'Quản lý lịch đặt phòng họp, hot desk theo giờ/ngày.',             '1.0.0', 'operations',    '🗓️', true),
  ('automation', 'Tự động hóa',       'Trigger → Condition → Action. Nhắc follow-up, gửi email tự động.', '1.0.0', 'operations',   '⚡', true)
ON CONFLICT (id) DO NOTHING;

-- Index for category filtering (App Store page)
CREATE INDEX IF NOT EXISTS idx_modules_category ON modules(category);
CREATE INDEX IF NOT EXISTS idx_modules_is_official ON modules(is_official);
