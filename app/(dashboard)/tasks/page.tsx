// =============================================================
// izhubs ERP — /tasks page (Server Component entry)
// Fetches initial task groups: Today, This Week, Overdue.
// Passes to TasksClient for interactive filter/complete.
// =============================================================

import { listActivities } from '@/core/engine/activities';
import { PageHeader } from '@/components/shared';
import TasksClient from '@/components/shared/TasksClient';

export const metadata = { title: 'Công việc — izhubs ERP' };

export default async function TasksPage() {
  const [{ data: today }, { data: thisWeek }, { data: overdue }] = await Promise.all([
    listActivities({ completed: false, dueToday: true }),
    listActivities({ completed: false, dueThisWeek: true }),
    listActivities({ completed: false, overdue: true, limit: 20 }),
  ]);

  return (
    <div className="page">
      <PageHeader
        title="Công việc"
        subtitle="Tất cả tasks, cuộc gọi, và follow-up của bạn"
        actions={
          <button className="btn btn-primary" id="create-task-btn">
            + Tạo công việc
          </button>
        }
      />
      <TasksClient
        initialToday={today}
        initialThisWeek={thisWeek}
        initialOverdue={overdue}
      />
    </div>
  );
}
