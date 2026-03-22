'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IzButton } from '@/components/ui/IzButton';
import { IzInput } from '@/components/ui/IzInput';
import { IzTextarea } from '@/components/ui/IzTextarea';
import { IzCard, IzCardContent } from '@/components/ui/IzCard';
import styles from './CreateProject.module.scss';

export default function CreateProjectForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/plugins/izlanding/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message || 'Failed to create project');
      router.push('/plugins/izlanding');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🚀 Tạo Landing Page mới</h1>
      <p className={styles.subtitle}>Đặt tên và mô tả — sau đó bạn sẽ dùng AI để sinh nội dung trang web.</p>

      <IzCard className={styles.card}>
        <IzCardContent>
          <div className={styles.formGroup}>
            <label className={styles.label}>Tên Landing Page *</label>
            <IzInput
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="VD: Trang giới thiệu dịch vụ, Khuyến mãi Tết 2026"
              required
              id="izlanding-project-name"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Mô tả</label>
            <IzTextarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Mô tả ngắn gọn mục đích trang web..."
              rows={3}
              id="izlanding-project-desc"
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <IzButton variant="outline" onClick={() => router.push('/plugins/izlanding')}>
              Cancel
            </IzButton>
            <IzButton
              onClick={handleCreate}
              isLoading={loading}
              disabled={loading || !name.trim()}
              id="izlanding-create-submit"
            >
              Tạo Landing Page
            </IzButton>
          </div>
        </IzCardContent>
      </IzCard>
    </div>
  );
}
