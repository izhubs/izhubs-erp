// =============================================================
// izhubs ERP — /leads page (Virtual Office)
// Leads = contacts with status='lead' chưa trở thành khách chính thức.
// Server Component: fetches tabs counts + initial data.
// =============================================================

import { db } from '@/core/engine/db';
import { getTenantId } from '@/core/engine/auth';
import PageHeader from '@/components/shared/PageHeader';
import Badge from '@/components/shared/Badge';
import LeadsClient from '@/components/shared/LeadsClient';

export const metadata = { title: 'Leads — izhubs ERP' };

export default async function LeadsPage() {
  const tenantId = await getTenantId();

  const [leadsRes, countsRes] = await Promise.all([
    db.query(
      `SELECT
         c.id, c.name, c.email, c.phone, c.company, c.status,
         c.source AS channel,
         c.owner_id,
         u.name AS owner_name,
         c.created_at
       FROM contacts c
       LEFT JOIN users u ON u.id = c.owner_id
       WHERE c.tenant_id = $1
         AND c.type = 'lead'
         AND c.deleted_at IS NULL
       ORDER BY c.created_at DESC
       LIMIT 100`,
      [tenantId]
    ),
    db.query(
      `SELECT
         status,
         COUNT(*) AS count
       FROM contacts
       WHERE tenant_id = $1 AND type = 'lead' AND deleted_at IS NULL
       GROUP BY status`,
      [tenantId]
    ),
  ]);

  const counts: Record<string, number> = {};
  for (const r of countsRes.rows) counts[r.status] = Number(r.count);

  return (
    <div className="page">
      <PageHeader
        title="Danh sách Leads"
        subtitle="Khách hàng tiềm năng đang được theo dõi"
        actions={
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <a href="/import" className="btn btn-ghost">📥 Import CSV</a>
            <button className="btn btn-primary" id="add-lead-btn">+ Thêm Lead</button>
          </div>
        }
      />

      {/* Tab counts */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
        <TabCount label="Tất cả" count={Object.values(counts).reduce((a, b) => a + b, 0)} active />
        <TabCount label="Mới hôm nay" count={0} />
        <TabCount label="Chưa liên hệ" count={counts['new'] ?? 0} badge="warning" />
        <TabCount label="Đã liên hệ" count={counts['contacted'] ?? 0} badge="info" />
        <TabCount label="Đủ điều kiện" count={counts['qualified'] ?? 0} badge="success" />
      </div>

      <LeadsClient initialLeads={leadsRes.rows} />
    </div>
  );
}

function TabCount({
  label, count, active = false, badge
}: {
  label: string; count: number; active?: boolean; badge?: string
}) {
  return (
    <button
      className={`btn ${active ? 'btn-primary' : 'btn-ghost'}`}
      style={{ fontSize: 'var(--font-size-sm)' }}
    >
      {label}
      <Badge variant={badge as 'warning' | 'info' | 'success' | 'neutral' | undefined ?? 'neutral'}>
        {count}
      </Badge>
    </button>
  );
}
