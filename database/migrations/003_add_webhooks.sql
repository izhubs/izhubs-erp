-- =============================================================
-- Migration 003: Outbound webhooks
-- =============================================================
CREATE TABLE IF NOT EXISTS webhooks (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  url         TEXT        NOT NULL,
  events      JSONB        NOT NULL DEFAULT '[]',  -- ["deal.won", "contact.created"]
  secret      VARCHAR(255),                        -- HMAC signing secret
  active      BOOLEAN      NOT NULL DEFAULT true,
  created_by  UUID        REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id  UUID        REFERENCES webhooks(id) ON DELETE CASCADE,
  event       VARCHAR(100) NOT NULL,
  payload     JSONB        NOT NULL DEFAULT '{}',
  status_code INTEGER,
  response    TEXT,
  success     BOOLEAN     NOT NULL DEFAULT false,
  delivered_at TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id);
