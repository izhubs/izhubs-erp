import { IzButton } from '@/components/ui/IzButton';
import { IzInput } from '@/components/ui/IzInput';
import { IzTextarea } from '@/components/ui/IzTextarea';
import { IzFileUpload } from '@/components/ui/IzFileUpload';
import { LandingBlock } from './LandingRenderer';
import { useState } from 'react';

interface Props {
  block: LandingBlock;
  onChange: (block: LandingBlock) => void;
  onBack: () => void;
}

export function BlockEditor({ block, onChange, onBack }: Props) {
  const content = block.content || {};
  const [uploadingPath, setUploadingPath] = useState<string | null>(null);

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
          </label>
          
          {isMedia ? (
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
              rows={3}
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
                 if (typeof value[0] === 'string') newArr.push('Mục mới');
                 else newArr.push(Object.fromEntries(Object.keys(value[0]).map(k => [k, ''])));
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
        {Object.entries(content).map(([key, value]) => renderField(key, value, [key]))}
      </div>
    </div>
  );
}
