'use client';

import React from 'react';
import { IzModal, IzModalContent, IzModalHeader, IzModalTitle, IzModalBody, IzModalFooter } from '@izerp-theme/components/ui/IzModal';
import { IzButton } from '@izerp-theme/components/ui/IzButton';
import { usePathname } from 'next/navigation';

export default function PostTourSummary({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  
  // Format the path nicely (e.g. /settings/custom-fields -> Settings Custom Fields)
  const contextName = pathname 
    ? pathname.replace(/^\//, '').split(/[-/]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'this page';

  return (
    <IzModal
      open={true}
      onOpenChange={(open) => { if (!open) onClose(); }}
    >
      <style>{`
        div[data-radix-portal] {
          z-index: 100000 !important;
        }
      `}</style>
      <IzModalContent size="md">
        <IzModalHeader>
          <IzModalTitle style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            Great job exploring {contextName}! 🎉
          </IzModalTitle>
        </IzModalHeader>
        
        <IzModalBody style={{ paddingTop: 'var(--space-2)' }}>
          <p style={{ marginBottom: 'var(--space-4)', fontSize: '1rem', color: 'var(--color-text-muted)' }}>
            You've just completed the quick tour for this section.
          </p>
          <p style={{ marginBottom: 'var(--space-6)', lineHeight: 1.6 }}>
            We hope that gave you a good overview of how the tools in this screen operate. 
            Remember, every business is unique, and you can customize these views in the Settings menu.
          </p>

          <div style={{ background: 'var(--color-bg-subtle)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: 'var(--space-3)' }}>Need more help?</h4>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <li>Click the <strong>"?"</strong> icon in the top right header anytime to restart this tour.</li>
              <li>Visit our <a href="#" style={{ color: 'var(--color-primary)', textDecoration: 'underline', fontWeight: 500 }}>Knowledge Base</a> for detailed video tutorials.</li>
              <li>Contact support if you need specialized onboarding for your team.</li>
            </ul>
          </div>
        </IzModalBody>

        <IzModalFooter style={{ marginTop: 'var(--space-6)' }}>
          <IzButton variant="ghost" onClick={onClose}>Close</IzButton>
          <IzButton variant="default" onClick={onClose}>Start Working</IzButton>
        </IzModalFooter>
      </IzModalContent>
    </IzModal>
  );
}
