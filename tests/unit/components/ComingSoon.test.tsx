/**
 * Unit tests: ComingSoon component
 *
 * Verifies the component renders correctly with various props
 * and always shows the data-testid="coming-soon" marker.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import ComingSoon from '@izerp-theme/components/ui/ComingSoon';

describe('ComingSoon', () => {
  it('renders the title as an h1', () => {
    render(<ComingSoon title="Automation" />);
    expect(screen.getByRole('heading', { name: 'Automation' })).toBeInTheDocument();
  });

  it('renders coming-soon testid marker', () => {
    render(<ComingSoon title="Reports" />);
    expect(screen.getByTestId('coming-soon')).toBeInTheDocument();
  });

  it('shows default milestone "v0.2" when not specified', () => {
    render(<ComingSoon title="Contracts" />);
    expect(screen.getByText(/Coming in v0.2/i)).toBeInTheDocument();
  });

  it('shows custom milestone when provided', () => {
    render(<ComingSoon title="Automation" milestone="v0.3" />);
    expect(screen.getByText(/Coming in v0.3/i)).toBeInTheDocument();
  });

  it('renders custom description', () => {
    render(
      <ComingSoon
        title="Reports"
        description="Visual insights into your pipeline."
      />
    );
    expect(screen.getByText(/Visual insights into your pipeline/i)).toBeInTheDocument();
  });

  it('renders planned features list when provided', () => {
    render(
      <ComingSoon
        title="Reports"
        plannedFeatures={['Pipeline funnel', 'Revenue by stage']}
      />
    );
    expect(screen.getByText('Pipeline funnel')).toBeInTheDocument();
    expect(screen.getByText('Revenue by stage')).toBeInTheDocument();
  });

  it('does NOT render planned features section when list is empty', () => {
    render(<ComingSoon title="Reports" plannedFeatures={[]} />);
    expect(screen.queryByText(/Planned features/i)).not.toBeInTheDocument();
  });
});
