// =============================================================
// izhubs ERP — Top Customers Widget (table.top_customers)
// Server Component: top 8 customers by total deal value.
// Uses AvatarGroup + KpiCard patterns from shared components.
// =============================================================

import Link from 'next/link';
import { db } from '@/core/engine/db';
import { getTenantId } from '@/core/engine/auth';
import { IzBadge } from '@izerp-theme/components/ui/IzBadge';
import { Money } from '@/components/shared/Money';

export async function TopCustomersWidget() {
  const tenantId = await getTenantId();
  const result = await db.query(
    `SELECT
       c.id,
       c.name,
       c.email,
       COUNT(d.id)::integer                          AS deal_count,
       COALESCE(SUM(d.value), 0)::integer            AS total_value,
       COUNT(d.id) FILTER (WHERE d.stage = 'active')::integer AS active_deals,
       COUNT(d.id) FILTER (
         WHERE d.stage = 'renewal'
         AND d.close_date BETWEEN now() AND now() + interval '30 days'
       )::integer AS expiring_soon
     FROM contacts c
     JOIN deals d ON d.company_id = c.id AND d.deleted_at IS NULL
     WHERE c.tenant_id = $1
       AND c.type = 'company'
       AND c.deleted_at IS NULL
     GROUP BY c.id, c.name, c.email
     ORDER BY total_value DESC
     LIMIT 8`,
    [tenantId]
  );

  if (result.rows.length === 0) {
    return (
      <div className="card">
        <div className="card-header">Top Khách hàng</div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-3)' }}>
          Chưa có dữ liệu khách hàng.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">Top Khách hàng (theo doanh thu)</div>
      <table className="table" style={{ marginTop: 'var(--space-3)' }}>
        <thead>
          <tr>
            <th>#</th>
            <th>Công ty</th>
            <th>Tổng giá trị</th>
            <th>Deals active</th>
            <th>Cảnh báo</th>
          </tr>
        </thead>
        <tbody>
          {result.rows.map((row, idx) => (
            <tr key={row.id}>
              <td style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>#{idx + 1}</td>
              <td>
                <div style={{ fontWeight: 600 }}>{row.name}</div>
                {row.email && (
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    {row.email}
                  </div>
                )}
              </td>
              <td align="right" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                <Money value={row.total_value} />
              </td>
              <td>
                <IzBadge variant="secondary">{row.active_deals} deals</IzBadge>
              </td>
              <td>
                {Number(row.expiring_soon) > 0 ? (
                  <IzBadge variant="warning">⚠ Sắp hết hạn</IzBadge>
                ) : (
                  <span style={{ color: 'var(--color-text-subtle)', fontSize: 'var(--font-size-xs)' }}>—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
