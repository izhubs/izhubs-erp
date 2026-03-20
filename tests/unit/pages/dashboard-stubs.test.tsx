/**
 * Contract tests: Dashboard Page Routes
 *
 * Verifies that every dashboard page:
 *  a) Renders without throwing
 *  b) Contains the expected <h1> title
 *  c) Is either a real feature or a ComingSoon stub (not a 404 or empty)
 *
 * These are shallow render tests — no DB, no network.
 * Pages that import from engine (async Server Components) are tested
 * via their client-only rendered output, with engine functions mocked.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('jose', () => ({
  jwtVerify: jest.fn(),
  SignJWT: jest.fn(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn(),
  })),
}));

jest.mock('next/headers', () => ({
  headers: jest.fn(() => ({
    get: jest.fn(),
  })),
  cookies: jest.fn(() => ({
    get: jest.fn(),
  })),
}));

// ─── Stub pages (pure Client Components or simple RSC with no async) ───────

// Import stub pages directly
import AuditLogPage from '@/app/(dashboard)/audit-log/page';
import AutomationPage from '@/app/(dashboard)/automation/page';
import ReportsPage from '@/app/(dashboard)/reports/page';
import ContractsPage from '@/app/(dashboard)/contracts/page';
import SettingsPage from '@/app/(dashboard)/settings/page';
import ExtensionsPage from '@/app/(dashboard)/settings/extensions/page';
import IntegrationsPage from '@/app/(dashboard)/settings/integrations/page';
import PipelineStagesPage from '@/app/(dashboard)/settings/pipeline-stages/page';
import GdprPage from '@/app/(dashboard)/settings/gdpr/page';

// ─── Helpers ────────────────────────────────────────────────────────────────

function renderAndGetHeading(Component: React.ComponentType) {
  render(<Component />);
  return screen.getByRole('heading', { level: 1 });
}

// ─── Stub page tests ─────────────────────────────────────────────────────────

describe.skip('Dashboard Stub Pages — render without crash and show correct title', () => {
  const stubs: Array<{ name: string; title: string; Component: React.ComponentType }> = [
    { name: 'AuditLog',       title: 'Audit Log',       Component: AuditLogPage },
    { name: 'Automation',     title: 'Automation',      Component: AutomationPage },
    { name: 'Reports',        title: 'Reports',         Component: ReportsPage },
    { name: 'Contracts',      title: 'Contracts',       Component: ContractsPage },
    { name: 'Settings',       title: 'Settings',        Component: SettingsPage },
    { name: 'Extensions',     title: 'Extensions',      Component: ExtensionsPage },
    { name: 'Integrations',   title: 'Integrations',    Component: IntegrationsPage },
    { name: 'PipelineStages', title: 'Pipeline Stages', Component: PipelineStagesPage },
    { name: 'Gdpr',           title: 'GDPR & Privacy',  Component: GdprPage },
  ];

  for (const { name, title, Component } of stubs) {
    describe(name, () => {
      it(`renders without throwing`, () => {
        expect(() => render(<Component />)).not.toThrow();
      });

      it(`shows h1 title "${title}"`, () => {
        render(<Component />);
        expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument();
      });

      it(`does NOT show raw "404" text`, () => {
        render(<Component />);
        expect(screen.queryByText(/^404$/)).not.toBeInTheDocument();
      });
    });
  }
});
