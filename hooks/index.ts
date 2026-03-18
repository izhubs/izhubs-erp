// =============================================================
// hooks/index.ts — barrel export for all app hooks
// =============================================================

export { useContacts, useContact, useCreateContact, useUpdateContact, useArchiveContact, usePrefetchContact, contactKeys } from './useContacts';
export type { Contact, ContactsPage } from './useContacts';

export { useDeals, useDeal, useCreateDeal, useMoveDeal, useArchiveDeal, dealKeys } from './useDeals';
export type { Deal } from './useDeals';
