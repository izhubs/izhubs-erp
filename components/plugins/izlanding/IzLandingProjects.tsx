'use client';

import { useState } from 'react';
import styles from './IzLandingProjects.module.scss';
import { IzButton } from '@/components/ui/IzButton';
import { 
  IzModal, IzModalContent, IzModalHeader, IzModalTitle, IzModalBody, IzModalFooter 
} from '@/components/ui/IzModal';
import { IzInput } from '@/components/ui/IzInput';
import { ProjectCard } from './ProjectCard';
import { useRouter } from 'next/navigation';

interface ProjectData {
  id: string;
  name: string;
  description: string | null;
  activeDomain: string | null;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  views?: number;
}

interface Props {
  initialProjects: ProjectData[];
  hasApiKey?: boolean;
}

export function IzLandingProjectsClient({ initialProjects, hasApiKey }: Props) {
  const [projects] = useState<ProjectData[]>(initialProjects);
  const router = useRouter();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [geminiKey, setGeminiKey] = useState('');
  const [savingKey, setSavingKey] = useState(false);

  const handleSaveSettings = async () => {
    setSavingKey(true);
    try {
      const res = await fetch('/api/v1/plugins/izlanding/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gemini_api_key: geminiKey }),
      });
      if (!res.ok) throw new Error('Failed to save config');
      setIsSettingsOpen(false);
      router.refresh(); // Refresh page to update hasApiKey prop
    } catch (err) {
      alert('Lỗi khi lưu cấu hình');
    } finally {
      setSavingKey(false);
    }
  };

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
        <div style={{ display: 'flex', gap: '8px' }}>
          <IzButton variant="outline" onClick={() => setIsSettingsOpen(true)}>
            ⚙️ Cài đặt AI {hasApiKey ? '(Đã kết nối)' : '(Chưa có)'}
          </IzButton>
          <IzButton id="izlanding-create-btn" onClick={() => router.push('/plugins/izlanding/create')}>
            + Tạo Landing Page
          </IzButton>
        </div>
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

      {/* Settings Modal */}
      <IzModal
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      >
        <IzModalContent>
          <IzModalHeader>
            <IzModalTitle>Cấu hình AI cho Landing Page</IzModalTitle>
          </IzModalHeader>
          <IzModalBody>
            <p style={{ marginBottom: '1rem', color: '#64748b', fontSize: '14px' }}>
              Thiết lập Gemini API Key cho Workspace. Key này sẽ được sử dụng bởi tất cả các thành viên trong nhóm để sinh nội dung Vibe Code.
            </p>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '14px' }}>
                Gemini API Key
              </label>
              <IzInput
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder={hasApiKey ? '••••••••••••••••' : 'Nhập API Key của bạn...'}
              />
            </div>
          </IzModalBody>
          <IzModalFooter style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <IzButton variant="outline" onClick={() => setIsSettingsOpen(false)}>Thoát</IzButton>
            <IzButton onClick={handleSaveSettings} isLoading={savingKey}>Lưu Cấu Hình</IzButton>
          </IzModalFooter>
        </IzModalContent>
      </IzModal>
    </div>
  );
}
