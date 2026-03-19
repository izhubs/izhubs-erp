import type { DealStage } from '@/core/schema/entities';

export interface PipelineStageConfig {
  id: DealStage;
  label: string;
  labelVi?: string;
  color: string;
  closed?: boolean;
}

// Generic stages (used by non-industry-specific tenants)
export const GENERIC_STAGES: PipelineStageConfig[] = [
  { id: 'new',         label: 'New',         labelVi: 'Mới',          color: '#94a3b8' },
  { id: 'contacted',   label: 'Contacted',   labelVi: 'Đã liên hệ',   color: '#6366f1' },
  { id: 'qualified',   label: 'Qualified',   labelVi: 'Đủ điều kiện', color: '#0ea5e9' },
  { id: 'proposal',    label: 'Proposal',    labelVi: 'Gửi Proposal',  color: '#f59e0b' },
  { id: 'negotiation', label: 'Negotiation', labelVi: 'Đàm phán',      color: '#f97316' },
  { id: 'won',         label: 'Won',         labelVi: 'Chốt',          color: '#10b981', closed: true },
  { id: 'lost',        label: 'Lost',        labelVi: 'Không chốt',    color: '#ef4444', closed: true },
];

// Virtual Office-specific stages (subscription model)
export const VIRTUAL_OFFICE_STAGES: PipelineStageConfig[] = [
  { id: 'lead',        label: 'New Lead',       labelVi: 'Lead mới',        color: '#94a3b8' },
  { id: 'proposal',    label: 'Proposal Sent',  labelVi: 'Gửi Proposal',    color: '#60a5fa' },
  { id: 'negotiation', label: 'Negotiation',    labelVi: 'Đàm phán',        color: '#f59e0b' },
  { id: 'onboarding',  label: 'Onboarding',     labelVi: 'Onboarding',      color: '#a78bfa' },
  { id: 'active',      label: 'Active Client',  labelVi: 'Đang chạy',       color: '#34d399' },
  { id: 'renewal',     label: 'Up for Renewal', labelVi: 'Gia hạn',         color: '#f97316' },
  { id: 'won',         label: 'Won',            labelVi: 'Đã chốt',         color: '#22c55e', closed: true },
  { id: 'lost',        label: 'Lost',           labelVi: 'Không chốt',      color: '#ef4444', closed: true },
];

// Default export: all stages combined (for PIPELINE_STAGES references)
export const PIPELINE_STAGES: PipelineStageConfig[] = [
  ...VIRTUAL_OFFICE_STAGES,
  ...GENERIC_STAGES.filter(s => !VIRTUAL_OFFICE_STAGES.find(v => v.id === s.id)),
];
