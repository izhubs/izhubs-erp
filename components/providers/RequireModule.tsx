import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/core/engine/auth/jwt';
import { checkModuleAccess } from '@/core/engine/modules';

/**
 * Server Component Wrapper to protect Plugin UI routes.
 * 
 * Flow:
 * 1. Reads JWT cookie to get `tenantId` and `role`
 * 2. Checks DB (via engine) if module is active AND role is allowed.
 * 3. Blocks access (Empty State) if unauthorized, renders children if OK.
 */
export default async function RequireModule({
  moduleId,
  children,
}: {
  moduleId: string;
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('hz_access')?.value;

  if (!token) {
    redirect('/login');
  }

  try {
    const claims = await verifyJwt(token);
    const tenantId = claims.tenantId;
    const role = claims.role ?? 'member';

    if (!tenantId) {
      redirect('/login');
    }

    const isAllowed = await checkModuleAccess(tenantId, moduleId, role);

    if (!isAllowed) {
      // Return a professional empty state block instead of a raw 403
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '60vh',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--color-text-strong)' }}>
            Bạn không có quyền truy cập
          </h2>
          <p style={{ color: 'var(--color-text-subtle)', maxWidth: '400px' }}>
            Plugin này chưa được cài đặt cho công ty của bạn, hoặc phân quyền (Role) hiện tại của bạn không được phép sử dụng. Vui lòng liên hệ Quản trị viên.
          </p>
        </div>
      );
    }

    return <>{children}</>;
  } catch (error) {
    redirect('/login');
  }
}
