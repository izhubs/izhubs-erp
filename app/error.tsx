'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';
import { reportUIError } from './actions/errorAction';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service like Telegram
    reportUIError({
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      path: typeof window !== 'undefined' ? window.location.pathname : 'server-render'
    });
  }, [error]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: '20px', textAlign: 'center', fontFamily: 'system-ui' }}>
      <h1 style={{ color: '#d32f2f' }}>⚠️ Đã xảy ra sự cố hệ thống</h1>
      <p style={{ maxWidth: '600px', color: '#555', marginTop: '10px' }}>
        Chúng tôi xin lỗi, hệ thống đang gặp lỗi kỹ thuật. Quản trị viên đã nhận được cảnh báo tự động và đang tiến hành xử lý.
      </p>
      {error.digest && <p style={{ fontSize: '12px', color: '#888' }}>Mã lỗi: {error.digest}</p>}
      
      <button
        onClick={() => reset()}
        style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Tải lại trang
      </button>
    </div>
  );
}
