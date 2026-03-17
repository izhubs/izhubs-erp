import type { DealStage } from '@/core/schema/entities';

export interface PipelineStageConfig {
  id: DealStage;
  label: string;
  color: string;
  closed?: boolean;
}

export const PIPELINE_STAGES: PipelineStageConfig[] = [
  { id: 'new',         label: 'New',         color: 'var(--color-text-muted)' },
  { id: 'contacted',   label: 'Contacted',   color: '#6366f1' },
  { id: 'qualified',   label: 'Qualified',   color: '#0ea5e9' },
  { id: 'proposal',    label: 'Proposal',    color: '#f59e0b' },
  { id: 'negotiation', label: 'Negotiation', color: '#f97316' },
  { id: 'won',         label: 'Won',         color: '#10b981', closed: true },
  { id: 'lost',        label: 'Lost',        color: '#ef4444', closed: true },
];
