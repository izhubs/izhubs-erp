'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { IzButton } from '@/components/ui/IzButton';
import { IzInput } from '@/components/ui/IzInput';
import { IzTextarea } from '@/components/ui/IzTextarea';
import { IzSelect } from '@/components/ui/IzSelect';
import { IzSwitch } from '@/components/ui/IzSwitch';
import { IzCard, IzCardContent } from '@/components/ui/IzCard';
import { BlockEditor } from '@/components/plugins/izlanding/BlockEditor';
import { Monitor, Tablet, Smartphone, RotateCw, Eye, EyeOff } from 'lucide-react';
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
  views?: number;
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
  const [blocks, _setBlocks] = useState<any[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [blockTemplates, setBlockTemplates] = useState<any[]>([]);
  
  // Undo/Redo History
  const [history, setHistory] = useState<any[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // AI Critique State
  const [critiqueHtml, setCritiqueHtml] = useState<string | null>(null);
  const [isCritiquing, setIsCritiquing] = useState(false);
  
  // Clone Web State (Task 82)
  const [cloneUrl, setCloneUrl] = useState('');
  const [isCloning, setIsCloning] = useState(false);

  const setBlocks = (newBlocks: any[]) => {
    if (JSON.stringify(newBlocks) === JSON.stringify(blocks)) return;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newBlocks);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    _setBlocks(newBlocks);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      _setBlocks(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      _setBlocks(history[historyIndex + 1]);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history, historyIndex]);

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(blocks, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `izlanding_${project.id}.json`);
    dlAnchorElem.click();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        if (Array.isArray(json)) setBlocks(json);
        else if (json.blocks && Array.isArray(json.blocks)) setBlocks(json.blocks);
        else alert('File JSON không đúng định dạng chứa mảng Blocks.');
      } catch (err) {
        alert('Lỗi đọc file JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // UI Tabs
  const [activeTab, setActiveTab] = useState<'blocks' | 'settings'>('blocks');

  // SEO Settings
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [allowIndexing, setAllowIndexing] = useState(true);

  // AI Generate
  const [iframeKey, setIframeKey] = useState(Date.now());
  const [iframeLoading, setIframeLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isEditorHidden, setIsEditorHidden] = useState(false);
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
      fetch('/api/v1/plugins/izform/forms').then(res => res.json()),
      fetch('/api/v1/plugins/izlanding/blocks').then(res => res.json())
    ]).then(([contentRes, formsRes, blocksRes]) => {
      if (contentRes.success) {
        const fetchedBlocks = contentRes.data.blocks || [];
        _setBlocks(fetchedBlocks);
        setHistory([fetchedBlocks]);
        setHistoryIndex(0);
        if (contentRes.data.seoSettings) {
           setSeoTitle(contentRes.data.seoSettings.seoTitle || '');
           setSeoDescription(contentRes.data.seoSettings.seoDescription || '');
           setAllowIndexing(contentRes.data.seoSettings.allowIndexing ?? true);
        }
      }
      if (formsRes.success) setForms(formsRes.data || []);
      if (blocksRes.success) setBlockTemplates(blocksRes.data || []);
      setFetchingContent(false);
    }).catch(console.error);
  }, [project.id]);

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

      // Save content if blocks Changed or SEO settings updated
      const newBlocks = [...blocks];
      await fetch(`/api/v1/plugins/izlanding/projects/${project.id}/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          blocks: newBlocks,
          seoSettings: {
            seoTitle: seoTitle.trim(),
            seoDescription: seoDescription.trim(),
            allowIndexing
          }
        }),
      });

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

  const handleSaveBlock = async (index: number) => {
    const block = blocks[index];
    const name = window.prompt('Nhập tên cho Block mẫu này (VD: Hero Chiến Dịch Tết):');
    if (!name?.trim()) return;
    try {
      const res = await fetch('/api/v1/plugins/izlanding/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          category: 'custom',
          type: block.type,
          content: block.content,
        })
      });
      const data = await res.json();
      if (data.success) {
        setBlockTemplates([data.data, ...blockTemplates]);
        alert('Lưu Block mẫu thành công! Bạn có thể dùng lại nó ở dưới cùng.');
      } else {
        throw new Error(data.error?.message || 'Failed to save');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi lưu block');
    }
  };

  const handleGetCritique = async () => {
    setIsCritiquing(true);
    setCritiqueHtml(null);
    try {
      const res = await fetch(`/api/v1/plugins/izlanding/projects/${project.id}/critique`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        // Convert Markdown to super basic HTML using naive regex for lines
        const html = data.data.critique
          .replace(/### (.*)/g, '<h3 style="font-size: 16px; font-weight: 700; margin-top: 1rem;">$1</h3>')
          .replace(/## (.*)/g, '<h2 style="font-size: 18px; font-weight: 800; margin-top: 1.5rem; margin-bottom: 0.5rem;">$1</h2>')
          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
          .replace(/\n/g, '<br/>');
        setCritiqueHtml(html);
      } else {
        alert('Lỗi: ' + data.error?.message);
      }
    } catch (e) {
      alert('Network Error');
    }
    setIsCritiquing(false);
  };

  const handleCloneWebsite = async () => {
    if (!cloneUrl) return;
    setIsCloning(true);
    try {
      const res = await fetch(`/api/v1/plugins/izlanding/projects/${project.id}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cloneUrl })
      });
      const data = await res.json();
      if (data.success && data.data.blocks) {
        setBlocks([...blocks, ...data.data.blocks]);
        setCloneUrl('');
        alert('Clone thành công! Các khối tự động được nối thêm vào trang.');
        setActiveTab('blocks');
      } else {
        alert('Clone thất bại: ' + (data.error?.message || data.message));
      }
    } catch (e) {
      alert('Lỗi kết nối khi Clone nội dung.');
    }
    setIsCloning(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        {/* LEFT COLUMN: Settings */}
        <div className={styles.leftCol} style={{ display: isEditorHidden ? 'none' : 'flex' }}>
          
          <div className={styles.sidebarHeader}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 className={styles.title}>Trình chỉnh sửa</h1>
                <p className={styles.subtitle}>{createdDate}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button type="button" onClick={handleUndo} disabled={historyIndex <= 0} title="Undo (Ctrl+Z)" style={{ background: 'transparent', border: '1px solid #c2c6d6', borderRadius: '4px', padding: '0.25rem 0.5rem', fontSize: '0.75rem', cursor: historyIndex > 0 ? 'pointer' : 'not-allowed', color: '#191c1e', opacity: historyIndex > 0 ? 1 : 0.5 }}>
                  ↩
                </button>
                <button type="button" onClick={handleRedo} disabled={historyIndex >= history.length - 1} title="Redo (Ctrl+Y)" style={{ background: 'transparent', border: '1px solid #c2c6d6', borderRadius: '4px', padding: '0.25rem 0.5rem', fontSize: '0.75rem', cursor: historyIndex < history.length - 1 ? 'pointer' : 'not-allowed', color: '#191c1e', opacity: historyIndex < history.length - 1 ? 1 : 0.5 }}>
                  ↪
                </button>
                <button type="button" onClick={handleExportJSON} title="Export JSON" style={{ background: 'transparent', border: '1px solid #c2c6d6', borderRadius: '4px', padding: '0.25rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer', color: '#191c1e' }}>
                  📥
                </button>
                <label title="Import JSON" style={{ background: 'transparent', border: '1px solid #c2c6d6', borderRadius: '4px', padding: '0.25rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer', color: '#191c1e', display: 'flex', alignItems: 'center' }}>
                  📤 <input type="file" accept=".json" onChange={handleImportJSON} style={{ display: 'none' }} />
                </label>
                <div style={{ width: '8px' }} />
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

          {/* TABS HEADER */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', padding: '0 1.5rem', background: '#fff' }}>
            <button 
              type="button" 
              onClick={() => setActiveTab('blocks')}
              style={{
                flex: 1, padding: '1rem', background: 'transparent', border: 'none',
                borderBottom: activeTab === 'blocks' ? '2px solid #0058be' : '2px solid transparent',
                color: activeTab === 'blocks' ? '#0058be' : '#64748b', fontWeight: activeTab === 'blocks' ? 600 : 500,
                cursor: 'pointer', transition: 'all 0.2s', fontSize: '14px'
              }}
            >
              🎨 Nội dung & Khối
            </button>
            <button 
              type="button" 
              onClick={() => setActiveTab('settings')}
              style={{
                flex: 1, padding: '1rem', background: 'transparent', border: 'none',
                borderBottom: activeTab === 'settings' ? '2px solid #0058be' : '2px solid transparent',
                color: activeTab === 'settings' ? '#0058be' : '#64748b', fontWeight: activeTab === 'settings' ? 600 : 500,
                cursor: 'pointer', transition: 'all 0.2s', fontSize: '14px'
              }}
            >
              ⚙️ Cấu hình chung
            </button>
          </div>
          <div className={styles.sidebarContent}>
            
            {/* TAB: BLOCKS */}
            {activeTab === 'blocks' && (
              <div className={styles.section}>
                {editingBlockIdx !== null && blocks[editingBlockIdx] ? (
                  <BlockEditor 
                    projectId={project.id}
                    block={blocks[editingBlockIdx]}
                    availableForms={forms}
                    onChange={(updatedBlock) => {
                      const newBlocks = [...blocks];
                      newBlocks[editingBlockIdx] = updatedBlock;
                      setBlocks(newBlocks);
                    }}
                    onBack={() => setEditingBlockIdx(null)}
                  />
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className={styles.sectionTitle}>Cấu trúc Trang</div>
                      <button 
                        type="button" 
                        onClick={handleGetCritique}
                        disabled={isCritiquing}
                        style={{ background: 'linear-gradient(135deg, #1000a9 0%, #862dd4 100%)', color: '#fff', border: 'none', padding: '0.25rem 0.75rem', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 600, cursor: isCritiquing ? 'wait' : 'pointer', opacity: isCritiquing ? 0.7 : 1 }}
                      >
                        {isCritiquing ? 'Đang phân tích...' : '🪄 AI Chấm Điểm'}
                      </button>
                    </div>
                    <p className={styles.hint}>
                      Sắp xếp, nhân bản hoặc sửa khối nội dung. Lưu thay đổi để cập nhật giao diện chính.
                    </p>
                    
                    {critiqueHtml && (
                       <div style={{ padding: '1rem', background: '#f8f9ff', borderRadius: '8px', border: '1px solid #c0c1ff', marginBottom: '1rem', fontSize: '0.8125rem', lineHeight: 1.5 }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                           <strong style={{ color: '#1000a9' }}>Đánh giá của AI UX/UI</strong>
                           <button onClick={() => setCritiqueHtml(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}>✕</button>
                         </div>
                         <div dangerouslySetInnerHTML={{ __html: critiqueHtml }} />
                       </div>
                    )}

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
                              <button type="button" onClick={() => handleSaveBlock(idx)} className={styles.blockBtn} title="Lưu thành Block mẫu" style={{ color: '#0058be' }}>💾</button>
                              <button type="button" onClick={() => handleDeleteBlock(idx)} className={styles.blockBtn} title="Xóa" style={{ color: '#ba1a1a' }}>🗑</button>
                            </div>
                          </div>
                        ))}
                        
                        <div className={styles.addBlockContainer} style={{ flexDirection: 'column', gap: '1rem', alignItems: 'stretch' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <select className={styles.addBlockSelect} id="add-block-select" style={{ flex: 1 }}>
                              <option value="hero">Hero (Mở đầu)</option>
                              <option value="features">Features (Tính năng)</option>
                              <option value="pricing">Pricing (Bảng giá)</option>
                              <option value="testimonials">Testimonials (Khách hàng)</option>
                              <option value="iframe-form">Form thu thập Data (izForm)</option>
                              <option value="image-block">Hình ảnh (Chèn Ảnh)</option>
                              <option value="custom-html">Mã nhúng tuỳ chỉnh (HTML/JS)</option>
                              <option value="carousel">Ảnh trượt (Carousel / Slider)</option>
                              <option value="floating-contact">Thanh Nút Liên Hệ (Zalo/Phone)</option>
                            </select>
                            <button type="button" className={styles.addBlockBtn} onClick={() => {
                              const el = document.getElementById('add-block-select') as HTMLSelectElement;
                              if (el) {
                                let defaultContent: any = { title: 'Mục mới', subtitle: 'Chưa có nội dung' };
                                if (el.value === 'image-block') {
                                  defaultContent = { caption: 'Hình ảnh thực tế', imageUrl: '' };
                                } else if (el.value === 'custom-html') {
                                  defaultContent = { html: '' };
                                } else if (el.value === 'iframe-form') {
                                  defaultContent = { title: 'Đăng ký thông tin', url: '' };
                                } else if (el.value === 'carousel') {
                                  defaultContent = { title: 'Hình ảnh nổi bật', images: ['https://placehold.co/600x400/e2e8f0/64748b?text=Ảnh+1', 'https://placehold.co/600x400/e2e8f0/64748b?text=Ảnh+2'] };
                                } else if (el.value === 'floating-contact') {
                                  defaultContent = { phone: '0901234567', zalo: '0901234567', messenger: 'izhubs' };
                                }
                                setBlocks([...blocks, { type: el.value, content: defaultContent }]);
                              }
                            }}>
                              + Thêm Mới
                            </button>
                          </div>
                          
                          {blockTemplates.length > 0 && (
                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                                Kho Block Mẫu & Thiết Kế Đã Lưu ({blockTemplates.length})
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                {blockTemplates.map((tpl, i) => (
                                  <button
                                    key={tpl.id || i}
                                    type="button"
                                    onClick={() => setBlocks([...blocks, { type: tpl.type, content: tpl.content }])}
                                    style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.5rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '4px' }}
                                  >
                                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{tpl.name}</span>
                                    <span style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'capitalize' }}>{tpl.type.replace('-', ' ')}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* TAB: SETTINGS */}
            {activeTab === 'settings' && (
              <>
                {/* Thông tin cơ bản */}
                <div className={styles.section}>
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
                      rows={2}
                    />
                  </div>
                </div>

                {/* Clone Website */}
                <div className={styles.section} style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #fae8ff 100%)', borderColor: '#e2e8f0' }}>
                  <div className={styles.sectionTitle} style={{ color: '#6d28d9', display: 'flex', alignItems: 'center', gap: '8px' }}>🤖 Clone Website bằng AI (Tính năng Killer)</div>
                  <p className={styles.hint} style={{ color: '#4c1d95' }}>Nhập URL một trang web bất kỳ để AI phân tích và tự động dựng lại thành hệ thống Block izLanding của bạn. (Khuyên dùng cho các Landing Page đơn giản).</p>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                    <IzInput 
                      value={cloneUrl}
                      onChange={e => setCloneUrl(e.target.value)}
                      placeholder="https://example.com"
                    />
                    <button 
                      type="button" 
                      onClick={handleCloneWebsite}
                      disabled={isCloning || !cloneUrl}
                      style={{ background: '#7c3aed', color: '#fff', border: 'none', padding: '0 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: isCloning || !cloneUrl ? 'not-allowed' : 'pointer', opacity: isCloning || !cloneUrl ? 0.6 : 1, whiteSpace: 'nowrap' }}
                    >
                      {isCloning ? 'Đang Sao chép...' : 'Tạo Bản Sao ✨'}
                    </button>
                  </div>
                </div>

                {/* Custom Domain */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>🌐 Tên miền & URL</div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Domain tùy chỉnh</label>
                <IzInput
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
                  <IzButton
                    key={opt.value}
                    type="button"
                    variant={status === opt.value ? 'default' : 'outline'}
                    onClick={() => setStatus(opt.value)}
                  >
                    {opt.emoji} {opt.label}
                  </IzButton>
                ))}
              </div>
            </div>

             {/* Tracking Scripts */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>📊 Tracking Analytics</div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className={styles.label}>Facebook Pixel ID</label>
                  <IzInput value={fbPixelId} onChange={e => setFbPixelId(e.target.value)} placeholder="VD: 123456789" />
                </div>
                <div style={{ flex: 1 }}>
                  <label className={styles.label}>Google Analytics</label>
                  <IzInput value={gaId} onChange={e => setGaId(e.target.value)} placeholder="G-XXXXXXXXXX" />
                </div>
              </div>
              <div>
                <label className={styles.label}>Livechat / Custom Scripts (Hỗ trợ Zalo, Tawk.to...)</label>
                <IzTextarea value={customScripts} onChange={e => setCustomScripts(e.target.value)} placeholder="Nhúng <script> chat hoặc tracking tại đây..." rows={3} />
              </div>
            </div>

            {/* SEO Settings */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>🔍 Tối ưu tìm kiếm (SEO)</div>
              
              <div className={styles.formGroup} style={{ marginBottom: '1rem', background: '#f8f9ff', padding: '1rem', borderRadius: '8px', border: '1px solid #e5eeff' }}>
                <IzSwitch 
                  checked={allowIndexing} 
                  onChange={e => setAllowIndexing(e.target.checked)}
                  label="Cho phép Google lập chỉ mục (Index)"
                  description="Bật lên để trang web xuất hiện trên kết quả tìm kiếm Google."
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Tiêu đề SEO (Tùy chọn)</label>
                <IzInput
                  value={seoTitle}
                  onChange={e => setSeoTitle(e.target.value)}
                  placeholder="Ghi đè tên Landing Page nếu muốn tối ưu hiển thị trên Google..."
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Mô tả SEO meta description (Tùy chọn)</label>
                <IzTextarea
                  value={seoDescription}
                  onChange={e => setSeoDescription(e.target.value)}
                  placeholder="Đoạn văn ngắn thu hút khách hàng click vào từ Google (khoảng 150-160 ký tự)..."
                  rows={2}
                />
              </div>
            </div>
            
            <div style={{ paddingBottom: '2rem', marginTop: '1rem' }}>
              <IzButton 
                type="button" 
                variant="destructive" 
                onClick={handleDelete} 
                disabled={deleting}
              >
                {deleting ? 'Đang xoá...' : 'Xoá dự án này'}
              </IzButton>
            </div>
          </>
        )}
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
              
              <button
                type="button"
                onClick={() => setIsEditorHidden(!isEditorHidden)}
                className={styles.refreshBtn}
                title={isEditorHidden ? "Hiện khung chỉnh sửa" : "Ẩn khung chỉnh sửa"}
                style={{ marginRight: '0.5rem' }}
              >
                {isEditorHidden ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>

              <div className={styles.deviceToggles}>
                <button
                  type="button"
                  className={`${styles.deviceBtn} ${previewMode === 'mobile' ? styles.activeDevice : ''}`}
                  onClick={() => setPreviewMode('mobile')}
                  title="Mobile Preview (375px)"
                >
                  <Smartphone size={16} />
                </button>
                <button
                  type="button"
                  className={`${styles.deviceBtn} ${previewMode === 'tablet' ? styles.activeDevice : ''}`}
                  onClick={() => setPreviewMode('tablet')}
                  title="Tablet Preview (768px)"
                >
                  <Tablet size={16} />
                </button>
                <button
                  type="button"
                  className={`${styles.deviceBtn} ${previewMode === 'desktop' ? styles.activeDevice : ''}`}
                  onClick={() => setPreviewMode('desktop')}
                  title="Desktop Preview (100%)"
                >
                  <Monitor size={16} />
                </button>
              </div>

              <button type="button" onClick={() => { setIframeLoading(true); setIframeKey(Date.now()); }} className={styles.refreshBtn} title="Làm mới">
                <RotateCw size={16} />
              </button>
            </div>
            <div className={styles.browserContent}>
              {iframeLoading && (
                <div className={styles.iframeLoader}>
                   <div className={styles.spinner}></div>
                </div>
              )}
              <div style={{ 
                width: previewMode === 'desktop' ? '100%' : previewMode === 'tablet' ? '768px' : '375px',
                height: '100%',
                margin: '0 auto',
                transition: 'width 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                boxShadow: previewMode !== 'desktop' ? '0 0 40px rgba(0,0,0,0.1)' : 'none',
                overflow: 'hidden'
              }}>
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
    </div>
  );
}
