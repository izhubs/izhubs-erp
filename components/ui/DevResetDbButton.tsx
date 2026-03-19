'use client';

import { useState } from 'react';
import { Database, RefreshCw, AlertTriangle, X } from 'lucide-react';
import { useToast } from '@/lib/toast';

export default function DevResetDbButton() {
  const [loading, setLoading] = useState(false);
  const [armed, setArmed] = useState(false);
  const toast = useToast();

  // Only render in development environment
  if (process.env.NODE_ENV !== 'development') return null;

  const handleArm = () => {
    setArmed(true);
    // Auto-disarm after 4 seconds if not confirmed
    setTimeout(() => setArmed(false), 4000);
  };

  const handleConfirm = async () => {
    setArmed(false);
    setLoading(true);
    toast.info('Đang Reset Database... (~10 giây)');

    try {
      const res = await fetch('/api/v1/dev/reset-db', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset DB');

      toast.success('✅ Reset DB Thành Công! Đang chuyển hướng...');
      setTimeout(() => { window.location.href = '/login'; }, 1500);
    } catch (err: any) {
      toast.error('❌ Lỗi reset DB: ' + err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed', bottom: '24px', right: '24px',
        zIndex: 10001, display: 'flex', alignItems: 'center', gap: '8px',
        background: '#ef4444', color: '#fff', borderRadius: '8px',
        padding: '10px 16px', fontWeight: 600, fontSize: '13px',
        boxShadow: '0 4px 12px rgba(239,68,68,0.4)',
      }}>
        <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
        Đang Reset...
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (armed) {
    return (
      <div style={{
        position: 'fixed', bottom: '24px', right: '24px',
        zIndex: 10001, display: 'flex', alignItems: 'center', gap: '6px',
        background: '#1a1a2e', border: '2px solid #ef4444',
        borderRadius: '10px', padding: '8px 12px',
        boxShadow: '0 4px 24px rgba(239,68,68,0.5)',
      }}>
        <AlertTriangle size={14} style={{ color: '#ef4444', flexShrink: 0 }} />
        <span style={{ fontSize: '12px', color: '#fff', fontWeight: 500, whiteSpace: 'nowrap' }}>
          XÁC NHẬN xóa DB?
        </span>
        <button
          onClick={handleConfirm}
          style={{
            background: '#ef4444', color: '#fff', border: 'none',
            borderRadius: '6px', padding: '4px 10px', fontWeight: 700,
            fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          Xóa ngay
        </button>
        <button
          onClick={() => setArmed(false)}
          style={{
            background: 'rgba(255,255,255,0.1)', color: '#aaa', border: 'none',
            borderRadius: '6px', padding: '4px 6px', cursor: 'pointer', fontSize: '12px',
          }}
        >
          <X size={12} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleArm}
      className="btn"
      title="Dev Only: Reset Database"
      style={{
        position: 'fixed', bottom: '24px', right: '24px', zIndex: 10001,
        background: 'rgba(239,68,68,0.15)', color: '#ef4444',
        border: '1px solid rgba(239,68,68,0.4)',
        borderRadius: '8px', padding: '8px 14px', fontWeight: 600,
        display: 'flex', alignItems: 'center', gap: '7px',
        cursor: 'pointer', fontSize: '13px',
        boxShadow: '0 2px 8px rgba(239,68,68,0.2)',
      }}
    >
      <Database size={14} />
      Reset DB
    </button>
  );
}
