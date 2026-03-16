'use client';

import React from 'react';

interface ComingSoonProps {
  title: string;
  description?: string;
  /**
   * Roadmap milestone when this will be available, e.g. 'v0.2'
   */
  milestone?: string;
  /**
   * Bullet list of planned capabilities for this section
   */
  plannedFeatures?: string[];
}

/**
 * Placeholder for unimplemented pages.
 * Shows a clean, informative card so users understand what's coming
 * rather than seeing a blank screen.
 */
export default function ComingSoon({
  title,
  description,
  milestone = 'v0.2',
  plannedFeatures = [],
}: ComingSoonProps) {
  return (
    <div data-testid="coming-soon">
      <div className="page-header">
        <h1>{title}</h1>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Icon + heading */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-primary-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                flexShrink: 0,
              }}
            >
              🚧
            </div>
            <div>
              <p style={{ fontWeight: 600, margin: 0 }}>Coming in {milestone}</p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
                {description ?? `${title} is on the roadmap and will be available soon.`}
              </p>
            </div>
          </div>

          {/* Planned features list */}
          {plannedFeatures.length > 0 && (
            <div>
              <p
                style={{
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                  marginBottom: 'var(--space-2)',
                }}
              >
                Planned features
              </p>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 'var(--space-5)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-1)',
                  color: 'var(--color-text-muted)',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                {plannedFeatures.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
