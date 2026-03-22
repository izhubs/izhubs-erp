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

interface TrackingData {
  facebookPixelId: string | null;
  googleAnalyticsId: string | null;
  customHeadScripts: string | null;
}

interface Props {
  project: ProjectData;
  tracking: TrackingData | null;
}

const STATUS_OPTIONS: { value: Status; label: string; emoji: string }[] = [
  { value: 'draft', label: 'Draft', emoji: '📝' },
  { value: 'published', label: 'Published', emoji: '🌐' },
  { value: 'archived', label: 'Archived', emoji: '📦' },
];

export default function EditProjectForm({ project, tracking }: Props) {
  const router = useRouter();

  // Basic info
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || '');
  const [status, setStatus] = useState<Status>(project.status);
  const [activeDomain, setActiveDomain] = useState(project.activeDomain || '');

  // Tracking
  const [fbPixelId, setFbPixelId] = useState(tracking?.facebookPixelId || '');
  const [gaId, setGaId] = useState(tracking?.googleAnalyticsId || '');
  const [customScripts, setCustomScripts] = useState(tracking?.customHeadScripts || '');

  // State
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
      // Save project info
      const res1 = await fetch(`/api/v1/plugins/izlanding/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          status,
          activeDomain: activeDomain.trim() || null,
        }),
      });
      const json1 = await res1.json();
      if (!res1.ok) throw new Error(json1?.error?.message || 'Failed to save project');

      // Save tracking
      const res2 = await fetch(`/api/v1/plugins/izlanding/projects/${project.id}/tracking`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facebookPixelId: fbPixelId.trim() || null,
          googleAnalyticsId: gaId.trim() || null,
          customHeadScripts: customScripts.trim() || null,
        }),
      });
      if (!res2.ok) {
        const json2 = await res2.json();
        throw new Error(json2?.error?.message || 'Failed to save tracking');
      }

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
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <IzButton variant="outline" onClick={() => window.open(`/p/${project.activeDomain || project.id}`, '_blank')}>
            👀 Xem trang
          </IzButton>
          <IzButton variant="outline" onClick={() => router.push('/plugins/izlanding')}>
            ← Quay lại
          </IzButton>
        </div>
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

      {/* Domain */}
      <IzCard className={styles.card}>
        <IzCardContent>
          <div className={styles.sectionTitle}>🌐 Custom Domain</div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Domain tùy chỉnh</label>
            <IzInput
              value={activeDomain}
              onChange={e => setActiveDomain(e.target.value)}
              placeholder={`landing.${process.env.NEXT_PUBLIC_LANDING_DOMAIN || 'izhubs.com'}`}
            />
            <span className={styles.hint}>
              Trỏ CNAME tới <code>{process.env.NEXT_PUBLIC_LANDING_CNAME || `pages.${process.env.NEXT_PUBLIC_LANDING_DOMAIN || 'izhubs.com'}`}</code> rồi nhập domain vào đây.
            </span>
          </div>
          <div className={styles.defaultDomain}>
            <span className={styles.label}>Default URL:</span>
            <code className={styles.domainCode}>
              {project.id.slice(0, 8)}.{process.env.NEXT_PUBLIC_LANDING_DOMAIN || 'izhubs.com'}
            </code>
          </div>
        </IzCardContent>
      </IzCard>

      {/* Tracking Scripts */}
      <IzCard className={styles.card}>
        <IzCardContent>
          <div className={styles.sectionTitle}>📊 Tracking & Analytics</div>

          <div className={styles.trackingGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Facebook Pixel ID</label>
              <IzInput
                value={fbPixelId}
                onChange={e => setFbPixelId(e.target.value)}
                placeholder="123456789012345"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Google Analytics ID</label>
              <IzInput
                value={gaId}
                onChange={e => setGaId(e.target.value)}
                placeholder="G-XXXXXXXXXX"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Custom Head Scripts</label>
            <textarea
              className={styles.codeTextarea}
              value={customScripts}
              onChange={e => setCustomScripts(e.target.value)}
              placeholder={'<!-- Paste tracking scripts here -->\n<script>...</script>'}
              rows={5}
            />
            <span className={styles.hint}>
              Scripts sẽ được inject vào <code>&lt;head&gt;</code> của landing page.
            </span>
          </div>
        </IzCardContent>
      </IzCard>

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
