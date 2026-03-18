// =============================================================
// izhubs ERP — /contracts page (Virtual Office)
// Quản lý hợp đồng dịch vụ & theo dõi gia hạn.
// Highlight deals ở stage 'renewal' sắp hết hạn trong 30 ngày.
// =============================================================

import { db } from '@/core/engine/db';
import { getTenantId } from '@/core/engine/auth';
import { PageHeader, KpiCard, Badge, DataTable } from '@/components/shared';
import type { DataTableColumn } from '@/components/shared';

export const metadata = { title: 'Hợp đồng & Gia hạn — izhubs ERP' };

interface ContractRow extends Record<string, unknown> {
  id: string;
  name: string;
  company: string | null;
  package_name: string | null;
  stage: string;
  value: number;
  close_date: string | null;
  owner_name: string | null;
  days_until_expiry: number | null;
}

const COLUMNS: DataTableColumn<ContractRow>[] = [
  {
    key: 'name',
    label: 'Tên hợp đồng',
    render: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span>,
  },
  { key: 'company', label: 'Công ty', render: (r) => r.company ?? '—' },
  { key: 'package_name', label: 'Gói dịch vụ', render: (r) => r.package_name ?? '—' },
  {
    key: 'stage',
    label: 'Trạng thái',
    render: (r) => {
      const map: Record<string, { label: string; variant: string }> = {
        active:   { label: 'Đang hiệu lực', variant: 'success'  },
        renewal:  { label: 'Cần gia hạn',   variant: 'warning'  },
        proposal: { label: 'Chờ ký',        variant: 'info'     },
        won:      { label: 'Đã kết thúc',   variant: 'neutral'  },
      };
      const s = map[r.stage] ?? { label: r.stage, variant: 'neutral' };
      return <Badge variant={s.variant as 'success' | 'warning' | 'info' | 'neutral'}>{s.label}</Badge>;
    },
  },
  {
    key: 'value',
    label: 'Giá trị',
    render: (r) => `${Number(r.value).toLocaleString('vi-VN')}đ`,
  },
  {
    key: 'close_date',
    label: 'Hết hạn',
    render: (r) =>
      r.close_date
        ? new Date(r.close_date).toLocaleDateString('vi-VN')
        : '—',
  },
  {
    key: 'days_until_expiry',
    label: 'Còn lại',
    render: (r) => {
      if (r.days_until_expiry === null) return '—';
      if (r.days_until_expiry <= 0) return <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>Đã hết hạn</span>;
      if (r.days_until_expiry <= 30) return <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>{r.days_until_expiry} ngày</span>;
      return <span style={{ color: 'var(--color-text-muted)' }}>{r.days_until_expiry} ngày</span>;
    },
  },
  { key: 'owner_name', label: 'Phụ trách', render: (r) => r.owner_name ?? '—' },
];

export default async function ContractsPage() {
  const tenantId = await getTenantId();

  const [contractsRes, statsRes] = await Promise.all([
    db.query(
      `SELECT
         d.id, d.name,
         c.name     AS company,
         sp.name    AS package_name,
         d.stage,
         d.value,
         d.close_date,
         u.name     AS owner_name,
         CASE
           WHEN d.close_date IS NOT NULL
           THEN (d.close_date::date - CURRENT_DATE)
           ELSE NULL
         END        AS days_until_expiry
       FROM deals d
       LEFT JOIN contacts c       ON c.id = d.company_id
       LEFT JOIN service_packages sp ON sp.id = d.package_id
       LEFT JOIN users u          ON u.id = d.owner_id
       WHERE d.tenant_id = $1
         AND d.stage IN ('active', 'renewal', 'proposal', 'won')
         AND d.deleted_at IS NULL
       ORDER BY
         CASE WHEN d.stage = 'renewal' THEN 0 ELSE 1 END,
         d.close_date ASC NULLS LAST`,
      [tenantId]
    ),
    db.query(
      `SELECT
         COUNT(*) FILTER (WHERE stage = 'active')                                   AS active,
         COUNT(*) FILTER (WHERE stage = 'renewal')                                  AS needs_renewal,
         COUNT(*) FILTER (WHERE stage = 'renewal'
           AND close_date BETWEEN now() AND now() + interval '7 days')              AS expiring_7d,
         COALESCE(SUM(value) FILTER (WHERE stage = 'active'), 0)                    AS arr
       FROM deals
       WHERE tenant_id = $1 AND deleted_at IS NULL`,
      [tenantId]
    ),
  ]);

  const stats = statsRes.rows[0];
  const contracts: ContractRow[] = contractsRes.rows;

  return (
    <div className="page">
      <PageHeader
        title="Hợp đồng & Gia hạn"
        subtitle="Theo dõi vòng đời hợp đồng dịch vụ Virtual Office"
        actions={
          <button className="btn btn-primary">+ Tạo hợp đồng</button>
        }
      />

      {/* KPI summary bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <KpiCard
          label="Đang hiệu lực"
          value={String(stats.active)}
          trendDirection="neutral"
        />
        <KpiCard
          label="Cần gia hạn"
          value={String(stats.needs_renewal)}
          urgent={Number(stats.needs_renewal) > 0}
          trendDirection={Number(stats.needs_renewal) > 0 ? 'down' : 'neutral'}
        />
        <KpiCard
          label="Hết hạn trong 7 ngày"
          value={String(stats.expiring_7d)}
          urgent={Number(stats.expiring_7d) > 0}
          trendDirection={Number(stats.expiring_7d) > 0 ? 'down' : 'neutral'}
        />
        <KpiCard
          label="ARR (Doanh thu năm)"
          value={`${Number(stats.arr).toLocaleString('vi-VN')}đ`}
          trendDirection="neutral"
        />
      </div>

      {/* Contracts table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <DataTable<ContractRow>
          columns={COLUMNS}
          rows={contracts}
          rowKey="id"
          emptyTitle="Chưa có hợp đồng nào"
          emptyDescription="Tạo deal với stage 'Đang chạy' để thấy hợp đồng ở đây."
          highlightRow={(r) => {
            if (r.days_until_expiry !== null && r.days_until_expiry <= 0) return 'danger';
            if (r.days_until_expiry !== null && r.days_until_expiry <= 30) return 'warning';
            return null;
          }}
        />
      </div>
    </div>
  );
}
