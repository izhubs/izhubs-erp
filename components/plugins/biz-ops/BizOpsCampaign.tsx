'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { IzButton } from '@/components/ui/IzButton';
import { IzAvatar, IzAvatarFallback, IzAvatarImage } from '@/components/ui/IzAvatar';
import { IzBadge } from '@/components/ui/IzBadge';
import { IzKanbanBoard, IzKanbanColumn, IzKanbanCard } from '@/components/ui/IzKanbanBoard';
import type { Task } from '@/modules/biz-ops/engine/tasks';
import type { ProjectMemberWithUser } from '@/modules/biz-ops/engine/members';
import type { FileRecord } from '@/modules/biz-ops/engine/files';
import styles from './BizOpsCampaign.module.scss';

interface CampaignData {
  id: string;
  contract_id?: string;
  name: string;
  type: string;
  allocated_budget: number;
  actual_cogs: number;
  stage: string;
  health: string;
}

interface Props {
  campaign: CampaignData;
}

type Tab = 'tasks' | 'files' | 'finances' | 'settings';

async function apiCall(url: string, method: string, body?: object) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  if (!text) throw new Error(`Server returned empty response`);
  const json = JSON.parse(text);
  if (!json.success) throw new Error(json.error?.message || 'API error');
  return json.data;
}

export function BizOpsCampaign({ campaign }: Props) {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'tasks';
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<ProjectMemberWithUser[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);
  
  const loadData = useCallback(async () => {
    try {
      const [tData, mData, fData] = await Promise.all([
        apiCall(`/api/v1/biz-ops/campaigns/${campaign.id}/tasks`, 'GET'),
        apiCall(`/api/v1/biz-ops/campaigns/${campaign.id}/members`, 'GET'),
        apiCall(`/api/v1/biz-ops/campaigns/${campaign.id}/files`, 'GET')
      ]);
      setTasks(Array.isArray(tData) ? tData : []);
      setMembers(Array.isArray(mData) ? mData : []);
      setFiles(Array.isArray(fData) ? fData : []);
    } catch (e) {
      console.error(e);
    }
  }, [campaign.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const tasksByStatus = {
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    review: tasks.filter(t => t.status === 'review'),
    done: tasks.filter(t => t.status === 'done'),
  };

  const getPriorityBadge = (p: string) => {
    switch(p) {
      case 'urgent': return <IzBadge variant="destructive">Urgent</IzBadge>;
      case 'high': return <IzBadge variant="warning">High</IzBadge>;
      case 'medium': return <IzBadge variant="info">Medium</IzBadge>;
      default: return <IzBadge variant="default">Low</IzBadge>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-header" style={{ flexShrink: 0, paddingBottom: '16px', borderBottom: '1px solid var(--color-border)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <IzButton variant="ghost" size="sm" onClick={() => window.location.href = `/plugins/biz-ops/contracts/${campaign.contract_id || ''}`} style={{ padding: '0 8px', height: '24px' }}>← Back to Contract</IzButton>
          <IzBadge variant="info">{campaign.stage}</IzBadge>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>{campaign.name}</h1>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '8px' }}>
              Spent: {(campaign.actual_cogs / 1_000_000).toFixed(1)}M / {(campaign.allocated_budget / 1_000_000).toFixed(1)}M
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', marginRight: '8px' }}>
              {members.slice(0, 3).map(m => (
                <IzAvatar key={m.user_id} size="sm" style={{ marginLeft: '-8px', border: '2px solid var(--color-bg-surface)' }}>
                  {m.user_avatar_url && <IzAvatarImage src={m.user_avatar_url} />}
                  <IzAvatarFallback>{m.user_name.charAt(0).toUpperCase()}</IzAvatarFallback>
                </IzAvatar>
              ))}
              {members.length > 3 && (
                <IzAvatar size="sm" style={{ marginLeft: '-8px', border: '2px solid var(--color-bg-surface)' }}>
                  <IzAvatarFallback>+{members.length - 3}</IzAvatarFallback>
                </IzAvatar>
              )}
            </div>
            <IzButton variant="outline" size="sm">+ Assign</IzButton>
            {tab === 'tasks' && <IzButton size="sm">+ New Task</IzButton>}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 32px' }}>
          {tab === 'tasks' && (
            <div style={{ height: '100%' }}>
              <IzKanbanBoard className={styles.taskBoard}>
                <IzKanbanColumn title="To-Do" count={tasksByStatus.todo.length} headerAction={<IzButton variant="ghost" size="sm" style={{color:'#adaaaa'}}>+</IzButton>}>
                  {tasksByStatus.todo.map(t => (
                    <IzKanbanCard 
                      key={t.id} title={t.title} description={t.description} 
                      footerLeft={getPriorityBadge(t.priority)} 
                      footerRight={t.assignee_id ? (
                        <IzAvatar size="sm">
                          <IzAvatarFallback>{(members.find(m => m.user_id === t.assignee_id)?.user_name || 'U').charAt(0).toUpperCase()}</IzAvatarFallback>
                        </IzAvatar>
                      ) : null} 
                    />
                  ))}
                </IzKanbanColumn>
                
                <IzKanbanColumn title="In Progress" count={tasksByStatus.in_progress.length}>
                  {tasksByStatus.in_progress.map(t => (
                    <IzKanbanCard 
                      key={t.id} title={t.title} description={t.description} 
                      footerLeft={getPriorityBadge(t.priority)} 
                      footerRight={t.assignee_id ? (
                        <IzAvatar size="sm">
                          <IzAvatarFallback>{(members.find(m => m.user_id === t.assignee_id)?.user_name || 'U').charAt(0).toUpperCase()}</IzAvatarFallback>
                        </IzAvatar>
                      ) : null} 
                    />
                  ))}
                </IzKanbanColumn>
                
                <IzKanbanColumn title="In Review" count={tasksByStatus.review.length}>
                  {tasksByStatus.review.map(t => (
                    <IzKanbanCard 
                      key={t.id} title={t.title} description={t.description} 
                      footerLeft={getPriorityBadge(t.priority)} 
                      footerRight={t.assignee_id ? (
                        <IzAvatar size="sm">
                          <IzAvatarFallback>{(members.find(m => m.user_id === t.assignee_id)?.user_name || 'U').charAt(0).toUpperCase()}</IzAvatarFallback>
                        </IzAvatar>
                      ) : null} 
                    />
                  ))}
                </IzKanbanColumn>
                
                <IzKanbanColumn title="Done" count={tasksByStatus.done.length}>
                  {tasksByStatus.done.map(t => (
                    <IzKanbanCard 
                      key={t.id} title={t.title} description={t.description} 
                      footerLeft={getPriorityBadge(t.priority)} 
                      footerRight={t.assignee_id ? (
                        <IzAvatar size="sm">
                          <IzAvatarFallback>{(members.find(m => m.user_id === t.assignee_id)?.user_name || 'U').charAt(0).toUpperCase()}</IzAvatarFallback>
                        </IzAvatar>
                      ) : null} 
                    />
                  ))}
                </IzKanbanColumn>
              </IzKanbanBoard>
            </div>
          )}
          
          {tab === 'files' && (
            <div style={{ color: '#adaaaa' }}>Files component coming soon...</div>
          )}
          
          {tab === 'finances' && (
            <div style={{ color: '#adaaaa', padding: '0 32px' }}>Finances component coming soon... (Please check Project Expenses)</div>
          )}
        </div>
    </div>
  );
}
