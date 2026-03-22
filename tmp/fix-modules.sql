INSERT INTO tenant_modules (tenant_id, module_id, is_active, installed_at, updated_at, config)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'izform', true, NOW(), NOW(), '{"allowedRoles": ["admin", "member"]}'),
  ('00000000-0000-0000-0000-000000000001', 'izlanding', true, NOW(), NOW(), '{"allowedRoles": ["admin", "member"]}'),
  ('00000000-0000-0000-0000-000000000001', 'biz-ops', true, NOW(), NOW(), '{"allowedRoles": ["admin", "member"]}')
ON CONFLICT (tenant_id, module_id)
DO UPDATE SET is_active = true, updated_at = NOW(), config = EXCLUDED.config;
