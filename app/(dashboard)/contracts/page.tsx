import Link from 'next/link';

export const metadata = { title: 'Hợp đồng — izhubs ERP' };

export default function ContractsPage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: 'var(--space-5)',
      padding: 'var(--space-8)',
      textAlign: 'center',
    }}>
      {/* Icon */}
      <div style={{
        width: 72,
        height: 72,
        borderRadius: 'var(--radius-xl)',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0.05) 100%)',
        border: '1px solid rgba(99,102,241,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 32,
      }}>
        📋
      </div>

      {/* Text */}
      <div style={{ maxWidth: 440 }}>
        <h1 style={{
          margin: '0 0 8px',
          fontWeight: 800,
          fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',
          letterSpacing: '-0.02em',
          color: 'var(--color-text)',
        }}>
          Hợp đồng & Gia hạn
        </h1>
        <p style={{
          margin: 0,
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-muted)',
          lineHeight: 1.6,
        }}>
          Tính năng quản lý hợp đồng đang được phát triển.
          Trong thời gian này, bạn có thể theo dõi trạng thái khách hàng thông qua{' '}
          <Link href="/deals" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
            Pipeline
          </Link>.
        </p>
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {['Quản lý hợp đồng', 'Theo dõi gia hạn', 'Tự động nhắc hạn', 'E-signature'].map((tag) => (
          <span key={tag} style={{
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--color-primary)',
            background: 'rgba(99,102,241,0.08)',
            border: '1px solid rgba(99,102,241,0.15)',
            borderRadius: '100px',
            padding: '4px 12px',
          }}>
            {tag}
          </span>
        ))}
      </div>

      {/* CTA */}
      <Link
        href="/deals"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '10px 20px',
          background: 'var(--color-primary)',
          color: '#fff',
          borderRadius: 'var(--radius-md)',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: 'var(--font-size-sm)',
          boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
        }}
      >
        Xem Pipeline →
      </Link>
    </div>
  );
}
