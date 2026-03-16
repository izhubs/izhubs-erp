import { listCustomFields } from '@/core/engine/custom-fields';
import CustomFieldsManager from '@/components/custom-fields/CustomFieldsManager';

export const metadata = { title: 'Custom Fields — izhubs ERP' };

export default async function CustomFieldsPage() {
  const fields = await listCustomFields(); // all entity types

  return (
    <div>
      <div className="page-header">
        <h1>Custom Fields</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
          Extend contacts, deals, companies, and activities with your own data.
        </p>
      </div>
      <CustomFieldsManager initialFields={fields} />
    </div>
  );
}
