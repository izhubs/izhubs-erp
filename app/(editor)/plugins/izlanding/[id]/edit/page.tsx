import { getProject, getPageTracking } from '@/core/engine/izlanding';
import EditProjectForm from '@izerp-plugin/components/plugins/izlanding/EditProjectForm';
import RequireModule from '@/components/providers/RequireModule';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/core/engine/auth/jwt';
import { redirect, notFound } from 'next/navigation';

export const metadata = {
  title: 'Edit Landing Page — izhubs ERP',
};

export default async function EditIzLandingPage({ params }: { params: { id: string } }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('hz_access')?.value;
  if (!token) return redirect('/login');

  let tenantId = '';
  try {
    const claims = await verifyJwt(token);
    if (!claims.tenantId) throw new Error('No tenantId');
    tenantId = claims.tenantId;
  } catch {
    return redirect('/login');
  }

  const { id } = await params;
  const project = await getProject(tenantId, id);
  if (!project) return notFound();

  const tracking = await getPageTracking(id);

  const serializedProject = {
    ...project,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };

  return (
    <RequireModule moduleId="izlanding">
      <EditProjectForm
        project={serializedProject as any}
        tracking={tracking}
      />
    </RequireModule>
  );
}
