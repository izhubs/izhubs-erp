'use client';

import * as React from 'react';
import { SheetView, EditableCell } from '@/components/ui/SmartGrid';
import { useDeals, useUpdateDeal, useBulkDeleteDeals, useCreateDeal } from '@/hooks/useDeals';
import { useSheetPermissions } from '@/hooks/useSheetPermissions';
import { useCurrency } from '@/lib/hooks/useCurrency';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import type { Deal } from '@/hooks/useDeals';

function ValueCell({ value: raw }: { value: number }) {
  const { fmt } = useCurrency();
  return <span style={{ color: 'var(--color-success)', fontVariantNumeric: 'tabular-nums' }}>{fmt(raw)}</span>;
}

const columns: ColumnDef<Deal, any>[] = [
  { id: 'name',  accessorKey: 'name',  header: 'Deal name', cell: (ctx) => <EditableCell context={ctx} />, size: 250 },
  {
    id: 'value', accessorKey: 'value', header: 'Value',
    cell: (ctx) => <ValueCell value={ctx.getValue() as number} />,
    size: 140,
  },
  { id: 'stage', accessorKey: 'stage', header: 'Stage', cell: (ctx) => <EditableCell context={ctx} />, size: 150,
    meta: {
      type: 'select',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Qualified', value: 'qualified' },
        { label: 'Proposal', value: 'proposal' },
        { label: 'Negotiation', value: 'negotiation' },
        { label: 'Won', value: 'won' },
        { label: 'Lost', value: 'lost' },
        { label: 'Lead', value: 'lead' },
        { label: 'Active', value: 'active' },
        { label: 'Onboarding', value: 'onboarding' },
        { label: 'Renewal', value: 'renewal' },
        { label: 'Revision', value: 'revision' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Pending', value: 'pending' },
        { label: 'Inquiry', value: 'inquiry' },
        { label: 'Reservation', value: 'reservation' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Seated', value: 'seated' },
        { label: 'Tour Scheduled', value: 'tour_scheduled' },
        { label: 'Tour Completed', value: 'tour_completed' },
        { label: 'Member Active', value: 'member_active' },
        { label: 'Consulting', value: 'consulting' },
        { label: 'Site Visit', value: 'site_visit' },
        { label: 'Closing', value: 'closing' },
        { label: 'Referred', value: 'referred' },
        { label: 'Quoted', value: 'quoted' },
      ],
    }
  },
];

export default function DealsSheetPage() {
  const { data: dealsResponse, isLoading } = useDeals();
  const updateMutation  = useUpdateDeal();
  const createMutation  = useCreateDeal();
  const deleteMutation  = useBulkDeleteDeals();
  const { canCreate, canDelete } = useSheetPermissions();

  const deals = (dealsResponse?.data ?? []) as unknown as any[];

  const handleUpdateData = React.useCallback(
    (rowIndex: number, columnId: string, value: unknown) => {
      const deal = deals[rowIndex];
      if (!deal || deal[columnId] === value) return;
      updateMutation.mutate({ id: deal.id, [columnId]: value });
    },
    [deals, updateMutation],
  );

  const handleAddRow = React.useCallback(
    (draft: Record<string, unknown>) => {
      if (!draft.name) return;
      createMutation.mutate(draft as any);
    },
    [createMutation],
  );

  return (
    <div className="page--sheet">
      <SheetView
        title="Deals"
        columns={columns}
        data={deals}
        isLoading={isLoading}
        onUpdateData={handleUpdateData}
        onAddRow={handleAddRow}
        onDeleteRows={(ids) => deleteMutation.mutate(ids)}
        canCreate={canCreate}
        canDelete={canDelete}
        pinnedColumns={['name']}
        toolbarExtra={
          <Link href="/deals" className="btn btn-ghost" style={{ fontSize: 'var(--font-size-sm)' }}>
            ← Pipeline
          </Link>
        }
      />
    </div>
  );
}
