import { listContacts, countByStatus } from '@izerp-plugin/modules/crm/engine/contacts';
import ContactsTable from '@/components/contacts/ContactsTable';

export const metadata = { title: 'Contacts — izhubs ERP' };

export default async function ContactsPage() {
  // Server-side: fetch first page + tab counts
  const [{ data: contacts, meta }, counts] = await Promise.all([
    listContacts({ limit: 25, page: 1 }),
    countByStatus(),
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header" style={{ flexShrink: 0 }}>
        <h1>Contacts</h1>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <ContactsTable
          initialContacts={contacts}
          initialMeta={meta}
          initialCounts={counts}
        />
      </div>
    </div>
  );
}
