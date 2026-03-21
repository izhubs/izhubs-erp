// =============================================================
// izhubs ERP — Company Detail page
// Extensible B2B account page — works for all industry templates.
// Custom fields injected from industry_templates.custom_fields.
// =============================================================

import { db } from '@/core/engine/db';
import { getTenantId } from '@/core/engine/auth';
import { notFound } from 'next/navigation';
import PageHeader from '@/components/shared/PageHeader';
import Badge from '@/components/shared/Badge';
import { IzButton } from '@/components/ui/IzButton';
import { formatMoney } from '@/lib/userTime';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const tenantId = await getTenantId();
  const r = await db.query(`SELECT name FROM contacts WHERE id = $1 AND tenant_id = $2 AND type = 'company'`, [id, tenantId]);
  return { title: `${r.rows[0]?.name ?? 'Công ty'} — izhubs ERP` };
}

export default async function CompanyDetailPage({ params }: Props) {
  const { id } = await params;
  const tenantId = await getTenantId();

  // Fetch company (stored as contact type='company')
  const companyRes = await db.query(
    `SELECT c.*,
       u.name AS owner_name
     FROM contacts c
     LEFT JOIN users u ON u.id = c.owner_id
     WHERE c.id = $1 AND c.tenant_id = $2 AND c.type = 'company'`,
    [id, tenantId]
  );
  if (!companyRes.rows[0]) notFound();
  const company = companyRes.rows[0];

  // Fetch contacts belonging to this company
  const contactsRes = await db.query(
    `SELECT id, name, email, phone, role, status
     FROM contacts
     WHERE company_id = $1 AND tenant_id = $2 AND type = 'person'
     ORDER BY created_at ASC
     LIMIT 20`,
    [id, tenantId]
  );

  // Fetch deals linked to this company
  const dealsRes = await db.query(
    `SELECT id, title, stage, value, owner_id, close_date
     FROM deals
     WHERE company_id = $1 AND tenant_id = $2
     ORDER BY created_at DESC
     LIMIT 10`,
    [id, tenantId]
  );

  // Quick stats
  const statsRes = await db.query(
    `SELECT
       COALESCE(SUM(value), 0)                                         AS total_value,
       COUNT(*) FILTER (WHERE stage NOT IN ('won','lost'))              AS open_deals,
       COUNT(*) FILTER (WHERE stage = 'won')                           AS won_deals,
       COUNT(*) FILTER (WHERE stage = 'renewal'
         AND close_date BETWEEN now() AND now() + interval '30 days')  AS expiring_30d
     FROM deals
     WHERE company_id = $1 AND tenant_id = $2`,
    [id, tenantId]
  );
  const stats = statsRes.rows[0];

  const STAGE_LABEL: Record<string, string> = {
    lead: 'New Lead', proposal: 'Proposal Sent', negotiation: 'Negotiation',
    onboarding: 'Onboarding', active: 'Active', renewal: 'Up for Renewal',
    won: 'Won', lost: 'Lost',
  };

  return (
    <div className="page">
      <PageHeader
        title={company.name}
        breadcrumb={<><a href="/contacts" style={{ color: 'var(--color-primary)' }}>Contacts</a> / Company</>}
        actions={
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <IzButton variant="ghost">Add Contact</IzButton>
            <IzButton variant="default">Create Deal</IzButton>
          </div>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 220px', gap: 'var(--space-6)', alignItems: 'start' }}>

        {/* LEFT — Company Info */}
        <aside className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Logo placeholder */}
          <div style={{
            width: 56, height: 56, borderRadius: 'var(--radius-md)',
            background: 'var(--color-primary-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-primary)',
          }}>
            {company.name?.charAt(0).toUpperCase()}
          </div>

          <Field label="Website">{company.website ?? '—'}</Field>
          <Field label="Email">{company.email ?? '—'}</Field>
          <Field label="Phone">{company.phone ?? '—'}</Field>
          <Field label="Address">{company.address ?? '—'}</Field>

          {/* Extensible custom fields section */}
          {company.custom_fields && Object.keys(company.custom_fields).length > 0 && (
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
                Thông tin mở rộng
              </div>
              {Object.entries(company.custom_fields as Record<string, unknown>).map(([k, v]) => (
                <Field key={k} label={k}>{String(v)}</Field>
              ))}
            </div>
          )}

          {company.owner_name && <Field label="Account Owner">{company.owner_name}</Field>}
        </aside>

        {/* MIDDLE — Tabs */}
        <div>
          {/* Contacts tab */}
          <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
            <div className="card-header">Contacts ({contactsRes.rows.length})</div>
            {contactsRes.rows.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>No contacts yet.</p>
            ) : (
              <table className="table" style={{ marginTop: 'var(--space-3)' }}>
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Title</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {contactsRes.rows.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 500 }}>{c.name}</td>
                      <td style={{ color: 'var(--color-text-muted)' }}>{c.email}</td>
                      <td style={{ color: 'var(--color-text-muted)' }}>{c.role ?? '—'}</td>
                      <td>
                        <Badge variant={c.status === 'active' ? 'success' : 'neutral'}>
                          {c.status === 'active' ? 'Active' : c.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Deals tab */}
          <div className="card">
            <div className="card-header">Deals ({dealsRes.rows.length})</div>
            {dealsRes.rows.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>No deals yet.</p>
            ) : (
              <table className="table" style={{ marginTop: 'var(--space-3)' }}>
                <thead>
                  <tr><th>Deal</th><th>Stage</th><th>Value</th></tr>
                </thead>
                <tbody>
                  {dealsRes.rows.map((d) => (
                    <tr key={d.id}>
                      <td style={{ fontWeight: 500 }}>{d.title}</td>
                      <td><Badge variant="info">{STAGE_LABEL[d.stage] ?? d.stage}</Badge></td>
                      <td>{formatMoney(d.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* RIGHT — Quick Stats */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <StatCard label="Total deal value" value={formatMoney(stats.total_value)} />
          <StatCard label="Open deals" value={String(stats.open_deals)} />
          <StatCard label="Won deals" value={String(stats.won_deals)} />
          {Number(stats.expiring_30d) > 0 && (
            <StatCard
              label="Contracts expiring (30d)"
              value={String(stats.expiring_30d)}
              urgent
            />
          )}
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>{children}</div>
    </div>
  );
}

function StatCard({ label, value, urgent }: { label: string; value: string; urgent?: boolean }) {
  return (
    <div className={`card`} style={{
      borderColor: urgent ? 'var(--color-danger)' : undefined,
      padding: 'var(--space-4)',
    }}>
      <div style={{ fontSize: 'var(--font-size-xs)', color: urgent ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>{label}</div>
      <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginTop: 4 }}>{value}</div>
    </div>
  );
}
