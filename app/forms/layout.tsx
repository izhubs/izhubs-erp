export default function FormsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      margin: 0,
      fontFamily: "'Inter', sans-serif",
      background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfeff 50%, #f5f3ff 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999, /* Cover any dashboard layout elements if they bleed through */
      overflowY: 'auto'
    }}>
      {children}
    </div>
  );
}
