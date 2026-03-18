// =============================================================
// hooks/useDeals.ts
// TanStack Query hooks for deals data fetching.
// =============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiFetch';

// ---- Types ----
export interface Deal {
  id: string;
  name: string;
  value: number;
  stage: string;
  contact_id?: string;
  company_id?: string;
  owner_id?: string;
  custom_fields?: Record<string, unknown>;
  created_at?: string;
}

// ---- Query Keys ----
export const dealKeys = {
  all: ['deals'] as const,
  list: (stage?: string) => ['deals', 'list', stage ?? 'all'] as const,
  detail: (id: string) => ['deals', 'detail', id] as const,
};

// ---- List hook ----
export function useDeals(stage?: string) {
  const params = stage ? `?stage=${encodeURIComponent(stage)}` : '';
  return useQuery({
    queryKey: dealKeys.list(stage),
    queryFn: async (): Promise<{ data: Deal[]; total: number }> => {
      const res = await apiFetch(`/api/v1/deals${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to load deals');
      return json;
    },
    placeholderData: (prev) => prev,
  });
}

// ---- Single deal ----
export function useDeal(id: string) {
  return useQuery({
    queryKey: dealKeys.detail(id),
    queryFn: async (): Promise<Deal> => {
      const res = await apiFetch(`/api/v1/deals/${id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Deal not found');
      return json.data ?? json;
    },
    enabled: Boolean(id),
  });
}

// ---- Create mutation ----
export function useCreateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Deal>) => {
      const res = await apiFetch('/api/v1/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to create deal');
      return json.data ?? json;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: dealKeys.all }),
  });
}

// ---- Update stage (optimistic) ----
export function useMoveDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: string }) => {
      const res = await apiFetch(`/api/v1/deals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to move deal');
      return json.data ?? json;
    },
    // Optimistic update — immediately show new stage, revert on error
    onMutate: async ({ id, stage }) => {
      await qc.cancelQueries({ queryKey: dealKeys.all });
      const prev = qc.getQueriesData({ queryKey: dealKeys.all });
      qc.setQueriesData({ queryKey: dealKeys.all }, (old: unknown) => {
        if (!old || typeof old !== 'object') return old;
        const list = old as { data: Deal[] };
        if (!Array.isArray(list.data)) return old;
        return { ...list, data: list.data.map(d => d.id === id ? { ...d, stage } : d) };
      });
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) {
        context.prev.forEach(([key, val]) => qc.setQueryData(key, val));
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: dealKeys.all }),
  });
}

// ---- Archive mutation ----
export function useArchiveDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/api/v1/deals/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to archive deal');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: dealKeys.all }),
  });
}
