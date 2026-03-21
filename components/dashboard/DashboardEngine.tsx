'use client';

import { useQuery } from '@tanstack/react-query';
import { SummaryCardWidget } from './SummaryCardWidget';
import { ChartWidget } from './ChartWidget';
import { DataTableWidget } from './DataTableWidget';

export interface DashboardEngineProps {
  moduleSlug: string;
}

export function DashboardEngine({ moduleSlug }: DashboardEngineProps) {
  const { data: payload, isLoading, error } = useQuery({
    queryKey: ['dashboard_bff', moduleSlug],
    queryFn: async () => {
      // Need to read hz_access cookie to pass in Authorization header
      const tokenStr = document.cookie
        .split('; ')
        .find(r => r.startsWith('hz_access='))
        ?.split('=')[1];

      const res = await fetch(`/api/v1/dashboard/BFF?module=${moduleSlug}`, {
        headers: {
          'Authorization': `Bearer ${tokenStr}`,
        }
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch dashboard config');
      }
      const json = await res.json();
      return json.data;
    },
    refetchInterval: 300000, // 5 minutes refresh
    staleTime: 60000, // 1 minute stale
  });

  if (isLoading) {
    return (
      <div className="dashboard-engine-loading animate-fade-in">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 'var(--space-4)' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ gridColumn: 'span 3' }}>
              <div className="card p-4 skeleton-container animate-pulse" style={{ height: '120px' }} />
            </div>
          ))}
          <div style={{ gridColumn: 'span 8' }}>
            <div className="card p-4 skeleton-container animate-pulse" style={{ height: '300px' }} />
          </div>
          <div style={{ gridColumn: 'span 4' }}>
            <div className="card p-4 skeleton-container animate-pulse" style={{ height: '300px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
        <h3 style={{ color: 'var(--color-danger)' }}>Could not load dashboard</h3>
        <p style={{ color: 'var(--color-text-muted)' }}>{(error as Error).message}</p>
      </div>
    );
  }

  if (!payload || !payload.grid || payload.grid.length === 0) {
    return (
      <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
        <h3>Dashboard Setup Required</h3>
        <p style={{ color: 'var(--color-text-muted)' }}>No widgets configured for this role.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-engine">
      <div 
        className="dashboard-grid animate-staggered-fade"
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(12, 1fr)', 
          gap: 'var(--space-4)',
          alignItems: 'start'
        }}
      >
        {payload.grid.map((widget: any) => {
          const gridColumn = `span ${widget.w || 12}`;
          
          return (
            <div 
              key={widget.id} 
              className="dashboard-widget-wrapper"
              style={{ gridColumn }}
            >
              {widget.type === 'SummaryCard' && (
                <SummaryCardWidget
                  id={widget.id}
                  title={widget.title}
                  value={widget.data?.value}
                  trend={widget.data?.trend}
                  trendLabel={widget.data?.trendLabel}
                  icon={widget.icon}
                  format={widget.format}
                />
              )}
              {widget.type === 'ChartWidget' && (
                <ChartWidget
                  id={widget.id}
                  title={widget.title}
                  type={widget.chart_type}
                  data={widget.data?.items || []}
                  xKey={widget.xKey}
                  yKeys={widget.yKeys}
                />
              )}
              {widget.type === 'DataTableWidget' && (
                <DataTableWidget
                  id={widget.id}
                  title={widget.title}
                  columns={widget.columns || []}
                  data={widget.data?.rows || []}
                />
              )}
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes fadeUpIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-staggered-fade .dashboard-widget-wrapper {
          opacity: 0;
          animation: fadeUpIn 0.5s ease-out forwards;
        }
        .animate-staggered-fade .dashboard-widget-wrapper:nth-child(1) { animation-delay: 0.05s; }
        .animate-staggered-fade .dashboard-widget-wrapper:nth-child(2) { animation-delay: 0.1s; }
        .animate-staggered-fade .dashboard-widget-wrapper:nth-child(3) { animation-delay: 0.15s; }
        .animate-staggered-fade .dashboard-widget-wrapper:nth-child(4) { animation-delay: 0.2s; }
        .animate-staggered-fade .dashboard-widget-wrapper:nth-child(5) { animation-delay: 0.25s; }
        .animate-staggered-fade .dashboard-widget-wrapper:nth-child(6) { animation-delay: 0.3s; }
        
        @media (max-width: 1024px) {
          .dashboard-grid > div {
            grid-column: span 6 !important;
          }
        }
        @media (max-width: 640px) {
          .dashboard-grid > div {
            grid-column: span 12 !important;
          }
        }
      `}</style>
    </div>
  );
}
