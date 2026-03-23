import { listProjects } from '@/core/engine/izlanding';
import { IzLandingProjectsClient } from '@/components/plugins/izlanding/IzLandingProjects';
import RequireModule from '@/components/providers/RequireModule';
import { cookies } from 'next/headers';
import { db } from '@/core/engine/db';
import { verifyJwt } from '@/core/engine/auth/jwt';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Landing Pages — izhubs ERP',
  description: 'Tạo landing page siêu tốc bằng AI — Prompt-to-Website',
};

export default async function IzLandingPage() {
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

  const projects = await listProjects(tenantId);

  const configRes = await db.query(
    `SELECT config FROM tenant_modules WHERE tenant_id = $1 AND module_id = 'izlanding'`,
    [tenantId]
  );
  const hasApiKey = !!configRes.rows[0]?.config?.gemini_api_key;

  const serialized = projects.map(p => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return (
    <RequireModule moduleId="izlanding">
      <IzLandingProjectsClient 
        initialProjects={serialized as any} 
        hasApiKey={hasApiKey}
      />
    </RequireModule>
  );
}
