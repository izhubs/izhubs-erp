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
      {/* Glassmorphic Header */}
      <div className={styles.workspaceHeader}>
        <div className={styles.headerTopRow}>
          <div className={styles.titleArea}>
            <h1>{campaign.name}</h1>
            <IzBadge variant="info">{campaign.stage}</IzBadge>
            <div className={styles.budgetInfo}>
              <span>Budget: {(campaign.actual_cogs / 1_000_000).toFixed(1)}M / {(campaign.allocated_budget / 1_000_000).toFixed(1)}M</span>
            </div>
          </div>
          
          <div className={styles.teamArea}>
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
            <button className={`${styles.assignButton} iz-button iz-button-sm`} style={{ borderRadius: '24px' }}>
              + Assign
            </button>
          </div>
        </div>
        
        {/* Navigation Tabs (borrowed style from BizOpsProjects but customized) */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <button onClick={() => setTab('tasks')} style={{ background: 'none', border: 'none', color: tab === 'tasks' ? '#89acff' : '#adaaaa', fontWeight: tab==='tasks'?600:400, borderBottom: tab==='tasks'?'2px solid #89acff':'2px solid transparent', paddingBottom: '4px', cursor: 'pointer' }}>Tasks</button>
          <button onClick={() => setTab('files')} style={{ background: 'none', border: 'none', color: tab === 'files' ? '#89acff' : '#adaaaa', fontWeight: tab==='files'?600:400, borderBottom: tab==='files'?'2px solid #89acff':'2px solid transparent', paddingBottom: '4px', cursor: 'pointer' }}>Files</button>
          <button onClick={() => setTab('finances')} style={{ background: 'none', border: 'none', color: tab === 'finances' ? '#89acff' : '#adaaaa', fontWeight: tab==='finances'?600:400, borderBottom: tab==='finances'?'2px solid #89acff':'2px solid transparent', paddingBottom: '4px', cursor: 'pointer' }}>Finances</button>
          <button onClick={() => setTab('settings')} style={{ background: 'none', border: 'none', color: tab === 'settings' ? '#89acff' : '#adaaaa', fontWeight: tab==='settings'?600:400, borderBottom: tab==='settings'?'2px solid #89acff':'2px solid transparent', paddingBottom: '4px', cursor: 'pointer' }}>Settings</button>
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
          <div style={{ color: '#adaaaa' }}>Finances component coming soon... (Please check Project Expenses)</div>
        )}
      </div>
    </div>
  );
}
