'use client';
import React from 'react';
import { SyncSummaryCard } from '@/packages/izerp-plugin/components/plugins/biz-ops/dashboard/SyncSummaryCard';
import { SyncROASChart } from '@/packages/izerp-plugin/components/plugins/biz-ops/dashboard/SyncROASChart';
import { SyncPlatformComparison } from '@/packages/izerp-plugin/components/plugins/biz-ops/dashboard/SyncPlatformComparison';
import { SyncCampaignLeaderboard } from '@/packages/izerp-plugin/components/plugins/biz-ops/dashboard/SyncCampaignLeaderboard';

// Real Data Fetching via SWR
import useSWR from 'swr';
import { Loader2 } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DemoSyncDashboard() {
  const { data: response, error, isLoading } = useSWR('/api/v1/biz-ops/dashboard/sync', fetcher);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Loader2 className="animate-spin text-gray-400" size={48} />
      </div>
    );
  }

  if (error || !response?.data) {
    return <div style={{ padding: '32px', color: 'red' }}>Error loading dashboard data.</div>;
  }

  const { summary, roasData, platformData, campaigns } = response.data;

  // Generate fake sparkline data based on the real summary (since historical is not in the summary payload yet)
  const syntheticSparklineCPA = Array.from({length: 7}, () => ({ value: summary.avgCpa * (0.8 + Math.random() * 0.4) }));
  const syntheticSparklineSpend = Array.from({length: 7}, () => ({ value: summary.totalSpend / 7 * (0.5 + Math.random()) }));

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 8px 0' }}>Digital Sync Dashboard (Live Data)</h1>
        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Showing performance metrics synced from Google & Facebook Ads.</p>
      </div>

      {/* Row 1: Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
        <SyncSummaryCard 
          title="Total Ad Spend (Last 7 Days)"
          value={`$${summary.totalSpend.toLocaleString()}`}
          trend="up"
          trendPercentage={12}
          sparklineData={syntheticSparklineSpend}
          budgetContext="vs $10,000 monthly budget"
        />
        <SyncSummaryCard 
          title="Average CPA (Cost per Acquisition)"
          value={`$${summary.avgCpa.toLocaleString()}`}
          trend="down"
          trendPercentage={8}
          sparklineData={syntheticSparklineCPA}
          budgetContext="Target CPA: $20.00"
        />
      </div>

      {/* Row 2: Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <SyncROASChart data={roasData} />
        <SyncPlatformComparison data={platformData} />
      </div>

      {/* Row 3: Leaderboard */}
      <div>
        <SyncCampaignLeaderboard 
          campaigns={campaigns} 
          onToggleStatus={async (id, s) => { console.log('Toggled Live Status', id, s) }} 
        />
      </div>
    </div>
  );
}
