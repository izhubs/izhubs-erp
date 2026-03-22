'use client';

import styles from './IzLandingProjects.module.scss';

interface ProjectData {
  id: string;
  name: string;
  description: string | null;
  activeDomain: string | null;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
}

interface Props {
  project: ProjectData;
}

export function ProjectCard({ project }: Props) {
  const statusLabel = {
    draft: 'Draft',
    published: 'Published',
    archived: 'Archived',
  }[project.status];

  const statusClass = {
    draft: styles.statusDraft,
    published: styles.statusPublished,
    archived: styles.statusArchived,
  }[project.status];

  const dateStr = new Date(project.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className={styles.projectCard} id={`project-card-${project.id}`}>
      <div className={styles.projectCardHeader}>
        <div>
          <h3 className={styles.projectName}>{project.name}</h3>
          {project.description && (
            <p className={styles.projectDesc}>{project.description}</p>
          )}
        </div>
        <span className={statusClass}>{statusLabel}</span>
      </div>

      <div className={styles.projectMeta}>
        {project.activeDomain && (
          <span className={styles.domainText}>🌐 {project.activeDomain}</span>
        )}
        <span>📅 {dateStr}</span>
      </div>
    </div>
  );
}
