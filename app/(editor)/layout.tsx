import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'izLanding Editor',
  description: 'AI Visual Builder by izhubs',
};

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  // A clean layout without the standard ERP sidebar and header.
  // Full viewport height, no overflow scroll on body.
  return (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden', margin: 0, padding: 0 }}>
      {children}
    </div>
  );
}
