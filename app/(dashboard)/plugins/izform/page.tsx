import { listForms } from '@/core/engine/izform';
import { IzFormListClient } from '@/components/plugins/izform/IzFormList';
import RequireModule from '@/components/providers/RequireModule';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/core/engine/auth/jwt';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'izForm — izhubs ERP',
  description: 'Tạo và quản lý form thu thập lead, nhúng vào website bằng iframe',
};

export default async function IzFormPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('hz_access')?.value;
  if (!token) {
    return redirect('/login');
  }

  let tenantId = '';
  try {
    const claims = await verifyJwt(token);
    if (!claims.tenantId) throw new Error('No tenantId claim');
    tenantId = claims.tenantId;
  } catch {
    return redirect('/login');
  }

  const forms = await listForms(tenantId);

  const serialized = forms.map(f => ({
    ...f,
    createdAt: f.createdAt.toISOString(),
  }));

  return (
    <RequireModule moduleId="izform">
      <IzFormListClient initialForms={serialized as any} />
    </RequireModule>
  );
}
