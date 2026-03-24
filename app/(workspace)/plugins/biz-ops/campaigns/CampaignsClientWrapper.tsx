'use client';

import { useState } from 'react';
import CampaignsKanbanBoard from '@/components/plugins/biz-ops/CampaignsKanbanBoard';
import { CampaignFormModal } from '@/components/plugins/biz-ops/CampaignFormModal';
import { IzButton } from '@/components/ui/IzButton';
import { Settings, FileDown } from 'lucide-react';
import type { Campaign } from '@/modules/biz-ops/engine/campaigns';
import { apiFetch } from '@/lib/apiFetch';

export default function CampaignsClientWrapper({ initialCampaigns, contracts }: { initialCampaigns: Campaign[], contracts: any[] }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Partial<Campaign> | undefined>();

  const openNew = () => {
    setEditingCampaign(undefined);
    setModalOpen(true);
  };

  const openEdit = (c: Campaign) => {
    setEditingCampaign(c);
    setModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    if (data.id) {
      // Edit
      const res = await apiFetch(`/api/v1/biz-ops/campaigns/${data.id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update');
      const updated = await res.json();
      setCampaigns(prev => prev.map(c => c.id === data.id ? updated.data : c));
    } else {
      // Create
      const res = await apiFetch(`/api/v1/biz-ops/campaigns`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create');
      const created = await res.json();
      setCampaigns(prev => [created.data, ...prev]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-header" style={{ flexShrink: 0, padding: '16px 24px 12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 600, margin: 0, letterSpacing: '-0.02em' }}>Biz-Ops Projects</h1>
          <p style={{ color: 'var(--color-text-muted)', margin: '4px 0 0 0', fontSize: '0.875rem' }}>
            Quản trị tiến độ và chi phí các Chiến dịch & Dự án
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <IzButton variant="outline" style={{ padding: '0 12px' }}>
            <FileDown size={16} style={{ marginRight: 8 }} />
            Export Data
          </IzButton>
          <IzButton variant="outline" size="icon" title="Cài đặt Module">
            <Settings size={16} />
          </IzButton>
          <IzButton variant="default" onClick={openNew}>+ New Project</IzButton>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <CampaignsKanbanBoard 
           initialCampaigns={campaigns} 
           onCardClick={openEdit}
           onAddProject={openNew}
        />
      </div>

      {modalOpen && (
        <CampaignFormModal 
          contracts={contracts}
          initial={editingCampaign as any}
          onSubmit={handleSubmit}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
