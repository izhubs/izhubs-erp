import { withPermission } from '@/core/engine/rbac';
import { ApiResponse } from '@/core/engine/response';
import { getIntegrationConnections, getAdAccounts, getSocialPages, IntegrationConnection, AdAccount, SocialPage } from '@/core/engine/integrations';

export const GET = withPermission('settings:manage', async (req, claims) => {
  try {
    const tenantId = claims.tenantId!;
    
    // Fetch connections, ad accounts, and social pages
    const [connections, adAccounts, socialPages] = await Promise.all([
      getIntegrationConnections(tenantId),
      getAdAccounts(tenantId),
      getSocialPages(tenantId)
    ]);

    // Map ad accounts and pages into their parent connections for easier UI rendering
    const enhancedConnections = connections.map((conn: IntegrationConnection) => ({
      ...conn,
      adAccounts: adAccounts.filter((acc: AdAccount) => acc.connection_id === conn.id),
      socialPages: socialPages.filter((page: SocialPage) => page.connection_id === conn.id)
    }));



    return ApiResponse.success({
      connections: enhancedConnections
    });
  } catch (error) {
    return ApiResponse.serverError(error, 'integrations.list');
  }
});
