-- =============================================================
-- Migration 002: User preferences (theme, language, timezone)
-- =============================================================
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS theme_preference VARCHAR(20) DEFAULT 'indigo',
  ADD COLUMN IF NOT EXISTS language         VARCHAR(10) DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS timezone         VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
  ADD COLUMN IF NOT EXISTS date_format      VARCHAR(20) DEFAULT 'DD/MM/YYYY';
