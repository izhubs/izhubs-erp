'use client';

import { useState } from 'react';
import { IzButton } from '@/components/ui/IzButton';
import { IzBadge } from '@/components/ui/IzBadge';
import { IzAvatar } from '@/components/ui/IzAvatar';
import { CampaignCard } from '@/components/plugins/biz-ops/CampaignCard';
import { ContractPaymentsModal } from '@/components/plugins/biz-ops/ContractPaymentsModal';
import { CampaignFormModal } from '@/components/plugins/biz-ops/CampaignFormModal';
import styles from '@/components/plugins/biz-ops/BizOpsCampaign.module.scss'; // Reuse Lumina design

interface ContractData {
  id: string;
  title: string;
  code: string | null;
  status: string;
  total_value: number;
  collected_value: number;
  currency: string;
  start_date: string | null;
  end_date: string | null;
}

interface CampaignData {
  id: string;
  contract_id: string;
  name: string;
  type: string;
  allocated_budget: number;
  actual_cogs: number;
  stage: string;
  health: string;
  start_date: string | null;
  end_date: string | null;
}

interface Props {
  initialContract: any; // Using any for swift mapping from DB types
  campaigns: CampaignData[];
}

export function BizOpsContract({ initialContract, campaigns = [] }: Props) {
  const [contract, setContract] = useState<ContractData>({
    ...initialContract,
    start_date: initialContract.start_date?.toString() ?? null,
    end_date: initialContract.end_date?.toString() ?? null,
  });
  const [campaignsState, setCampaignsState] = useState<CampaignData[]>(campaigns || []);
  const [showPayments, setShowPayments] = useState(false);
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);

  const formatMoney = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
    return val.toLocaleString();
  };

  const pctCollected = contract.total_value > 0 ? (contract.collected_value / contract.total_value) * 100 : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-header" style={{ flexShrink: 0, paddingBottom: '16px', borderBottom: '1px solid var(--color-border)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <IzButton variant="ghost" size="sm" onClick={() => window.location.href = '/plugins/biz-ops'} style={{ padding: '0 8px', height: '24px' }}>← Back to Projects</IzButton>
          <IzBadge variant={contract.status === 'in_progress' ? 'info' : contract.status === 'completed' ? 'success' : 'default'}>
            {contract.status.replace('_', ' ').toUpperCase()}
          </IzBadge>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>
              {contract.code ? `[${contract.code}] ` : ''}{contract.title}
            </h1>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '8px' }}>
              Collected: {formatMoney(contract.collected_value)} / {formatMoney(contract.total_value)} {contract.currency}
            </div>
            
            <div style={{ marginTop: '12px', width: '300px' }}>
              <div style={{ width: '100%', height: '6px', background: 'var(--color-bg-hover)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(pctCollected, 100)}%`, height: '100%', background: 'var(--color-primary)' }} />
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <IzButton variant="outline" size="sm" onClick={() => setShowPayments(true)}>
              💳 Payments
            </IzButton>
            <IzButton size="sm" onClick={() => setShowCreateCampaign(true)}>
              + Project
            </IzButton>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 32px' }}>
        {/* Child Projects (Campaigns) Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {campaignsState.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '48px', textAlign: 'center', color: 'var(--on-surface-variant)', background: 'var(--surface-container-low)', borderRadius: '16px' }}>
              <p>No projects attached to this contract yet.</p>
              <IzButton variant="outline" onClick={() => setShowCreateCampaign(true)} style={{ marginTop: '16px' }}>Create Project</IzButton>
            </div>
          ) : (
            campaignsState.map(campaign => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onEdit={(e) => { e?.stopPropagation(); /* Handle Edit */ }}
                onDelete={(e) => { e?.stopPropagation(); /* Handle Delete */ }}
                onOpenExpenses={(e) => { e?.stopPropagation(); /* Handle Expenses */ }}
                onClick={() => { window.location.href = `/plugins/biz-ops/campaigns/${campaign.id}` }}
              />
            ))
          )}
        </div>
      </div>

      {showPayments && (
        <ContractPaymentsModal 
          contractId={contract.id} 
          contractTitle={contract.title} 
          onClose={() => {
            // Ideally refetch contract collected value here. 
            // For now, reload window on close to be safe.
            window.location.reload(); 
          }} 
        />
      )}
      
      {showCreateCampaign && (
        <CampaignFormModal
          contracts={[{ id: contract.id, title: contract.title }]}
          initial={{ contract_id: contract.id } as any}
          onSubmit={async (data) => {
            const res = await fetch('/api/v1/biz-ops/campaigns', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });
            const created = await res.json();
            if (created.success) {
              setCampaignsState([created.data, ...campaignsState]);
              setShowCreateCampaign(false);
            }
          }}
          onClose={() => setShowCreateCampaign(false)}
        />
      )}
    </div>
  );
}
