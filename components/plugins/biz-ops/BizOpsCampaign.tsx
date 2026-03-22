'use client';

import { useState, useEffect, useCallback } from 'react';
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
  const [tab, setTab] = useState<Tab>('tasks');
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
    <div className={styles.workspaceContainer}>
      <div className={styles.workspaceSidebar}>
        {/* Project Context */}
        <div style={{ padding: '0 12px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <IzButton variant="ghost" size="sm" onClick={() => window.location.href = `/plugins/biz-ops/contracts/${campaign.contract_id || ''}`} style={{ padding: '4px', height: 'auto', minWidth: 'auto', marginLeft: '-4px' }}>←</IzButton>
            <IzBadge variant="info">{campaign.stage}</IzBadge>
          </div>
          <div className={styles.titleArea}>
            <h1>{campaign.name}</h1>
          </div>
          <div className={styles.budgetInfo}>
            <span>Spent: {(campaign.actual_cogs / 1_000_000).toFixed(1)}M / {(campaign.allocated_budget / 1_000_000).toFixed(1)}M</span>
          </div>
          
          <div className={styles.teamArea} style={{ marginTop: '16px', flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--on-surface-variant)', fontWeight: 600 }}>Team</span>
            <div className={styles.avatarGroup}>
              {members.slice(0, 3).map(m => (
                <IzAvatar key={m.user_id}>
                  {m.user_avatar_url && <IzAvatarImage src={m.user_avatar_url} />}
                  <IzAvatarFallback>{m.user_name.charAt(0).toUpperCase()}</IzAvatarFallback>
                </IzAvatar>
              ))}
              {members.length > 3 && (
                <IzAvatar>
                  <IzAvatarFallback>+{members.length - 3}</IzAvatarFallback>
                </IzAvatar>
              )}
            </div>
            <button className={`${styles.assignButton} iz-button iz-button-sm`} style={{ borderRadius: '24px', width: '100%', marginTop: '4px', background: 'var(--surface-container-highest)', color: 'var(--on-surface)' }}>
              + Assign Member
            </button>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid rgba(72, 72, 71, 0.15)', margin: '0 0 16px 0' }} />

        {/* Local Navigation */}
        <div className={styles.navMenu}>
          <button onClick={() => setTab('tasks')} className={`${styles.navItem} ${tab === 'tasks' ? styles.navItemActive : ''}`}>
            ☑️ Tasks
          </button>
          <button onClick={() => setTab('files')} className={`${styles.navItem} ${tab === 'files' ? styles.navItemActive : ''}`}>
            📁 Files & Assets
          </button>
          <button onClick={() => setTab('finances')} className={`${styles.navItem} ${tab === 'finances' ? styles.navItemActive : ''}`}>
            💸 Finances
          </button>
          <button onClick={() => setTab('settings')} className={`${styles.navItem} ${tab === 'settings' ? styles.navItemActive : ''}`}>
            ⚙️ Settings
          </button>
        </div>
      </div>

      <div className={styles.workspaceMain}>
        <div className={styles.workspaceHeader}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
            {tab === 'tasks' && 'Kanban Board'}
            {tab === 'files' && 'Files & Assets'}
            {tab === 'finances' && 'Finances & Expenses'}
            {tab === 'settings' && 'Project Settings'}
          </h2>
          <div>
            {tab === 'tasks' && <IzButton>+ New Task</IzButton>}
          </div>
        </div>

        <div className={styles.workspaceContent}>
          {tab === 'tasks' && (
            <div className={styles.kanbanWrapper}>
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
    </div>
  );
}
