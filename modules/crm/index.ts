import type { IzhubsModule } from '@/core/types/module.interface';

/**
 * CRM Module Manifest
 * The foundational module — always active.
 * Contains: Contacts, Deals, Pipeline Kanban Board.
 */
export const CRMModule: IzhubsModule = {
  id: 'crm',
  name: 'CRM Pipeline',
  version: '1.0.0',
  category: 'core',
  icon: '📊',
  description: 'Quản lý Pipeline deals và Contacts. Kanban board drag-drop, custom fields, event bus.',
  dependencies: [],
  requiredPermissions: [
    'contacts:read',
    'contacts:write',
    'contacts:delete',
    'deals:read',
    'deals:write',
    'deals:delete',
  ],
  apiPrefix: '/api/v1',
};

export default CRMModule;
