import { listForms } from '@/core/engine/izform';
import { IzFormListClient } from '@/components/plugins/izform/IzFormList';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

export const metadata = {
  title: 'izForm — izhubs ERP',
  description: 'Tạo và quản lý form thu thập lead, nhúng vào website bằng iframe',
};

export default async function IzFormPage() {
  const forms = await listForms(DEFAULT_TENANT_ID);

  const serialized = forms.map(f => ({
    ...f,
    createdAt: f.createdAt.toISOString(),
  }));

  return <IzFormListClient initialForms={serialized as any} />;
}
