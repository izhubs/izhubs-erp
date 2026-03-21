import { DashboardEngine } from '@/components/dashboard/DashboardEngine';
import { Metadata } from 'next';

interface Props {
  params: Promise<{ module: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await params;
  const moduleName = p.module.charAt(0).toUpperCase() + p.module.slice(1);
  return { title: `${moduleName} Dashboard — izhubs ERP` };
}

export default async function GenericDashboardPage({ params }: Props) {
  const p = await params;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ margin: 0, fontWeight: 800, fontSize: 'clamp(1.5rem, 2vw, 2rem)', letterSpacing: '-0.02em', textTransform: 'capitalize' }}>
            {p.module} Dashboard
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: 'var(--color-primary)', boxShadow: '0 0 8px var(--color-primary)' }} />
            Dynamic Engine Renderer
          </p>
        </div>
      </div>

      {/* Dynamic Engine */}
      <DashboardEngine moduleSlug={p.module} />
    </div>
  );
}
