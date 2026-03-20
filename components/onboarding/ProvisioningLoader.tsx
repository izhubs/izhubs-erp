'use client';

export default function ProvisioningLoader() {
  return (
    <div className="provisioning-loader" style={{ textAlign: 'center', marginTop: '10vh' }}>
      <div className="spinner" style={{ fontSize: '3rem', animation: 'spin 2s linear infinite' }}>⚙️</div>
      <h2 style={{ marginTop: '2rem' }}>Đang cấp phát hệ thống của bạn...</h2>
      <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem', color: '#666' }}>
        <li>✅ Khởi tạo Database riêng biệt (RLS)</li>
        <li>✅ Đang áp dụng cấu trúc Ngành nghề</li>
        <li>✅ Đang gieo Dữ liệu mẫu (Demo Data)</li>
        <li>⏳ Chờ xíu nhé, sắp xong rồi...</li>
      </ul>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}
