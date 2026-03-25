import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import components to test
import { SyncSummaryCard } from '@/packages/izerp-plugin/components/plugins/biz-ops/dashboard/SyncSummaryCard';
import { SyncROASChart } from '@/packages/izerp-plugin/components/plugins/biz-ops/dashboard/SyncROASChart';
import { SyncPlatformComparison } from '@/packages/izerp-plugin/components/plugins/biz-ops/dashboard/SyncPlatformComparison';
import { SyncCampaignLeaderboard } from '@/packages/izerp-plugin/components/plugins/biz-ops/dashboard/SyncCampaignLeaderboard';

// Mock Recharts to avoid ResizeObserver and ResponsiveContainer scaling issues in standard JSDOM
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="recharts-container">{children}</div>,
  LineChart: () => <div data-testid="line-chart" />,
  BarChart: () => <div data-testid="bar-chart" />,
  Line: () => null,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
}));

describe('Digital Sync Dashboard Widgets', () => {
  describe('SyncSummaryCard', () => {
    it('renders the title, value, and trend info correctly', () => {
      render(
        <SyncSummaryCard 
          title="Total Ad Spend" 
          value="$1,250" 
          trend="up" 
          trendPercentage={15} 
          sparklineData={[{ value: 10 }, { value: 15 }]} 
          budgetContext="vs $5k budget"
        />
      );

      expect(screen.getByText('Total Ad Spend')).toBeInTheDocument();
      expect(screen.getByText('$1,250')).toBeInTheDocument();
      expect(screen.getByText('vs $5k budget')).toBeInTheDocument();
      expect(screen.getByText('↑ 15%')).toBeInTheDocument();
      expect(screen.getByTestId('recharts-container')).toBeInTheDocument();
    });
  });

  describe('SyncROASChart', () => {
    it('renders the main title and subtitle', () => {
      render(
        <SyncROASChart 
          data={[]} 
          title="Global Cost vs Conversions TEST" 
        />
      );
      
      expect(screen.getByText('Global Cost vs Conversions TEST')).toBeInTheDocument();
      expect(screen.getByTestId('recharts-container')).toBeInTheDocument();
    });
  });

  describe('SyncPlatformComparison', () => {
    it('renders the chart structure', () => {
      render(<SyncPlatformComparison data={[]} />);
      expect(screen.getByText('Platform Comparison')).toBeInTheDocument();
      expect(screen.getByTestId('recharts-container')).toBeInTheDocument();
    });
  });

  describe('SyncCampaignLeaderboard', () => {
    const mockCampaigns: any[] = [
      {
        id: 'camp_1',
        name: 'Black Friday Sale',
        source: 'Facebook',
        spend: 550,
        conversions: 10,
        cpa: 55,
        status: 'active'
      },
      {
        id: 'camp_2',
        name: 'Retargeting Audience',
        source: 'Google',
        spend: 200,
        conversions: 2,
        cpa: 100,
        status: 'paused'
      }
    ];

    it('renders the campaigns in the table', () => {
      render(<SyncCampaignLeaderboard campaigns={mockCampaigns} />);
      
      expect(screen.getByText('Black Friday Sale')).toBeInTheDocument();
      expect(screen.getByText('Facebook')).toBeInTheDocument();
      expect(screen.getByText('$550')).toBeInTheDocument();

      expect(screen.getByText('Retargeting Audience')).toBeInTheDocument();
      expect(screen.getByText('Google')).toBeInTheDocument();
      expect(screen.getByText('$200')).toBeInTheDocument();
    });

    it('displays the correct action button based on component status', () => {
      render(<SyncCampaignLeaderboard campaigns={mockCampaigns} />);
      
      // Black Friday is 'active' so button should say 'Pause'
      const pauseBtns = screen.queryAllByRole('button', { name: 'Pause' });
      expect(pauseBtns.length).toBe(1);

      // Retargeting is 'paused' so button should say 'Resume'
      const resumeBtns = screen.queryAllByRole('button', { name: 'Resume' });
      expect(resumeBtns.length).toBe(1);
    });

    it('calls onToggleStatus when the toggle button is clicked', () => {
      const toggleMock = jest.fn();
      render(<SyncCampaignLeaderboard campaigns={mockCampaigns} onToggleStatus={toggleMock} />);
      
      const pauseBtn = screen.getByRole('button', { name: 'Pause' });
      fireEvent.click(pauseBtn);

      expect(toggleMock).toHaveBeenCalledWith('camp_1', 'paused');
    });
    
    it('shows empty state message when no tracking campaigns exist', () => {
      render(<SyncCampaignLeaderboard campaigns={[]} />);
      expect(screen.getByText('No tracking campaigns found.')).toBeInTheDocument();
    });
  });
});
