'use client';

import { useState } from 'react';
import { Database, RefreshCw } from 'lucide-react';
import { useToast } from '@/lib/toast';

export default function DevResetDbButton() {
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  
  // Only render in development environment
  if (process.env.NODE_ENV !== 'development') return null;

  const handleReset = async () => {
    if (!confirm('🚨 NGUY HIỂM (Chỉ hiện ở Dev): Hành động này sẽ XÓA TOÀN BỘ SCHEMA PUBLIC và chạy lại seed! Toàn bộ Data sẽ mất hết. Bạn có chắc không?')) return;
    
    setLoading(true);
    toast.info('Đang tiến hành Reset Database...');

    try {
      const res = await fetch('/api/v1/dev/reset-db', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset DB');
      
      toast.success('✅ Reset DB Thành Công! Hệ thống sẽ reload trang...');
      
      // Force reload after short delay so toast is visible
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    } catch (err: any) {
      toast.error('❌ Lỗi reset DB: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleReset}
      disabled={loading}
      className="btn"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        background: 'var(--color-danger, #ef4444)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 16px',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: loading ? 'wait' : 'pointer',
        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
        zIndex: 9999, // Floating above everything
        opacity: loading ? 0.7 : 1,
        transition: 'transform 0.1s',
      }}
      title="Dev Only: Reset Database"
    >
      {loading ? (
        <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
      ) : (
        <Database size={16} />
      )}
      {loading ? 'Đang Reset...' : 'Reset DB (Dev)'}
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </button>
  );
}
