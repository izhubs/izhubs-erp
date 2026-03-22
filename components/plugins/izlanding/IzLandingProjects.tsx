'use client';

import { useState } from 'react';
import styles from './IzLandingProjects.module.scss';
import { IzButton } from '@/components/ui/IzButton';
import { ProjectCard } from './ProjectCard';
import { useRouter } from 'next/navigation';

interface ProjectData {
  id: string;
  name: string;
  description: string | null;
  activeDomain: string | null;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
}

interface Props {
  initialProjects: ProjectData[];
}

export function IzLandingProjectsClient({ initialProjects }: Props) {
  const [projects] = useState<ProjectData[]>(initialProjects);
  const router = useRouter();

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>🚀 Landing Pages</h1>
          <p className={styles.subtitle}>
            {projects.length} trang — Tạo landing page siêu tốc bằng AI
          </p>
        </div>
        <IzButton id="izlanding-create-btn" onClick={() => router.push('/plugins/izlanding/create')}>
          + Tạo Landing Page
        </IzButton>
      </div>

      {/* Project Grid */}
      {projects.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🚀</div>
          <h3>Chưa có landing page nào</h3>
          <p>Tạo landing page đầu tiên bằng AI — chỉ cần mô tả, hệ thống sẽ tự sinh trang web cho bạn.</p>
          <IzButton onClick={() => router.push('/plugins/izlanding/create')}>Tạo Landing Page đầu tiên</IzButton>
        </div>
      ) : (
        <div className={styles.grid}>
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
