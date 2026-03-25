import { withPermission } from '@/core/engine/rbac';
import { ApiResponse } from '@/core/engine/response';

export const POST = withPermission('settings:manage', async (req, claims) => {
  const tenantId = claims.tenantId;
  const userId = claims.sub;

  if (!tenantId || !userId) {
    return ApiResponse.error('Unauthorized. Please log in first.', 401);
  }

  // Use environment variables or placeholders for development
  const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || 'FACEBOOK_APP_ID_PLACEHOLDER';
  
  // Create a callback URL that Facebook redirects back to.
  const callbackUrl = `${new URL(req.url).origin}/api/v1/integrations/facebook/callback`;

  // We pass the tenantId and userId in the "state" parameter so we know WHO 
  // this OAuth token belongs to when Facebook redirects them back.
  const stateData = JSON.stringify({
    tenantId: tenantId,
    userId: userId
  });
  const encodedState = Buffer.from(stateData).toString('base64');

  // Requesting scopes for Business Manager Ad Accounts and Organic Pages
  const scopes = [
    'ads_read', 
    'read_insights', 
    'pages_show_list', 
    'pages_read_engagement'
  ].join(',');

  // --- Real Implementation Below ---
  const fbAuthUrl = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(callbackUrl)}&state=${encodedState}&scope=${scopes}`;
  
  return ApiResponse.success({ redirectUrl: fbAuthUrl });
});
