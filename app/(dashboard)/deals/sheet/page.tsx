'use client';

import * as React from 'react';
import { SheetView, EditableCell } from '@/components/ui/SmartGrid';
import { useDeals, useUpdateDeal, useBulkDeleteDeals, useCreateDeal } from '@/hooks/useDeals';
import { useSheetPermissions } from '@/hooks/useSheetPermissions';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import type { Deal } from '@/hooks/useDeals';

const formatVnd = (v: number) => {
  if (!v) return '—';
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}Tỷ`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}M`;
  return new Intl.NumberFormat('vi-VN').format(v);
};

const columns: ColumnDef<Deal, any>[] = [
  { id: 'name',  accessorKey: 'name',  header: 'Tên deal',   cell: (ctx) => <EditableCell context={ctx} />, size: 250 },
  {
    id: 'value', accessorKey: 'value', header: 'Giá trị',
    cell: (ctx) => {
      const raw = ctx.getValue() as number;
      return <span style={{ color: 'var(--color-success)', fontVariantNumeric: 'tabular-nums' }}>{formatVnd(raw)}</span>;
    },
    size: 140,
  },
  { id: 'stage', accessorKey: 'stage', header: 'Giai đoạn', cell: (ctx) => <EditableCell context={ctx} />, size: 150 },
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
        toolbarExtra={
          <Link href="/deals" className="btn btn-ghost" style={{ fontSize: 'var(--font-size-sm)' }}>
            ← Pipeline
          </Link>
        }
      />
    </div>
  );
}
