'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { History, FilterX } from 'lucide-react';
import { IzSheet, IzSheetContent, IzSheetHeader, IzSheetBody, IzSheetTitle } from '@/components/ui/IzSheet';
import { IzSelect } from '@/components/ui/IzSelect';
import { ActivityTimeline } from '@/components/shared/ActivityTimeline';

export function GlobalHistorySlideOver({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const pathname = usePathname();
  const [filterType, setFilterType] = useState<string>('all');

  // Auto-detect entity type based on pathname when the sheet opens
  useEffect(() => {
    if (open) {
      if (pathname.includes('/deals'))            setFilterType('deals');
      else if (pathname.includes('/contacts'))    setFilterType('contacts');
      else if (pathname.includes('/companies'))   setFilterType('companies');
      else if (pathname.includes('/service-packages')) setFilterType('service_packages');
      else setFilterType('all');
    }
  }, [open, pathname]);

  const HISTORY_MODULES = [
    { label: 'All Activity',      value: 'all'               },
    { label: 'Deals',             value: 'deals'             },
    { label: 'Contacts',          value: 'contacts'          },
    { label: 'Companies',         value: 'companies'         },
    { label: 'Service Packages',  value: 'service_packages'  },
    { label: 'Notes',             value: 'notes'             },
  ];

  const currentSelection = HISTORY_MODULES.find(m => m.value === filterType) || HISTORY_MODULES[0];

  return (
    <IzSheet open={open} onOpenChange={onOpenChange}>
      <IzSheetContent size="md">
        <IzSheetHeader style={{ paddingBottom: '16px', borderBottom: '1px solid var(--color-border)' }}>
          <IzSheetTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={20} style={{ color: 'var(--color-primary)' }} />
            System History
          </IzSheetTitle>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            View recent changes across your workspace
          </p>
        </IzSheetHeader>

        <IzSheetBody style={{ padding: '0px' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-subtle)' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '6px' }}>
              Filter by Module
            </label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <IzSelect
                  value={currentSelection}
                  onChange={(opt: any) => setFilterType(opt.value)}
                  options={HISTORY_MODULES}
                />
              </div>
              {filterType !== 'all' && (
                <button 
                  onClick={() => setFilterType('all')}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-danger)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  <FilterX size={14} /> Clear
                </button>
              )}
            </div>
          </div>

          <div style={{ padding: '24px 16px' }}>
            <ActivityTimeline 
              entityType={filterType === 'all' ? undefined : filterType} 
              // entityId is omitted so it fetches global history
            />
          </div>
        </IzSheetBody>
      </IzSheetContent>
    </IzSheet>
  );
}
