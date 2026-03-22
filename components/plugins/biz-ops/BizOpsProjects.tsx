'use client';

import { useState, useCallback } from 'react';
import { IzButton } from '@/components/ui/IzButton';
import { ContractCard } from './ContractCard';
import { CampaignCard } from './CampaignCard';
import { ContractFormModal } from './ContractFormModal';
import { CampaignFormModal } from './CampaignFormModal';
import { CampaignExpensesModal } from './CampaignExpensesModal';
import { ContractPaymentsModal } from './ContractPaymentsModal';
import styles from './BizOpsProjects.module.scss';

// ── Types ───────────────────────────────────────────────────

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
  payment_terms: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
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
  created_at: string;
  updated_at: string;
}

interface Props {
  initialContracts: ContractData[];
  initialCampaigns: CampaignData[];
}

type Tab = 'contracts' | 'projects';
type ModalState =
  | null
  | { type: 'create-contract' }
  | { type: 'edit-contract'; data: ContractData }
  | { type: 'create-campaign' }
  | { type: 'edit-campaign'; data: CampaignData }
  | { type: 'expenses'; data: CampaignData }
  | { type: 'payments'; data: ContractData };

// ── API helpers ─────────────────────────────────────────────

async function apiCall(url: string, method: string, body?: object) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const text = await res.text();
  if (!text) throw new Error(`Server returned empty response (${res.status})`);

  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Server error (${res.status}): ${text.slice(0, 200)}`);
  }

  if (!json.success) {
    throw new Error(json.error?.message || json.message || json.error || 'API error');
  }
  return json.data;
}

// ── Component ───────────────────────────────────────────────

export function BizOpsProjectsClient({ initialContracts, initialCampaigns }: Props) {
  const [contracts, setContracts] = useState<ContractData[]>(initialContracts);
  const [campaigns, setCampaigns] = useState<CampaignData[]>(initialCampaigns);
  const [tab, setTab] = useState<Tab>('contracts');
  const [modal, setModal] = useState<ModalState>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // ── Stats ─────────────────────────────────────────────────

  const totalValue = contracts.reduce((s, c) => s + c.total_value, 0);
  const totalCollected = contracts.reduce((s, c) => s + c.collected_value, 0);
  const activeContracts = contracts.filter(c => c.status === 'in_progress' || c.status === 'signed').length;

  // ── Filters ───────────────────────────────────────────────

  const filteredContracts = contracts.filter(c =>
    statusFilter === 'all' || c.status === statusFilter
  );

  const filteredCampaigns = campaigns.filter(c =>
    typeFilter === 'all' || c.type === typeFilter
  );

  // ── CRUD: Contracts ───────────────────────────────────────

  const handleCreateContract = useCallback(async (data: any) => {
    const created = await apiCall('/api/v1/biz-ops/contracts', 'POST', data);
    setContracts(prev => [created, ...prev]);
  }, []);

  const handleUpdateContract = useCallback(async (data: any) => {
    const updated = await apiCall(`/api/v1/biz-ops/contracts/${data.id}`, 'PATCH', data);
    setContracts(prev => prev.map(c => c.id === updated.id ? updated : c));
  }, []);

  const handleDeleteContract = useCallback(async (id: string) => {
    if (!confirm('Delete this contract? All campaigns under it will also be removed.')) return;
    await apiCall(`/api/v1/biz-ops/contracts/${id}`, 'DELETE');
    setContracts(prev => prev.filter(c => c.id !== id));
    setCampaigns(prev => prev.filter(c => c.contract_id !== id));
  }, []);

  // ── CRUD: Campaigns ───────────────────────────────────────

  const handleCreateCampaign = useCallback(async (data: any) => {
    const created = await apiCall('/api/v1/biz-ops/campaigns', 'POST', data);
    setCampaigns(prev => [created, ...prev]);
  }, []);

  const handleUpdateCampaign = useCallback(async (data: any) => {
    const updated = await apiCall(`/api/v1/biz-ops/campaigns/${data.id}`, 'PATCH', data);
    setCampaigns(prev => prev.map(c => c.id === updated.id ? updated : c));
  }, []);

  const handleDeleteCampaign = useCallback(async (id: string) => {
    if (!confirm('Delete this project?')) return;
    await apiCall(`/api/v1/biz-ops/campaigns/${id}`, 'DELETE');
    setCampaigns(prev => prev.filter(c => c.id !== id));
  }, []);

  // ── Campaign count per contract ───────────────────────────

  const getCampaignCount = (contractId: string) =>
    campaigns.filter(c => c.contract_id === contractId).length;

  const getContractTitle = (contractId: string) =>
    contracts.find(c => c.id === contractId)?.title ?? '';

  // ── Render ────────────────────────────────────────────────

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>💼 Projects</h1>
          <p>{contracts.length} contract{contracts.length !== 1 ? 's' : ''} · {campaigns.length} project{campaigns.length !== 1 ? 's' : ''}</p>
        </div>
        <div className={styles.headerActions}>
          <IzButton variant="ghost" onClick={() => setModal({ type: 'create-contract' })} id="bizops-add-contract">
            + Contract
          </IzButton>
          <IzButton onClick={() => setModal({ type: 'create-campaign' })} id="bizops-add-project">
            + Project
          </IzButton>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total Value</p>
          <p className={styles.statValue}>{(totalValue / 1_000_000).toFixed(1)}M</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Collected</p>
          <p className={styles.statValue}>{(totalCollected / 1_000_000).toFixed(1)}M</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Active Contracts</p>
          <p className={styles.statValue}>{activeContracts}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Projects</p>
          <p className={styles.statValue}>{campaigns.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === 'contracts' ? styles.tabActive : ''}`}
          onClick={() => setTab('contracts')}
        >
          📋 Contracts ({contracts.length})
        </button>
        <button
          className={`${styles.tab} ${tab === 'projects' ? styles.tabActive : ''}`}
          onClick={() => setTab('projects')}
        >
          🚀 Projects ({campaigns.length})
        </button>
      </div>

      {/* Contracts Tab */}
      {tab === 'contracts' && (
        <>
          <div className={styles.filters}>
            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="signed">Signed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {filteredContracts.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>📋</div>
              <h3>No contracts yet</h3>
              <p>Create your first contract to start tracking projects and revenue.</p>
              <IzButton onClick={() => setModal({ type: 'create-contract' })}>
                Create Contract
              </IzButton>
            </div>
          ) : (
            <div className={styles.grid}>
              {filteredContracts.map(contract => (
                <ContractCard
                  key={contract.id}
                  contract={contract}
                  campaignCount={getCampaignCount(contract.id)}
                  onEdit={() => setModal({ type: 'edit-contract', data: contract })}
                  onDelete={() => handleDeleteContract(contract.id)}
                  onOpenPayments={() => setModal({ type: 'payments', data: contract })}
                  onClick={() => { window.location.href = `/plugins/biz-ops/contracts/${contract.id}` }}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Projects Tab */}
      {tab === 'projects' && (
        <>
          <div className={styles.filters}>
            <select
              className={styles.filterSelect}
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="seo">SEO</option>
              <option value="ads">Ads</option>
              <option value="social">Social</option>
              <option value="web">Web</option>
              <option value="construction">Construction</option>
              <option value="general">General</option>
            </select>
          </div>

          {filteredCampaigns.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🚀</div>
              <h3>No projects yet</h3>
              <p>Create a project under a contract to start tracking work and budget.</p>
              <IzButton onClick={() => setModal({ type: 'create-campaign' })}>
                Create Project
              </IzButton>
            </div>
          ) : (
            <div className={styles.grid}>
              {filteredCampaigns.map(campaign => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  contractTitle={getContractTitle(campaign.contract_id)}
                  onEdit={(e) => { e?.stopPropagation(); setModal({ type: 'edit-campaign', data: campaign }) }}
                  onDelete={(e) => { e?.stopPropagation(); handleDeleteCampaign(campaign.id) }}
                  onOpenExpenses={(e) => { e?.stopPropagation(); setModal({ type: 'expenses', data: campaign }) }}
                  onClick={() => { window.location.href = `/plugins/biz-ops/campaigns/${campaign.id}` }}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {modal?.type === 'create-contract' && (
        <ContractFormModal onSubmit={handleCreateContract} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'edit-contract' && (
        <ContractFormModal
          initial={{
            id: modal.data.id,
            title: modal.data.title,
            code: modal.data.code ?? '',
            total_value: modal.data.total_value,
            currency: modal.data.currency,
            status: modal.data.status,
            start_date: modal.data.start_date?.split('T')[0] ?? '',
            end_date: modal.data.end_date?.split('T')[0] ?? '',
            payment_terms: modal.data.payment_terms ?? '',
            notes: modal.data.notes ?? '',
          }}
          onSubmit={handleUpdateContract}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'create-campaign' && (
        <CampaignFormModal
          contracts={contracts.map(c => ({ id: c.id, title: c.title }))}
          onSubmit={handleCreateCampaign}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'edit-campaign' && (
        <CampaignFormModal
          contracts={contracts.map(c => ({ id: c.id, title: c.title }))}
          initial={{
            id: modal.data.id,
            contract_id: modal.data.contract_id,
            name: modal.data.name,
            type: modal.data.type,
            allocated_budget: modal.data.allocated_budget,
            stage: modal.data.stage,
            health: modal.data.health,
            start_date: modal.data.start_date?.split('T')[0] ?? '',
            end_date: modal.data.end_date?.split('T')[0] ?? '',
          }}
          onSubmit={handleUpdateCampaign}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'expenses' && (
        <CampaignExpensesModal
          campaignId={modal.data.id}
          campaignName={modal.data.name}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'payments' && (
        <ContractPaymentsModal
          contractId={modal.data.id}
          contractTitle={modal.data.title}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
