// =============================================================
// izhubs ERP — Activity Feed Widget (feed.recent_activity)
// Server Component: last 15 activities across all types.
// Replaced by polling in a future version (WebSocket).
// =============================================================

import { db } from '@/core/engine/db';
import { getTenantId } from '@/core/engine/auth';
import Badge from '@/components/shared/Badge';
import type { BadgeVariant } from '@/components/shared/Badge';

const TYPE_CONFIG: Record<string, { icon: string; label: string; variant: BadgeVariant }> = {
  task:    { icon: '✓', label: 'Task',    variant: 'primary'  },
  call:    { icon: '📞', label: 'Gọi',    variant: 'info'     },
  email:   { icon: '✉',  label: 'Email',  variant: 'neutral'  },
  meeting: { icon: '🗓', label: 'Họp',    variant: 'success'  },
  note:    { icon: '📝', label: 'Ghi chú', variant: 'neutral' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}p trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h trước`;
  return `${Math.floor(hrs / 24)}d trước`;
}

export async function ActivityFeedWidget() {
  const tenantId = await getTenantId();
  const result = await db.query(
    `SELECT
       a.id, a.type, a.title, a.completed,
       a.created_at,
       u.name  AS user_name,
       d.title AS deal_title,
       c.name  AS contact_name
     FROM activities a
     LEFT JOIN users u    ON u.id = a.assigned_to
     LEFT JOIN deals d    ON d.id = a.deal_id
     LEFT JOIN contacts c ON c.id = a.contact_id
     WHERE a.tenant_id = $1
     ORDER BY a.created_at DESC
     LIMIT 15`,
    [tenantId]
  );

  if (result.rows.length === 0) {
    return (
      <div className="card">
        <div className="card-header">Hoạt động gần đây</div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-3)' }}>
          Chưa có hoạt động nào.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">Hoạt động gần đây</div>
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'var(--space-3)' }}>
        {result.rows.map((row, idx) => {
          const cfg = TYPE_CONFIG[row.type as string] ?? { icon: '•', label: row.type, variant: 'neutral' as BadgeVariant };
          return (
            <div
              key={row.id}
              style={{
                display: 'flex',
                gap: 'var(--space-3)',
                padding: 'var(--space-3) 0',
                borderBottom: idx < result.rows.length - 1 ? '1px solid var(--color-border)' : 'none',
                opacity: row.completed ? 0.55 : 1,
              }}
            >
              {/* Icon */}
              <div style={{
                width: 32, height: 32, borderRadius: 'var(--radius-full)',
                background: 'var(--color-bg-hover)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, flexShrink: 0,
              }}>
                {cfg.icon}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  <span style={{
                    fontWeight: 500, fontSize: 'var(--font-size-sm)',
                    textDecoration: row.completed ? 'line-through' : 'none',
                  }}>
                    {row.title}
                  </span>
                  <Badge variant={cfg.variant}>{cfg.label}</Badge>
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {row.user_name && <span>{row.user_name}</span>}
                  {row.deal_title && <span> · 📋 {row.deal_title}</span>}
                  {row.contact_name && <span> · 👤 {row.contact_name}</span>}
                </div>
              </div>

              {/* Time */}
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)', flexShrink: 0, paddingTop: 2 }}>
                {timeAgo(String(row.created_at))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
