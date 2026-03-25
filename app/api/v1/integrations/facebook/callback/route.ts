import { NextRequest, NextResponse } from 'next/server';
import { db, buildInsertQuery } from '@/core/engine/db';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const stateEncoded = req.nextUrl.searchParams.get('state');

  // If there's an error from Facebook (e.g. user denied)
  const errorReason = req.nextUrl.searchParams.get('error_reason');
  if (errorReason) {
    return NextResponse.redirect(new URL(`/settings/integrations?error=${errorReason}`, req.url));
  }

  if (!code || !stateEncoded) {
    return NextResponse.json({ error: 'Missing code or state parameter' }, { status: 400 });
  }

  try {
    // 1. Decode State to identify User
    const stateJson = Buffer.from(stateEncoded, 'base64').toString('utf8');
    const state = JSON.parse(stateJson);
    const { tenantId, userId } = state;

    if (!tenantId || !userId) {
      throw new Error('Invalid state payload');
    }

    const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || 'FACEBOOK_APP_ID_PLACEHOLDER';
    const appSecret = process.env.FACEBOOK_APP_SECRET || 'FACEBOOK_APP_SECRET_PLACEHOLDER';
    const redirectUri = `${req.nextUrl.origin}/api/v1/integrations/facebook/callback`;

    let accessToken = '';
    let tokenExpiration = 0;
    
    // 2. Exchange Code for Access Token
    const tokenUrl = `https://graph.facebook.com/v20.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`;
    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      console.error('FB Token Error:', tokenData.error);
      throw new Error(tokenData.error.message);
    }

    accessToken = tokenData.access_token;
    tokenExpiration = tokenData.expires_in || 5184000; // default 60 days


    // 3. Save Connection to DB
    await db.withTenantTransaction(tenantId, async (client) => {
      // Upsert integration connection
      const credentials = JSON.stringify({ access_token: accessToken, expires_in: tokenExpiration });
      
      const connResult = await client.query(`
        INSERT INTO integration_connections (tenant_id, user_id, provider, credentials, status)
        VALUES ($1, $2, $3, $4, 'active')
        ON CONFLICT (user_id, provider) DO UPDATE 
        SET credentials = EXCLUDED.credentials, status = 'active', updated_at = NOW()
        RETURNING id
      `, [tenantId, userId, 'facebook', credentials]);

      const connectionId = connResult.rows[0].id;

      // 4. Discover Ad Accounts using Graph API
      let accountsList: any[] = [];
      
      const accountsUrl = `https://graph.facebook.com/v20.0/me/adaccounts?fields=id,name,currency,timezone_name&access_token=${accessToken}`;
      const accountsRes = await fetch(accountsUrl);
      const accountsData = await accountsRes.json();
      
      if (accountsData.error) {
        console.error('FB Ad Accounts Error:', accountsData.error);
        throw new Error(accountsData.error.message);
      }
      
      accountsList = accountsData.data || [];

      if (accountsList && Array.isArray(accountsList)) {
        for (const account of accountsList) {
          const externalId = account.id;
          const name = account.name || `Ad Account ${externalId}`;
          const currency = account.currency || 'USD';
          const timezone = account.timezone_name || 'UTC';

          await client.query(`
            INSERT INTO ad_accounts (tenant_id, connection_id, platform, external_account_id, name, currency, timezone, is_sync_enabled)
            VALUES ($1, $2, 'facebook_ads', $3, $4, $5, $6, false)
            ON CONFLICT (tenant_id, platform, external_account_id) DO UPDATE 
            SET name = EXCLUDED.name, currency = EXCLUDED.currency, timezone = EXCLUDED.timezone, updated_at = NOW()
          `, [tenantId, connectionId, externalId, name, currency, timezone]);
        }
      }

      // 5. Discover Facebook Pages
      const pagesUrl = `https://graph.facebook.com/v20.0/me/accounts?fields=id,name,access_token&access_token=${accessToken}`;
      const pagesRes = await fetch(pagesUrl);
      const pagesData = await pagesRes.json();
      
      const pagesList: any[] = pagesData.data || [];

      for (const page of pagesList) {
        const extPageId = page.id;
        const pageName = page.name || `Facebook Page ${extPageId}`;
        const pageToken = page.access_token;

        await client.query(`
          INSERT INTO social_pages (tenant_id, connection_id, platform, external_page_id, name, access_token, is_sync_enabled)
          VALUES ($1, $2, 'facebook_page', $3, $4, $5, false)
          ON CONFLICT (tenant_id, platform, external_page_id) DO UPDATE 
          SET name = EXCLUDED.name, access_token = EXCLUDED.access_token, updated_at = NOW()
        `, [tenantId, connectionId, extPageId, pageName, pageToken]);
      }
    });

    // 6. Redirect back to Integration UI securely
    return NextResponse.redirect(new URL('/settings/integrations?success=facebook_connected', req.url));

  } catch (error: any) {
    console.error('OAuth Callback Error:', error);
    return NextResponse.redirect(new URL(`/settings/integrations?error=oauth_failed`, req.url));
  }
}
