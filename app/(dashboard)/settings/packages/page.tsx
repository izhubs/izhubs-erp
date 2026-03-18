// =============================================================
// izhubs ERP — Service Packages page (/settings/packages)
// Manage service plan tiers: Cơ bản / Pro / Enterprise.
// Admin-only: create, edit, toggle status.
// Works for any subscription industry — driven by template config.
// =============================================================

import { db } from '@/core/engine/db';
import { getTenantId } from '@/core/engine/auth';
import PageHeader from '@/components/shared/PageHeader';
import Badge from '@/components/shared/Badge';
import EmptyState from '@/components/shared/EmptyState';

export const metadata = { title: 'Gói Dịch vụ — izhubs ERP' };

export default async function ServicePackagesPage() {
  const tenantId = await getTenantId();

  // Fetch service packages for this tenant
  const pkgsRes = await db.query(
    `SELECT
       sp.*,
       COUNT(DISTINCT d.id) FILTER (WHERE d.stage NOT IN ('won','lost')) AS subscriber_count,
       COALESCE(SUM(d.value) FILTER (WHERE d.stage NOT IN ('won','lost')), 0) AS monthly_revenue
     FROM service_packages sp
     LEFT JOIN deals d ON d.package_id = sp.id AND d.tenant_id = sp.tenant_id
     WHERE sp.tenant_id = $1
     GROUP BY sp.id
     ORDER BY sp.sort_order ASC, sp.created_at ASC`,
    [tenantId]
  );
  const packages = pkgsRes.rows;

  return (
    <div className="page">
      <PageHeader
        title="Gói Dịch vụ"
        subtitle="Quản lý các gói dịch vụ và tính năng đi kèm"
        actions={
          <button className="btn btn-primary" id="create-package-btn">
            + Tạo gói mới
          </button>
        }
      />

      {packages.length === 0 ? (
        <EmptyState
          title="Chưa có gói dịch vụ nào"
          description="Tạo gói dịch vụ đầu tiên để Sales có thể chọn khi tạo Deal."
          action={<button className="btn btn-primary">+ Tạo gói đầu tiên</button>}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 'var(--space-5)', alignItems: 'start' }}>

          {/* LEFT — Package list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {packages.map((pkg) => (
              <div key={pkg.id} className="card" style={{
                cursor: 'pointer',
                borderColor: pkg.status === 'active' ? 'var(--color-border)' : 'transparent',
                opacity: pkg.status === 'archived' ? 0.5 : 1,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                  <span style={{ fontWeight: 600 }}>{pkg.name}</span>
                  <Badge variant={pkg.status === 'active' ? 'success' : pkg.status === 'draft' ? 'neutral' : 'warning'}>
                    {pkg.status === 'active' ? 'Đang bán' : pkg.status === 'draft' ? 'Nháp' : 'Ngừng bán'}
                  </Badge>
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                  {Number(pkg.monthly_price).toLocaleString('vi-VN')}đ / tháng
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)', marginTop: 4 }}>
                  {pkg.subscriber_count} khách đang dùng
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT — First package detail (static — client interactivity future) */}
          {packages[0] && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-5)' }}>
                <div>
                  <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>{packages[0].name}</h2>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginTop: 4 }}>
                    {packages[0].description}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <button className="btn btn-ghost">Chỉnh sửa</button>
                  <button className="btn btn-danger" style={{ fontSize: 'var(--font-size-xs)' }}>Ngừng bán</button>
                </div>
              </div>

              {/* Pricing */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
                <div className="card" style={{ padding: 'var(--space-4)' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Giá theo tháng</div>
                  <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginTop: 4 }}>
                    {Number(packages[0].monthly_price).toLocaleString('vi-VN')}đ
                  </div>
                </div>
                <div className="card" style={{ padding: 'var(--space-4)' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Giá theo năm</div>
                  <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginTop: 4 }}>
                    {packages[0].annual_price
                      ? `${Number(packages[0].annual_price).toLocaleString('vi-VN')}đ`
                      : '—'}
                  </div>
                </div>
              </div>

              {/* Features */}
              {Array.isArray(packages[0].features) && packages[0].features.length > 0 && (
                <div style={{ marginBottom: 'var(--space-5)' }}>
                  <div style={{ fontWeight: 600, marginBottom: 'var(--space-3)' }}>Tính năng bao gồm</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {(packages[0].features as string[]).map((f: string, i: number) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)' }}>
                        <span style={{ color: 'var(--color-success)' }}>✓</span> {f}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
                <div style={{ fontWeight: 600, marginBottom: 'var(--space-3)' }}>Số liệu</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
                  <div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Khách đang dùng</div>
                    <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>{packages[0].subscriber_count}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Doanh thu/tháng</div>
                    <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>
                      {Number(packages[0].monthly_revenue).toLocaleString('vi-VN')}đ
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Tỷ lệ gia hạn</div>
                    <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>—</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
