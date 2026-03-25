'use client';
import React from 'react';
import { SyncSummaryCard } from '@/packages/izerp-plugin/components/plugins/biz-ops/dashboard/SyncSummaryCard';
import { SyncROASChart } from '@/packages/izerp-plugin/components/plugins/biz-ops/dashboard/SyncROASChart';
import { SyncPlatformComparison } from '@/packages/izerp-plugin/components/plugins/biz-ops/dashboard/SyncPlatformComparison';
import { SyncCampaignLeaderboard } from '@/packages/izerp-plugin/components/plugins/biz-ops/dashboard/SyncCampaignLeaderboard';

// MOCK DATA
const mockSparklineCPA = [{value: 60}, {value: 62}, {value: 55}, {value: 50}, {value: 48}, {value: 45}, {value: 42}];
const mockSparklineSpend = [{value: 100}, {value: 150}, {value: 200}, {value: 180}, {value: 250}, {value: 220}, {value: 300}];

const mockROASData = [
  { date: 'Mon', adSpend: 300, conversions: 12 },
  { date: 'Tue', adSpend: 400, conversions: 18 },
  { date: 'Wed', adSpend: 350, conversions: 15 },
  { date: 'Thu', adSpend: 500, conversions: 35 },
  { date: 'Fri', adSpend: 480, conversions: 28 },
  { date: 'Sat', adSpend: 600, conversions: 50 },
  { date: 'Sun', adSpend: 750, conversions: 65 },
];

const mockPlatformData = [
  { platform: 'Facebook', adSpend: 2500, conversions: 120 },
  { platform: 'Google', adSpend: 1500, conversions: 80 },
];

const mockCampaigns: any[] = [
  { id: '1', name: 'Black Friday 2026', source: 'Facebook', spend: 1200, conversions: 50, cpa: 24, status: 'active' },
  { id: '2', name: 'Search - Brand Terms', source: 'Google', spend: 400, conversions: 40, cpa: 10, status: 'active' },
  { id: '3', name: 'Retargeting Website', source: 'Facebook', spend: 800, conversions: 8, cpa: 100, status: 'paused' },
  { id: '4', name: 'TikTok GenZ Expr', source: 'Mixed', spend: 0, conversions: 0, cpa: 0, status: 'error' },
];

export default function DemoSyncDashboard() {
  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 8px 0' }}>Digital Sync Dashboard (Mock Data Demo)</h1>
        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Showing performance metrics synced from Google & Facebook Ads.</p>
      </div>

      {/* Row 1: Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
        <SyncSummaryCard 
          title="Total Ad Spend (Last 7 Days)"
          value="$3,380"
          trend="up"
          trendPercentage={12}
          sparklineData={mockSparklineSpend}
          budgetContext="vs $10,000 monthly budget"
        />
        <SyncSummaryCard 
          title="Average CPA (Cost per Acquisition)"
          value="$15.20"
          trend="down"
          trendPercentage={8}
          sparklineData={mockSparklineCPA}
          budgetContext="Target CPA: $20.00"
        />
      </div>

      {/* Row 2: Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <SyncROASChart data={mockROASData} />
        <SyncPlatformComparison data={mockPlatformData} />
      </div>

      {/* Row 3: Leaderboard */}
      <div>
        <SyncCampaignLeaderboard 
          campaigns={mockCampaigns} 
          onToggleStatus={async (id, s) => { console.log('Toggled', id, s) }} 
        />
      </div>
    </div>
  );
}
