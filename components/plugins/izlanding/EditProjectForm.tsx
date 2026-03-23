'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { IzButton } from '@/components/ui/IzButton';
import { IzInput } from '@/components/ui/IzInput';
import { IzTextarea } from '@/components/ui/IzTextarea';
import { IzSelect } from '@/components/ui/IzSelect';
import { IzCard, IzCardContent } from '@/components/ui/IzCard';
import { BlockEditor } from '@/components/plugins/izlanding/BlockEditor';
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

  // Content & Forms
  const [blocks, setBlocks] = useState<any[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>('');
  const [formTitle, setFormTitle] = useState<string>('');

  // AI Generate
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [iframeKey, setIframeKey] = useState(Date.now());
  const [iframeLoading, setIframeLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Block Editor State
  const [editingBlockIdx, setEditingBlockIdx] = useState<number | null>(null);

  // Sync state to iframe instantly without saving
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'IZLANDING_UPDATE_BLOCKS', blocks }, '*');
    }
  }, [blocks]);

  // State
  const [loading, setLoading] = useState(false);
  const [fetchingContent, setFetchingContent] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Fetch project content and available forms
    Promise.all([
      fetch(`/api/v1/plugins/izlanding/projects/${project.id}/content`).then(res => res.json()),
      fetch('/api/v1/plugins/izform/forms').then(res => res.json())
    ]).then(([contentRes, formsRes]) => {
      if (contentRes.success) {
        setBlocks(contentRes.data.blocks || []);
        const formBlock = contentRes.data.blocks?.find((b: any) => b.type === 'iframe-form');
        if (formBlock?.content?.url) {
          const match = formBlock.content.url.match(/\/forms\/(.+)/);
          if (match) setSelectedFormId(match[1]);
        }
        if (formBlock?.content?.title) {
          setFormTitle(formBlock.content.title);
        }
      }
      if (formsRes.success) setForms(formsRes.data || []);
      setFetchingContent(false);
    }).catch(console.error);
  }, [project.id]);

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/plugins/izlanding/projects/${project.id}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to generate content');
      }
      setBlocks(data.data.blocks || []);
      setIframeLoading(true);
      setIframeKey(Date.now()); // Reload the preview iframe
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Lỗi khi gọi AI');
    } finally {
      setIsGenerating(false);
    }
  };

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

      // Save content if blocks changed
      if (blocks.length > 0) {
        const newBlocks = [...blocks];
        const formBlockIdx = newBlocks.findIndex(b => b.type === 'iframe-form');
        if (formBlockIdx >= 0 && selectedFormId) {
          newBlocks[formBlockIdx].content.url = `/forms/${selectedFormId}`;
          if (formTitle) newBlocks[formBlockIdx].content.title = formTitle.trim();
        }
        await fetch(`/api/v1/plugins/izlanding/projects/${project.id}/content`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ blocks: newBlocks }),
        });
      }

      setSaved(true);
      setIframeLoading(true);
      setIframeKey(Date.now()); // Reload preview
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

  const handleMoveBlock = (index: number, dir: 1 | -1) => {
    const newBlocks = [...blocks];
    if (index + dir < 0 || index + dir >= newBlocks.length) return;
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[index + dir];
    newBlocks[index + dir] = temp;
    setBlocks(newBlocks);
  };

  const handleDeleteBlock = (index: number) => {
    if (!confirm('Xóa khối này?')) return;
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  const handleDuplicateBlock = (index: number) => {
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, JSON.parse(JSON.stringify(newBlocks[index])));
    setBlocks(newBlocks);
  };

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        {/* LEFT COLUMN: Settings */}
        <div className={styles.leftCol}>
          
          <div className={styles.sidebarHeader}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 className={styles.title}>Trình chỉnh sửa</h1>
                <p className={styles.subtitle}>{createdDate}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button 
                  type="button" 
                  onClick={() => router.push('/plugins/izlanding')}
                  style={{ background: 'transparent', border: '1px solid #c2c6d6', borderRadius: '4px', padding: '0.25rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer', color: '#191c1e' }}
                >
                  ←
                </button>
                <button 
                  type="button" 
                  onClick={() => window.open(`/p/${project.activeDomain || project.id}`, '_blank')}
                  style={{ background: 'transparent', border: '1px solid #c2c6d6', borderRadius: '4px', padding: '0.25rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer', color: '#191c1e' }}
                >
                  ↗ Xem
                </button>
              </div>
            </div>
          </div>

          <div className={styles.sidebarContent}>
            
            {/* Cấu trúc Trang (Blocks) */}
            <div className={styles.section}>
              {editingBlockIdx !== null && blocks[editingBlockIdx] ? (
                <BlockEditor 
                  block={blocks[editingBlockIdx]}
                  onChange={(updatedBlock) => {
                    const newBlocks = [...blocks];
                    newBlocks[editingBlockIdx] = updatedBlock;
                    setBlocks(newBlocks);
                  }}
                  onBack={() => setEditingBlockIdx(null)}
                />
              ) : (
                <>
                  <div className={styles.sectionTitle}>Cấu trúc Trang</div>
                  <p className={styles.hint}>
                    Sắp xếp, nhân bản hoặc sửa khối nội dung. Lưu thay đổi để cập nhật giao diện chính.
                  </p>

                  {blocks.length === 0 ? (
                    <div className={styles.emptyBlocks}>Trang chưa có khối nội dung nào.</div>
                  ) : (
                    <div className={styles.blockList}>
                      {blocks.map((block, idx) => (
                        <div key={idx} className={styles.blockItem}>
                          <div className={styles.blockInfo} onClick={() => setEditingBlockIdx(idx)}>
                            <div className={styles.blockDragHandle} onClick={e => e.stopPropagation()}>⋮⋮</div>
                            <div className={styles.blockText}>
                              <div className={styles.blockType}>{block.type.replace('-', ' ')}</div>
                              <div className={styles.blockDesc}>
                                {block.content?.title || block.content?.headline || block.content?.name || block.type}
                              </div>
                            </div>
                          </div>
                          
                          <div className={styles.blockActions}>
                            <button type="button" onClick={() => handleMoveBlock(idx, -1)} disabled={idx === 0} className={styles.blockBtn} title="Lên trên">⬆️</button>
                            <button type="button" onClick={() => handleMoveBlock(idx, 1)} disabled={idx === blocks.length - 1} className={styles.blockBtn} title="Xuống dưới">⬇️</button>
                            <button type="button" onClick={() => handleDuplicateBlock(idx)} className={styles.blockBtn} title="Nhân bản">📋</button>
                            <button type="button" onClick={() => handleDeleteBlock(idx)} className={styles.blockBtn} title="Xóa" style={{ color: '#ba1a1a' }}>🗑</button>
                          </div>
                        </div>
                      ))}
                      
                      <div className={styles.addBlockContainer}>
                        <select className={styles.addBlockSelect} id="add-block-select">
                          <option value="hero">Hero (Mở đầu)</option>
                          <option value="features">Features (Tính năng)</option>
                          <option value="pricing">Pricing (Bảng giá)</option>
                          <option value="testimonials">Testimonials (Khách hàng)</option>
                          <option value="cta-form">CTA Form (Thu thập data)</option>
                          <option value="image-block">Hình ảnh (Chèn Ảnh)</option>
                        </select>
                        <button type="button" className={styles.addBlockBtn} onClick={() => {
                          const el = document.getElementById('add-block-select') as HTMLSelectElement;
                          if (el) {
                            const defaultContent = el.value === 'image-block' 
                              ? { caption: 'Hình ảnh thực tế', imageUrl: '' } 
                              : { title: 'Mục mới', subtitle: 'Chưa có nội dung' };
                            setBlocks([...blocks, { type: el.value, content: defaultContent }]);
                          }
                        }}>
                          + Thêm
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Thông tin cơ bản */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Thông tin cơ bản</div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Tên Landing Page *</label>
                <input
                  className={styles.ghostInput}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="VD: Trang giới thiệu dịch vụ"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Mô tả</label>
                <textarea
                  className={styles.codeArea}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Mô tả ngắn gọn mục đích trang web..."
                  rows={2}
                  style={{ minHeight: '60px', fontFamily: 'Inter' }}
                />
              </div>
            </div>

            {/* AI Generate */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>✨ Vibe Code (AI)</div>
              <div className={styles.formGroup}>
                <textarea
                  className={styles.codeArea}
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  placeholder='VD: "Tạo trang bán khóa học tiếng Anh giao tiếp" - AI sẽ viết lại toàn bộ nội dung.'
                  rows={3}
                  style={{ fontFamily: 'Inter' }}
                />
              </div>
              <button 
                type="button" 
                className={styles.primaryBtn} 
                onClick={handleGenerate} 
                disabled={isGenerating || !aiPrompt.trim()}
                style={{ width: '100%', marginLeft: 0, marginTop: '-0.5rem', background: 'linear-gradient(135deg, #c0c1ff 0%, #862dd4 100%)', color: '#1000a9' }}
              >
                {isGenerating ? 'Đang tạo...' : 'Tạo bằng AI 🪄'}
              </button>
            </div>

            {/* Custom Domain */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>🌐 Tên miền & URL</div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Domain tùy chỉnh</label>
                <input
                  className={styles.ghostInput}
                  value={activeDomain}
                  onChange={e => setActiveDomain(e.target.value)}
                  placeholder={`landing.${process.env.NEXT_PUBLIC_LANDING_DOMAIN || 'izhubs.com'}`}
                />
                <p className={styles.hint} style={{ marginTop: '0.25rem' }}>
                  Trỏ CNAME tới: <strong>{process.env.NEXT_PUBLIC_LANDING_CNAME || `pages.${process.env.NEXT_PUBLIC_LANDING_DOMAIN || 'izhubs.com'}`}</strong>
                </p>
              </div>
              <div style={{ background: '#f2f4f6', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.8125rem' }}>
                <span style={{ color: '#424754' }}>Default URL: </span>
                <strong style={{ color: '#0058be' }}>{project.id.slice(0, 8)}.{process.env.NEXT_PUBLIC_LANDING_DOMAIN || 'izhubs.com'}</strong>
              </div>
            </div>

            {/* Status */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Trạng thái xuất bản</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                {STATUS_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatus(opt.value)}
                    style={{
                      padding: '0.5rem', border: '1px solid', borderRadius: '6px', fontSize: '0.8125rem', cursor: 'pointer',
                      borderColor: status === opt.value ? '#0058be' : '#c2c6d6',
                      background: status === opt.value ? 'rgba(0, 88, 190, 0.05)' : 'transparent',
                      color: status === opt.value ? '#0058be' : '#424754',
                      fontWeight: status === opt.value ? 600 : 400
                    }}
                  >
                    {opt.emoji} {opt.label}
                  </button>
                ))}
              </div>
            </div>

             {/* Tracking Scripts */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>📊 Tracking Analytics</div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className={styles.label}>Facebook Pixel ID</label>
                  <input className={styles.ghostInput} value={fbPixelId} onChange={e => setFbPixelId(e.target.value)} placeholder="VD: 123456789" />
                </div>
                <div style={{ flex: 1 }}>
                  <label className={styles.label}>Google Analytics</label>
                  <input className={styles.ghostInput} value={gaId} onChange={e => setGaId(e.target.value)} placeholder="G-XXXXXXXXXX" />
                </div>
              </div>
              <div>
                <label className={styles.label}>Custom Head Scripts</label>
                <textarea className={styles.codeArea} value={customScripts} onChange={e => setCustomScripts(e.target.value)} placeholder="<script>...</script>" rows={3} />
              </div>
            </div>

            {/* Form Integration */}
            {blocks.some(b => b.type === 'iframe-form') && (
              <div className={styles.section}>
                <div className={styles.sectionTitle}>📝 izForm Link</div>
                <div className={styles.formGroup}>
                  <p className={styles.hint}>Hãy tạo form ở mục izForm và chọn tại đây</p>
                  <IzSelect
                    options={forms.map(f => ({ value: f.id, label: f.name }))}
                    value={selectedFormId ? { value: selectedFormId, label: forms.find(f => f.id === selectedFormId)?.name } : null}
                    onChange={(opt: any) => setSelectedFormId(opt?.value || '')}
                    placeholder="-- Chọn Form có sẵn --"
                  />
                </div>
              </div>
            )}
            
            <div style={{ paddingBottom: '2rem' }}>
              <button type="button" onClick={handleDelete} disabled={deleting} style={{ background: 'transparent', border: 'none', color: '#ba1a1a', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
                Xoá dự án này
              </button>
            </div>
            
          </div>

          <div className={styles.stickyFooter}>
            <div>
              {saved && <span className={styles.success}>✅ Đã lưu</span>}
              {error && <span className={styles.error}>{error}</span>}
            </div>
            <button className={styles.primaryBtn} onClick={handleSave} disabled={loading || !name.trim()}>Lưu Thay Đổi</button>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Preview */}
        <div className={styles.rightCol}>
          <div className={styles.browserFrame}>
            <div className={styles.browserHeader}>
              <div className={styles.browserDot} />
              <div className={styles.browserDot} />
              <div className={styles.browserDot} />
              <div className={styles.browserTitle}>{name || 'Live Preview'}</div>
              <div style={{ flex: 1 }} />
              <button type="button" onClick={() => { setIframeLoading(true); setIframeKey(Date.now()); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
                🔄
              </button>
            </div>
            <div className={styles.browserContent}>
              {iframeLoading && (
                <div className={styles.iframeLoader}>
                   <div className={styles.spinner}></div>
                </div>
              )}
              <iframe 
                ref={iframeRef}
                key={iframeKey}
                src={`/p/${project.id}?preview=true`}
                style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#fff' }}
                title="Live Preview"
                onLoad={() => setIframeLoading(false)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
