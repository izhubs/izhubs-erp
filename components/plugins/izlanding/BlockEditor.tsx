import { IzButton } from '@/components/ui/IzButton';
import { IzInput } from '@/components/ui/IzInput';
import { IzTextarea } from '@/components/ui/IzTextarea';
import { IzFileUpload } from '@/components/ui/IzFileUpload';
import { IzSelect } from '@/components/ui/IzSelect';
import { LandingBlock } from './LandingRenderer';
import { useState } from 'react';

interface Props {
  projectId: string;
  block: LandingBlock;
  availableForms?: any[];
  onChange: (block: LandingBlock) => void;
  onBack: () => void;
}

export function BlockEditor({ projectId, block, availableForms = [], onChange, onBack }: Props) {
  const content = block.content || {};
  const [uploadingPath, setUploadingPath] = useState<string | null>(null);
  
  // AI Generate state
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleUpload = async (file: File, key: string, path: string[], itemIdx?: number, itemKey?: string) => {
    const pathKey = path.join('.');
    setUploadingPath(pathKey);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/v1/plugins/izlanding/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const url = data.data.url;
        if (itemIdx !== undefined && itemKey) {
          const arr = [...content[key]];
          arr[itemIdx] = { ...arr[itemIdx], [itemKey]: url };
          handleChange(key, arr);
        } else {
          handleChange(key, url);
        }
      } else {
        alert(data?.error?.message || 'Upload thất bại');
      }
    } catch (err) {
      console.error(err);
      alert('Upload lỗi!');
    } finally {
      setUploadingPath(null);
    }
  };

  const handleGenerateBlock = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/v1/plugins/izlanding/projects/${projectId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Yêu cầu chỉnh sửa khối cấu trúc hiện tại: ${aiPrompt}. LƯU Ý: KHÔNG thêm khối mới, CHỈ trả về đúng 1 khối có cấu trúc giống khối đưa vào nhưng nội dung đã thay đổi.`,
          existingBlocks: [block]
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to generate block content');
      }
      const newBlocks = data.data.blocks;
      if (newBlocks && newBlocks.length > 0) {
        onChange(newBlocks[0]); 
      }
      setAiPrompt('');
    } catch (err: any) {
      alert(err instanceof Error ? err.message : 'Lỗi khi gọi AI');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChange = (key: string, value: any) => {
    onChange({ ...block, content: { ...content, [key]: value } });
  };

  const renderField = (key: string, value: any, path: string[], arrayIdx?: number, parentKey?: string) => {
    if (typeof value === 'string') {
      const lowerKey = key.toLowerCase();
      const isMedia = lowerKey.includes('image') || lowerKey.includes('icon') || lowerKey.includes('logo') || lowerKey.includes('cover') || lowerKey.includes('avatar');
      const isLongText = value.length > 50 || lowerKey.includes('description') || lowerKey.includes('text');
      const pathKey = path.join('.');
      
      return (
        <div key={pathKey} style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '4px', textTransform: 'capitalize' }}>
            {key.replace(/([A-Z])/g, ' $1')}
            {lowerKey === 'icon' && <span style={{ marginLeft: '6px', fontSize: '11px', color: '#94a3b8', fontWeight: 400 }}>(e.g. "Star", "Heart", "Zap")</span>}
          </label>
          
          {block.type === 'iframe-form' && key === 'url' ? (
            <IzSelect
              value={{
                value: value,
                label: typeof value === 'string' && value.startsWith('/f/') 
                  ? availableForms?.find(f => (`/f/${f.slug || f.id}` === value))?.name || value
                  : '-- Chọn một Form (izForm) --'
              }}
              onChange={(opt: any) => {
                 if (arrayIdx !== undefined && parentKey) {
                    const arr = [...content[parentKey]];
                    arr[arrayIdx] = { ...arr[arrayIdx], [key]: opt?.value || '' };
                    handleChange(parentKey, arr);
                 } else {
                    handleChange(key, opt?.value || '');
                 }
              }}
              options={[
                { value: '', label: '-- Nhập hoặc Chọn form --' },
                ...(availableForms?.map(f => ({
                  value: `/f/${f.slug || f.id}`,
                  label: f.name
                })) || [])
              ]}
            />
          ) : isMedia ? (
            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              {value && <img src={value} alt="Preview" style={{ maxWidth: '100%', maxHeight: '120px', objectFit: 'contain', borderRadius: '4px', marginBottom: '8px', border: '1px solid #cbd5e1' }} />}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <IzInput 
                  value={value} 
                  onChange={e => {
                    if (arrayIdx !== undefined && parentKey) {
                       const arr = [...content[parentKey]];
                       arr[arrayIdx] = { ...arr[arrayIdx], [key]: e.target.value };
                       handleChange(parentKey, arr);
                    } else {
                       handleChange(key, e.target.value);
                    }
                  }}
                  placeholder="URL Hình ảnh"
                  wrapperClassName="flex-1"
                />
              </div>
              <div style={{ marginTop: '8px' }}>
                {uploadingPath === pathKey ? (
                  <div style={{ fontSize: '12px', color: '#6366f1' }}>Đang tải lên...</div>
                ) : (
                  <IzFileUpload 
                     label="Hoặc tải ảnh từ máy"
                     accept="image/*"
                     maxSizeMB={5}
                     onFilesSelected={files => {
                       if (files.length > 0) {
                         if (parentKey && arrayIdx !== undefined) {
                           handleUpload(files[0], parentKey, path, arrayIdx, key);
                         } else {
                           handleUpload(files[0], key, path);
                         }
                       }
                     }}
                  />
                )}
              </div>
            </div>
          ) : isLongText ? (
            <IzTextarea 
              value={value} 
              onChange={e => {
                 if (arrayIdx !== undefined && parentKey) {
                    const arr = [...content[parentKey]];
                    arr[arrayIdx] = { ...arr[arrayIdx], [key]: e.target.value };
                    handleChange(parentKey, arr);
                 } else {
                    handleChange(key, e.target.value);
                 }
              }}
              rows={lowerKey.includes('html') ? 12 : 3}
              style={lowerKey.includes('html') ? { fontFamily: 'monospace', tabSize: 2 } : {}}
              placeholder={lowerKey.includes('html') ? '<div>Nhập mã...</div>' : ''}
            />
          ) : (
            <IzInput 
              value={value} 
              onChange={e => {
                 if (arrayIdx !== undefined && parentKey) {
                    const arr = [...content[parentKey]];
                    arr[arrayIdx] = { ...arr[arrayIdx], [key]: e.target.value };
                    handleChange(parentKey, arr);
                 } else {
                    handleChange(key, e.target.value);
                 }
              }}
            />
          )}
        </div>
      );
    }
    
    // For arrays (like features list, testimonials list)
    if (Array.isArray(value)) {
      return (
        <div key={path.join('.')} style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px', textTransform: 'capitalize' }}>
            {key.replace(/([A-Z])/g, ' $1')} (List)
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {value.map((item, idx) => (
              <div key={idx} style={{ padding: '8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                {typeof item === 'string' ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <IzInput 
                      value={item} 
                      onChange={e => {
                        const newArr = [...value];
                        newArr[idx] = e.target.value;
                        handleChange(key, newArr);
                      }}
                    />
                    <button type="button" onClick={() => {
                      const newArr = value.filter((_, i) => i !== idx);
                      handleChange(key, newArr);
                    }} style={{ color: '#ef4444', background: '#fef2f2', padding: '0 8px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
                      ✖
                    </button>
                  </div>
                ) : typeof item === 'object' && item !== null ? (
                   // If object items (like features = [{title, icon}])
                    <div>
                     {Object.entries(item).map(([subKey, subVal]) => {
                       return renderField(subKey, subVal, [key, String(idx), subKey], idx, key);
                     })}
                     <button type="button" onClick={() => {
                        const newArr = value.filter((_, i) => i !== idx);
                        handleChange(key, newArr);
                      }} style={{ fontSize: '12px', color: '#ef4444', background: 'transparent', border: 'none', padding: 0, marginTop: '8px', cursor: 'pointer' }}>
                        Xóa dòng này
                      </button>
                   </div>
                ) : null}
              </div>
            ))}
          </div>
          <button 
            type="button" 
            onClick={() => {
              const newArr = [...value];
              if (value.length > 0) {
                 if (typeof value[0] === 'string') {
                    // Try to detect if we need objects Instead. We'll default to simple string for string arrays.
                    newArr.push('Mục mới');
                 } else {
                    newArr.push(Object.fromEntries(Object.keys(value[0]).map(k => [k, k === 'icon' ? 'Star' : ''])));
                 }
              } else {
                 newArr.push('Mục mới');
              }
              handleChange(key, newArr);
            }}
            style={{ marginTop: '8px', fontSize: '12px', color: '#4f46e5', background: '#e0e7ff', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
          >
            + Thêm mục
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
        <button type="button" onClick={onBack} style={{ background: '#f1f5f9', border: 'none', width: '2rem', height: '2rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
          ←
        </button>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', textTransform: 'capitalize' }}>{block.type.replace('-', ' ')}</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Chỉnh sửa nội dung khối</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {Object.entries(content).map(([key, value]) => {
          if (['hiddenOnDesktop', 'hiddenOnTablet', 'hiddenOnMobile'].includes(key)) return null;
          return renderField(key, value, [key]);
        })}
        {block.type === 'iframe-form' && !('url' in content) && renderField('url', '', ['url'])}
        
        {/* Device Visibility block */}
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#334155' }}>👀 Hiển thị theo thiết bị</div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
               <input type="checkbox" checked={!content.hiddenOnDesktop} onChange={e => handleChange('hiddenOnDesktop', !e.target.checked)} /> Máy tính
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
               <input type="checkbox" checked={!content.hiddenOnTablet} onChange={e => handleChange('hiddenOnTablet', !e.target.checked)} /> Máy tính bảng
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
               <input type="checkbox" checked={!content.hiddenOnMobile} onChange={e => handleChange('hiddenOnMobile', !e.target.checked)} /> Điện thoại
            </label>
          </div>
        </div>
      </div>

      {block.type !== 'iframe-form' && (
        <div style={{ marginTop: '2rem', padding: '1.25rem', background: '#f8f9ff', borderRadius: '12px', border: '1px solid #e5eeff' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#1000a9' }}>✨ AI Tùy Chỉnh Khối Này</div>
          <IzTextarea 
            value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
            placeholder='VD: "Viết lại tiêu đề cho hấp dẫn hơn", "Đổi icon thành hình tên lửa"...'
            rows={2}
          />
          <button 
            type="button" 
            onClick={handleGenerateBlock} 
            disabled={isGenerating || !aiPrompt.trim()}
            style={{ width: '100%', marginTop: '12px', background: 'linear-gradient(135deg, #c0c1ff 0%, #862dd4 100%)', color: '#1000a9', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', opacity: isGenerating || !aiPrompt.trim() ? 0.6 : 1 }}
          >
            {isGenerating ? 'Đang tùy chỉnh...' : 'Tùy chỉnh bằng AI 🪄'}
          </button>
        </div>
      )}
    </div>
  );
}
