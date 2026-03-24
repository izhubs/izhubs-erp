'use client';

// =============================================================
// izhubs ERP — LeadsClient
// Client-side table for Leads page with SidePanel detail.
// =============================================================

import React, { useState } from 'react';
import Badge from '@/components/shared/Badge';
import EmptyState from '@/components/shared/EmptyState';
import SidePanel from '@/components/shared/SidePanel';
import { IzButton } from '@izerp-theme/components/ui/IzButton';
import { formatDate } from '@/lib/userTime';

interface Lead extends Record<string, unknown> {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: string;
  channel: string | null;
  owner_name: string | null;
  created_at: string;
}

const CHANNEL_LABELS: Record<string, string> = {
  google_ads: 'Google Ads',
  facebook: 'Facebook',
  referral: 'Referral',
  website: 'Website',
  cold_call: 'Cold Call',
  event: 'Sự kiện',
};

const STATUS_LABELS: Record<string, { label: string; variant: 'neutral' | 'warning' | 'info' | 'success' | 'danger' }> = {
  new:       { label: 'Mới', variant: 'warning' },
  contacted: { label: 'Đã liên hệ', variant: 'info' },
  qualified: { label: 'Đủ ĐK', variant: 'success' },
  lost:      { label: 'Không tiếp', variant: 'danger' },
};

export default function LeadsClient({ initialLeads }: { initialLeads: Lead[] }) {
  const [selected, setSelected] = useState<Lead | null>(null);

  if (initialLeads.length === 0) {
    return (
      <EmptyState
        title="Chưa có Lead nào"
        description="Thêm lead thủ công hoặc import từ CSV/Excel."
        action={<IzButton variant="default" id="add-lead-btn">+ Thêm Lead đầu tiên</IzButton>}
      />
    );
  }

  return (
    <>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>Công ty</th>
              <th>Kênh</th>
              <th>Trạng thái</th>
              <th>Phụ trách</th>
              <th>Ngày vào</th>
            </tr>
          </thead>
          <tbody>
            {initialLeads.map((lead) => {
              const status = STATUS_LABELS[lead.status] ?? { label: lead.status, variant: 'neutral' as const };
              return (
                <tr key={lead.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(lead)}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{lead.name}</div>
                    {lead.email && (
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{lead.email}</div>
                    )}
                  </td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{lead.company ?? '—'}</td>
                  <td>
                    {lead.channel ? (
                      <Badge variant="primary">{CHANNEL_LABELS[lead.channel] ?? lead.channel}</Badge>
                    ) : '—'}
                  </td>
                  <td><Badge variant={status.variant}>{status.label}</Badge></td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{lead.owner_name ?? '—'}</td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                    {formatDate(lead.created_at)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Lead detail side panel */}
      <SidePanel
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name as string | undefined}
        footer={
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <IzButton variant="ghost">Gọi điện</IzButton>
            <IzButton variant="default">Tạo Deal →</IzButton>
          </div>
        }
      >
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {selected.email && <InfoRow label="Email">{selected.email as string}</InfoRow>}
            {selected.phone && <InfoRow label="Điện thoại">{selected.phone as string}</InfoRow>}
            {selected.company && <InfoRow label="Công ty">{selected.company as string}</InfoRow>}
            <InfoRow label="Kênh tiếp cận">
              {selected.channel ? (CHANNEL_LABELS[selected.channel as string] ?? selected.channel as string) : '—'}
            </InfoRow>
            <InfoRow label="Trạng thái">
              {(() => {
                const s = STATUS_LABELS[selected.status as string] ?? { label: selected.status, variant: 'neutral' as const };
                return <Badge variant={s.variant}>{s.label}</Badge>;
              })()}
            </InfoRow>
            {selected.owner_name && <InfoRow label="Người phụ trách">{selected.owner_name as string}</InfoRow>}
            <InfoRow label="Ngày vào">{formatDate(selected.created_at as string)}</InfoRow>
          </div>
        )}
      </SidePanel>
    </>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 'var(--font-size-sm)' }}>{children}</div>
    </div>
  );
}
