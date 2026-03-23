'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IzButton } from '@/components/ui/IzButton';
import { IzInput } from '@/components/ui/IzInput';
import { IzTextarea } from '@/components/ui/IzTextarea';
import { IzCard, IzCardContent } from '@/components/ui/IzCard';
import styles from './CreateProject.module.scss';
import { TEMPLATES } from '@/core/engine/izlanding/templates';

export default function CreateProjectForm() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [name, setName] = useState('');
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [templateId, setTemplateId] = useState('blank');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');

  const handleCreate = async () => {
    if (mode === 'ai' && !prompt.trim()) return;
    if (mode === 'manual' && !name.trim()) return;
    
    setLoading(true);
    setError(null);
    let interval: any = null;

    if (mode === 'ai') {
      setProgress(5);
      setProgressText('Đang nạp yêu cầu của bạn...');
      interval = setInterval(() => {
        setProgress(p => {
          if (p < 30) return p + 2;
          if (p < 60) {
            setProgressText('AI đang viết nội dung (Copywriting)...');
            return p + 1;
          }
          if (p < 90) {
            setProgressText('Đang sắp xếp các khối giao diện...');
            return p + 0.5;
          }
          return p;
        });
      }, 200);
    }

    try {
      const bodyPayload = mode === 'ai' 
        ? { prompt: prompt.trim() }
        : { name: name.trim(), templateId };

      const res = await fetch('/api/v1/plugins/izlanding/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.error?.message || 'Thất bại');
      
      if (mode === 'ai') {
        setProgress(100);
        setProgressText('Hoàn tất! Đang chuyển hướng...');
      }
      
      router.push(`/plugins/izlanding/${data.data.id}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    } finally {
      if (interval) clearInterval(interval);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🚀 Tạo Landing Page mới</h1>
      <p className={styles.subtitle}>Chọn giao diện mẫu và thiết lập thông tin cơ bản.</p>

      <div className={styles.modeToggle}>
        <button className={`${styles.modeBtn} ${mode === 'ai' ? styles.active : ''}`} onClick={() => setMode('ai')}>✨ Tạo bằng AI (Vibe Mode)</button>
        <button className={`${styles.modeBtn} ${mode === 'manual' ? styles.active : ''}`} onClick={() => setMode('manual')}>🛠 Tạo Thủ Công</button>
      </div>

      <div className={styles.aiCard}>
          {mode === 'ai' ? (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>Trang web của bạn nói về chủ đề gì? *</label>
                <div className={styles.textareaWrap}>
                  <textarea
                    className={styles.aiTextarea}
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="VD: Tạo trang landing page bán khoá học Tiếng Anh Giao Tiếp siêu tốc cho người đi làm. Phong cách chuyên nghiệp, hiện đại..."
                    rows={4}
                    required
                  />
                </div>
                <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#727785', lineHeight: 1.5 }}>
                  AI của hệ thống sẽ tự động tổng hợp nội dung (Copywriting) và thiết kế thông minh (Architecture Design). Bạn sẽ có thể tinh chỉnh lại sau.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>Tên Landing Page *</label>
                <input
                  className={styles.ghostInput}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Nhập tên chiến dịch..."
                  required
                />
              </div>

              <div className={styles.formGroup} style={{ marginTop: '2.5rem' }}>
                <label className={styles.label}>Chọn Bộ Khung Giao Diện (Blueprint)</label>
                <div className={styles.templateGrid}>
                  {TEMPLATES.map(t => (
                    <div
                      key={t.id}
                      className={`${styles.templateCard} ${templateId === t.id ? styles.selected : ''}`}
                      onClick={() => setTemplateId(t.id)}
                    >
                      <div className={styles.templateIcon}>{t.thumbnail}</div>
                      <div className={styles.templateInfo}>
                        <div className={styles.templateName}>{t.name}</div>
                        <div className={styles.templateDesc}>{t.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {mode === 'ai' && loading && (
            <div style={{ marginTop: '2rem', backgroundColor: '#f7f9fb', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e0e3e5' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '12px', color: '#424754', fontWeight: 600 }}>
                <span>{progressText}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: '#eceef0', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', transition: 'width 0.2s ease-out', borderRadius: '3px' }} />
              </div>
            </div>
          )}

          {error && <p className={styles.error} style={{ marginTop: '1.5rem' }}>{error}</p>}

          <div className={styles.actions}>
            <button type="button" onClick={() => router.push('/plugins/izlanding')} disabled={loading} style={{ background: 'transparent', border: 'none', color: '#424754', fontWeight: 600, padding: '0.75rem 1.5rem', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}>
              Hủy
            </button>
            <button
              className={styles.aiBtn}
              onClick={handleCreate}
              disabled={loading || (mode === 'ai' ? !prompt.trim() : !name.trim())}
            >
              {loading ? 'Đang khởi tạo...' : mode === 'ai' ? 'Bắt đầu tạo bằng AI 🪄' : 'Tạo Trang Mới'}
            </button>
          </div>
      </div>
    </div>
  );
}
