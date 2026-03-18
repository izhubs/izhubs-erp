// =============================================================
// hooks/useContacts.ts
// TanStack Query hooks for contacts data fetching.
// Provides: list, single, create, update, archive with
// optimistic updates and automatic cache invalidation.
// =============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiFetch';
import { useCallback } from 'react';

// ---- Types ----
export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  title?: string;
  status?: string;
  company_id?: string;
  custom_fields?: Record<string, unknown>;
  created_at?: string;
}

export interface ContactsPage {
  data: Contact[];
  total: number;
  page: number;
  pageSize: number;
}

interface ContactFilters {
  status?: string;
  page?: number;
  pageSize?: number;
  q?: string;
}

// ---- Query Keys ----
export const contactKeys = {
  all: ['contacts'] as const,
  list: (filters: ContactFilters) => ['contacts', 'list', filters] as const,
  detail: (id: string) => ['contacts', 'detail', id] as const,
};

// ---- List hook ----
export function useContacts(filters: ContactFilters = {}) {
  const { status = '', page = 1, pageSize = 20, q = '' } = filters;
  const params = new URLSearchParams({
    ...(status ? { status } : {}),
    ...(q ? { q } : {}),
    page: String(page),
    pageSize: String(pageSize),
  });

  return useQuery({
    queryKey: contactKeys.list(filters),
    queryFn: async (): Promise<ContactsPage> => {
      const res = await apiFetch(`/api/v1/contacts?${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to load contacts');
      return json;
    },
    placeholderData: (prev) => prev, // keep stale data while loading next page
  });
}

// ---- Single contact ----
export function useContact(id: string) {
  return useQuery({
    queryKey: contactKeys.detail(id),
    queryFn: async (): Promise<Contact> => {
      const res = await apiFetch(`/api/v1/contacts/${id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Contact not found');
      return json.data ?? json;
    },
    enabled: Boolean(id),
  });
}

// ---- Create mutation ----
export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Contact>) => {
      const res = await apiFetch('/api/v1/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to create contact');
      return json.data ?? json;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: contactKeys.all });
    },
  });
}

// ---- Update mutation ----
export function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Contact> & { id: string }) => {
      const res = await apiFetch(`/api/v1/contacts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to update contact');
      return json.data ?? json;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: contactKeys.all });
      qc.invalidateQueries({ queryKey: contactKeys.detail(vars.id) });
    },
  });
}

// ---- Archive mutation ----
export function useArchiveContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/api/v1/contacts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to archive contact');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: contactKeys.all });
    },
  });
}

// ---- Prefetch helper ----
export function usePrefetchContact() {
  const qc = useQueryClient();
  return useCallback((id: string) => {
    qc.prefetchQuery({
      queryKey: contactKeys.detail(id),
      queryFn: async () => {
        const res = await apiFetch(`/api/v1/contacts/${id}`);
        return (await res.json()).data;
      },
    });
  }, [qc]);
}
