export default function FormsLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{
        margin: 0,
        fontFamily: "'Inter', sans-serif",
        background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfeff 50%, #f5f3ff 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}>
        {children}
      </body>
    </html>
  );
}
