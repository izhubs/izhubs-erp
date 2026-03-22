'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IzButton } from '@/components/ui/IzButton';
import { IzInput } from '@/components/ui/IzInput';
import { IzTextarea } from '@/components/ui/IzTextarea';
import { IzCard, IzCardContent } from '@/components/ui/IzCard';
import styles from './EditProject.module.scss';

type Status = 'draft' | 'published' | 'archived';

interface ProjectData {
  id: string;
  name: string;
  description: string | null;
  activeDomain: string | null;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  project: ProjectData;
}

const STATUS_OPTIONS: { value: Status; label: string; emoji: string }[] = [
  { value: 'draft', label: 'Draft', emoji: '📝' },
  { value: 'published', label: 'Published', emoji: '🌐' },
  { value: 'archived', label: 'Archived', emoji: '📦' },
];

export default function EditProjectForm({ project }: Props) {
  const router = useRouter();
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || '');
  const [status, setStatus] = useState<Status>(project.status);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/v1/plugins/izlanding/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          status,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message || 'Failed to save');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc muốn xóa landing page này? Hành động này không thể hoàn tác.')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/v1/plugins/izlanding/projects/${project.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      router.push('/plugins/izlanding');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
      setDeleting(false);
    }
  };

  const createdDate = new Date(project.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>✏️ Chỉnh sửa Landing Page</h1>
          <p className={styles.subtitle}>Tạo lúc {createdDate}</p>
        </div>
        <IzButton variant="outline" onClick={() => router.push('/plugins/izlanding')}>
          ← Quay lại
        </IzButton>
      </div>

      {/* Basic Info */}
      <IzCard className={styles.card}>
        <IzCardContent>
          <div className={styles.sectionTitle}>Thông tin cơ bản</div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Tên Landing Page *</label>
            <IzInput
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="VD: Trang giới thiệu dịch vụ"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Mô tả</label>
            <IzTextarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Mô tả ngắn gọn mục đích trang web..."
              rows={3}
            />
          </div>
        </IzCardContent>
      </IzCard>

      {/* Status */}
      <IzCard className={styles.card}>
        <IzCardContent>
          <div className={styles.sectionTitle}>Trạng thái</div>
          <div className={styles.statusGroup}>
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`${styles.statusOption} ${status === opt.value ? styles.statusActive : ''}`}
                onClick={() => setStatus(opt.value)}
              >
                <span>{opt.emoji}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </IzCardContent>
      </IzCard>

      {/* Domain Info (read-only for now) */}
      {project.activeDomain && (
        <IzCard className={styles.card}>
          <IzCardContent>
            <div className={styles.sectionTitle}>Domain</div>
            <div className={styles.domainDisplay}>
              🌐 <code>{project.activeDomain}</code>
            </div>
          </IzCardContent>
        </IzCard>
      )}

      {error && <p className={styles.error}>{error}</p>}
      {saved && <p className={styles.success}>✅ Đã lưu thành công!</p>}

      {/* Actions */}
      <div className={styles.actions}>
        <IzButton
          variant="outline"
          onClick={handleDelete}
          isLoading={deleting}
          disabled={deleting}
          style={{ color: 'var(--color-status-error, #ef4444)' }}
        >
          🗑 Xóa
        </IzButton>
        <IzButton
          onClick={handleSave}
          isLoading={loading}
          disabled={loading || !name.trim()}
        >
          Lưu thay đổi
        </IzButton>
      </div>
    </div>
  );
}
