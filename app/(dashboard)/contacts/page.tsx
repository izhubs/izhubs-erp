import { listContacts } from '@/core/engine/contacts';
import ContactsTable from '@/components/contacts/ContactsTable';

export const metadata = { title: 'Contacts — izhubs ERP' };

export default async function ContactsPage() {
  const { data: contacts } = await listContacts({ limit: 200 });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header" style={{ flexShrink: 0 }}>
        <h1>Contacts</h1>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <ContactsTable initialContacts={contacts} />
      </div>
    </div>
  );
}
