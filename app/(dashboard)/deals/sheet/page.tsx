'use client';

import * as React from 'react';
import { SheetView, EditableCell } from '@/components/ui/SmartGrid';
import { useDeals, useUpdateDeal, useBulkDeleteDeals } from '@/hooks/useDeals';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import type { Deal } from '@/hooks/useDeals';

// Shared column: currrency formatter for value
const formatVnd = (v: number) => {
  if (!v) return '—';
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}Tỷ`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}M`;
  return new Intl.NumberFormat('vi-VN').format(v);
};

const columns: ColumnDef<Deal, any>[] = [
  { id: 'name',  accessorKey: 'name',  header: 'Tên deal',     cell: (ctx) => <EditableCell context={ctx} />, size: 250 },
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
  const updateMutation = useUpdateDeal();
  const bulkDeleteMutation = useBulkDeleteDeals();

  const deals = dealsResponse?.data ?? [];

  const handleUpdateData = React.useCallback(
    (rowIndex: number, columnId: string, value: unknown) => {
      const deal = deals[rowIndex];
      if (!deal || deal[columnId as keyof Deal] === value) return;
      updateMutation.mutate({ id: deal.id, [columnId]: value });
    },
    [deals, updateMutation]
  );

  const handleDeleteRows = (ids: string[]) => {
    bulkDeleteMutation.mutate(ids);
  };

  return (
    <SheetView
      title="Deals"
      columns={columns}
      data={deals}
      isLoading={isLoading}
      onUpdateData={handleUpdateData}
      onDeleteRows={handleDeleteRows}
      // onAddRow — wired to "New Deal" modal (not yet built inline, so omit for V1 to avoid empty click)
      toolbarExtra={
        <Link href="/deals" className="btn btn-ghost" style={{ fontSize: 'var(--font-size-sm)' }}>
          ← Pipeline
        </Link>
      }
    />
  );
}
