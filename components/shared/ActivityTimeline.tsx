'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, Edit2, Plus, Trash2, ArrowRight } from 'lucide-react';
import { IzAvatar, IzAvatarImage, IzAvatarFallback } from '@/components/ui/IzAvatar';

export interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  before: Record<string, any>;
  after: Record<string, any>;
  created_at: string;
  author_name: string;
  author_avatar: string | null;
}

interface Props {
  entityType?: string;
  entityId?: string;
  /** Pass `open` from the parent slide-over to trigger refetch when panel opens */
  isOpen?: boolean;
}

export function ActivityTimeline({ entityType, entityId, isOpen }: Props = {}) {
  const { data: logs, isLoading, error, refetch } = useQuery({
    queryKey: ['audit-logs', entityType || 'all', entityId || 'all'],
    queryFn: async () => {
      const qs = new URLSearchParams();
      if (entityType) qs.set('entityType', entityType);
      if (entityId)   qs.set('entityId', entityId);
      const res = await fetch(`/api/v1/audit-logs?${qs.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch logs');
      const json = await res.json();
      return json.data as AuditLog[];
    },
    // Refresh every 30s while tab is visible — balanced between freshness and performance
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    staleTime: 0,           // Always refetch when component mounts
  });

  // Refetch immediately when panel opens so user sees the latest changes right away
  const prevOpen = React.useRef(isOpen);
  React.useEffect(() => {
    if (isOpen && !prevOpen.current) refetch();
    prevOpen.current = isOpen;
  }, [isOpen, refetch]);

  if (isLoading) return <div style={{ padding: '12px 0', textAlign: 'center', fontSize: '13px', color: 'var(--color-text-muted)' }}>Loading timeline...</div>;
  if (error)     return <div style={{ padding: '12px 0', textAlign: 'center', fontSize: '13px', color: 'var(--color-danger)' }}>Error loading timeline.</div>;
  if (!logs || logs.length === 0) return <div style={{ padding: '24px 0', textAlign: 'center', fontSize: '13px', color: 'var(--color-text-muted)' }}>No historical activity recorded yet.</div>;

  // Fields to skip — internal/technical metadata
  const SKIP_FIELDS = new Set([
    'id', 'tenant_id', 'updated_at', 'created_at', 'deleted_at',
    'search_vector', 'owner_id', 'company_id', 'contact_id', 'customfields',
    'custom_fields'
  ]);

  // Human-readable field labels
  const FIELD_LABELS: Record<string, string> = {
    name: 'Name', value: 'Value ($)', stage: 'Stage', status: 'Status',
    email: 'Email', phone: 'Phone', title: 'Title', billing: 'Billing',
    price: 'Price', description: 'Description', is_active: 'Active',
    closed_at: 'Closed Date',
  };

  // Shorten UUIDs and long values for display
  const formatVal = (v: any): string => {
    if (v === null || v === undefined || v === '') return '—';
    if (typeof v === 'boolean') return v ? 'Yes' : 'No';
    const s = String(v);
    if (/^[0-9a-f]{8}-[0-9a-f]{4}/.test(s)) return s.split('-')[0] + '…';
    return s.length > 40 ? s.slice(0, 40) + '…' : s;
  };

  return (
    <div style={{ position: 'relative', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Vertical Line */}
      <div style={{ position: 'absolute', top: '16px', bottom: '16px', left: '31px', width: '2px', background: 'var(--color-border)', zIndex: 0 }} />

      {logs.map((log) => {
        let Icon = Edit2;
        let iconColor = 'var(--color-primary)';
        let iconBg = 'var(--color-primary-light, #e0e7ff)';
        const actionUpper = log.action.toUpperCase();

        if (actionUpper === 'CREATE') {
          Icon = Plus; iconColor = 'var(--color-success, #10b981)'; iconBg = 'var(--color-success-light, #d1fae5)';
        } else if (actionUpper === 'DELETE') {
          Icon = Trash2; iconColor = 'var(--color-danger, #ef4444)'; iconBg = 'var(--color-danger-light, #fee2e2)';
        }

        // Diff before vs after — skip technical fields
        let desc = '';
        let changes: { label: string; from: any; to: any }[] = [];

        if (actionUpper === 'UPDATE' && log.after && log.before) {
          const changedKeys = Object.keys(log.after).filter(k => {
            if (SKIP_FIELDS.has(k.toLowerCase())) return false;
            return JSON.stringify(log.before?.[k]) !== JSON.stringify(log.after[k]);
          });
          changes = changedKeys.map(k => ({
            label: FIELD_LABELS[k] || k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            from: log.before?.[k],
            to: log.after[k],
          }));
          desc = changes.length === 1 ? `Changed ${changes[0].label}` : changes.length > 1 ? `Updated ${changes.length} fields` : 'Updated record';
        } else if (actionUpper === 'CREATE') {
          const nameVal = log.after?.name || log.after?.title || '';
          desc = nameVal ? `Created "${nameVal}"` : `Created new ${log.entity_type}`;
        } else if (actionUpper === 'DELETE') {
          const nameVal = log.before?.name || log.before?.title || '';
          desc = nameVal ? `Deleted "${nameVal}"` : `Deleted ${log.entity_type}`;
        } else {
          desc = log.action;
        }

        return (
          <div key={log.id} style={{ position: 'relative', display: 'flex', gap: '16px', zIndex: 10 }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: iconBg, color: iconColor,
              border: '4px solid var(--color-surface, #ffffff)',
              marginLeft: '-4px'
            }}>
               <Icon size={14} strokeWidth={2.5} />
            </div>
            
            <div style={{ flex: 1, background: 'var(--color-bg-subtle, #f8fafc)', borderRadius: 'var(--radius-md)', padding: '12px', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IzAvatar size="sm">
                    {log.author_avatar && <IzAvatarImage src={log.author_avatar} alt={log.author_name} />}
                    <IzAvatarFallback>{log.author_name?.charAt(0) || 'S'}</IzAvatarFallback>
                  </IzAvatar>
                  <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-text)' }}>{log.author_name}</span>
                  {!entityId && log.entity_type && (
                    <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', background: 'var(--color-bg-hover)', color: 'var(--color-text-muted)', padding: '2px 6px', borderRadius: '4px' }}>
                      {log.entity_type}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} /> {new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
              
              <p style={{ fontSize: '13px', color: 'var(--color-text)', marginTop: '6px', fontWeight: 500 }}>
                {desc}
                {(!entityId && log.entity_id) && <span style={{ opacity: 0.4, fontSize: 11 }}> #{log.entity_id.split('-')[0]}</span>}
              </p>
              
              {changes.length > 0 && (
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {changes.map((c, i) => (
                    <div key={i} style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-bg-base)', padding: '4px 8px', borderRadius: '4px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--color-text-muted)', minWidth: '60px' }}>{c.label}:</span>
                      <span style={{ textDecoration: 'line-through', color: 'var(--color-danger, #ef4444)', opacity: 0.8 }}>{formatVal(c.from)}</span>
                      <ArrowRight size={12} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                      <span style={{ color: 'var(--color-success, #10b981)', fontWeight: 600 }}>{formatVal(c.to)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
