'use client';

// =============================================================
// izhubs ERP — TasksClient
// Client-side interactive layer for the Tasks page.
// Groups tasks by: Today / This Week / Overdue / All.
// =============================================================

import React, { useState, useTransition } from 'react';
import { apiFetch } from '@/lib/apiFetch';
import type { Activity } from '@/core/engine/activities';
import { IzBadge, type IzBadgeVariant } from '@/components/ui/IzBadge';
import { formatDateTime } from '@/lib/userTime';
import EmptyState from '@/components/shared/EmptyState';
import SidePanel from '@/components/shared/SidePanel';
import { IzButton } from '@/components/ui/IzButton';
import { IzCheckbox } from '@/components/ui/IzCheckbox';

interface TasksClientProps {
  initialToday: Activity[];
  initialThisWeek: Activity[];
  initialOverdue: Activity[];
}

const TYPE_LABELS: Record<Activity['type'], string> = {
  task:    'Task',
  call:    'Cuộc gọi',
  email:   'Email',
  meeting: 'Họp',
  note:    'Ghi chú',
};

const TYPE_VARIANT: Record<Activity['type'], IzBadgeVariant> = {
  task:    'default',
  call:    'secondary',
  email:   'outline',
  meeting: 'success',
  note:    'outline',
};

const PRIORITY_VARIANT: Record<string, IzBadgeVariant> = {
  high:   'destructive',
  medium: 'warning',
  low:    'outline',
};

function TaskRow({
  task,
  onComplete,
  onClick,
}: {
  task: Activity;
  onComplete: (id: string) => void;
  onClick: (task: Activity) => void;
}) {
  const [pending, startTransition] = useTransition();

  const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.target.checked) {
      startTransition(() => onComplete(task.id));
    }
  };

  return (
    <tr
      style={{ opacity: task.completed ? 0.45 : 1, cursor: 'pointer' }}
      onClick={() => onClick(task)}
    >
      <td style={{ width: 36 }}>
        <IzCheckbox
          checked={task.completed}
          onChange={handleCheck}
          disabled={pending}
          onClick={(e) => e.stopPropagation()}
        />
      </td>
      <td style={{ fontWeight: 500 }}>{task.title}</td>
      <td><IzBadge variant={TYPE_VARIANT[task.type]}>{TYPE_LABELS[task.type]}</IzBadge></td>
      <td>
        {task.deal_title && (
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            📋 {task.deal_title}
          </span>
        )}
        {task.contact_name && (
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            👤 {task.contact_name}
          </span>
        )}
      </td>
      <td>
        {task.due_date && (
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            {new Date(task.due_date).toLocaleDateString('vi-VN')}
          </span>
        )}
      </td>
      <td>
        {task.priority && (
          <IzBadge variant={PRIORITY_VARIANT[task.priority]}>
            {task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'TB' : 'Thấp'}
          </IzBadge>
        )}
      </td>
    </tr>
  );
}

function TaskGroup({
  label,
  tasks,
  emptyMsg,
  onComplete,
  onSelect,
  highlightColor,
}: {
  label: string;
  tasks: Activity[];
  emptyMsg: string;
  onComplete: (id: string) => void;
  onSelect: (task: Activity) => void;
  highlightColor?: string;
}) {
  return (
    <section style={{ marginBottom: 'var(--space-6)' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
        marginBottom: 'var(--space-3)',
        paddingBottom: 'var(--space-2)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: highlightColor ?? 'var(--color-text)' }}>
          {label}
        </h3>
        <span className="badge">{tasks.length}</span>
      </div>

      {tasks.length === 0 ? (
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-subtle)', padding: 'var(--space-4) 0' }}>
          {emptyMsg}
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 36 }} />
                <th>Tiêu đề</th>
                <th>Loại</th>
                <th>Liên kết</th>
                <th>Ngày hết hạn</th>
                <th>Ưu tiên</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <TaskRow key={t.id} task={t} onComplete={onComplete} onClick={onSelect} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function TasksClient({ initialToday, initialThisWeek, initialOverdue }: TasksClientProps) {
  const [today, setToday] = useState(initialToday);
  const [thisWeek, setThisWeek] = useState(initialThisWeek);
  const [overdue, setOverdue] = useState(initialOverdue);
  const [selected, setSelected] = useState<Activity | null>(null);

  const total = today.length + thisWeek.length + overdue.length;

  const markComplete = (id: string) => {
    const mark = (list: Activity[]) =>
      list.map((t) => (t.id === id ? { ...t, completed: true } : t));
    setToday(mark);
    setThisWeek(mark);
    setOverdue(mark);
    // Fire-and-forget API call
    fetch(`/api/v1/activities/${id}/complete`, { method: 'PATCH' }).catch(console.error);
  };

  if (total === 0) {
    return (
      <EmptyState
        title="Không có công việc nào"
        description="Tạo task mới hoặc chờ automation từ deals để thấy công việc ở đây."
      />
    );
  }

  return (
    <>
      <TaskGroup
        label="🔴 Quá hạn"
        tasks={overdue}
        emptyMsg="Không có task quá hạn"
        onComplete={markComplete}
        onSelect={setSelected}
        highlightColor="var(--color-danger)"
      />
      <TaskGroup
        label="📅 Hôm nay"
        tasks={today}
        emptyMsg="Không có task hôm nay"
        onComplete={markComplete}
        onSelect={setSelected}
      />
      <TaskGroup
        label="📆 Tuần này"
        tasks={thisWeek}
        emptyMsg="Không có task tuần này"
        onComplete={markComplete}
        onSelect={setSelected}
      />

      {/* Task detail side panel */}
      <SidePanel
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.title}
        footer={
          selected && !selected.completed ? (
            <IzButton
              variant="default"
              onClick={() => {
                markComplete(selected.id);
                setSelected(null);
              }}
            >
              ✓ Đánh dấu hoàn thành
            </IzButton>
          ) : undefined
        }
      >
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 4 }}>Loại</div>
              <IzBadge variant={TYPE_VARIANT[selected.type]}>{TYPE_LABELS[selected.type]}</IzBadge>
            </div>
            {selected.description && (
              <div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 4 }}>Mô tả</div>
                <p style={{ fontSize: 'var(--font-size-sm)' }}>{selected.description}</p>
              </div>
            )}
            {selected.due_date && (
              <div>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 4 }}>Deadline</p>
                <p style={{ fontSize: 'var(--font-size-sm)' }}>{formatDateTime(selected.due_date)}</p>
              </div>
            )}
            {selected.deal_title && (
              <div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 4 }}>Deal liên kết</div>
                <p style={{ fontSize: 'var(--font-size-sm)' }}>📋 {selected.deal_title}</p>
              </div>
            )}
            {selected.contact_name && (
              <div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 4 }}>Contact liên kết</div>
                <p style={{ fontSize: 'var(--font-size-sm)' }}>👤 {selected.contact_name}</p>
              </div>
            )}
            {selected.assigned_name && (
              <div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 4 }}>Người phụ trách</div>
                <p style={{ fontSize: 'var(--font-size-sm)' }}>{selected.assigned_name}</p>
              </div>
            )}
          </div>
        )}
      </SidePanel>
    </>
  );
}
