// =============================================================
// hooks/index.ts — barrel export for all app hooks
// =============================================================

export { useContacts, useContact, useCreateContact, useUpdateContact, useArchiveContact, usePrefetchContact, useBulkDeleteContacts, contactKeys } from './useContacts';
export type { Contact, ContactsPage } from './useContacts';

export { useDeals, useDeal, useCreateDeal, useUpdateDeal, useMoveDeal, useArchiveDeal, useBulkDeleteDeals, dealKeys } from './useDeals';
export type { Deal } from './useDeals';

export { useSheetPermissions } from './useSheetPermissions';
export type { SheetPermissions } from './useSheetPermissions';
