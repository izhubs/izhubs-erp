'use client';

import { useState, useEffect } from 'react';
import { IzButton } from '@izerp-theme/components/ui/IzButton';
import { IzBadge } from '@izerp-theme/components/ui/IzBadge';
import { Facebook, Link2, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import cx from 'clsx';

interface AdAccount {
  id: string;
  external_account_id: string;
  name: string;
  currency: string;
  is_sync_enabled: boolean;
  last_synced_at?: string;
}

interface SocialPage {
  id: string;
  external_page_id: string;
  name: string;
  is_sync_enabled: boolean;
  last_synced_at?: string;
}

interface Connection {
  id: string;
  provider: 'facebook' | 'google_ads' | 'tiktok';
  status: 'active' | 'disconnected' | 'error';
  adAccounts: AdAccount[];
  socialPages: SocialPage[];
  updated_at: string;
}


export default function IntegrationsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConnections();
  }, []);

  async function loadConnections() {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/integrations');
      const json = await res.json();
      if (json.success) {
        setConnections(json.data.connections);
      }
    } catch (e) {
      console.error('Failed to load connections', e);
    } finally {
      setLoading(false);
    }
  }

  const [connectingFb, setConnectingFb] = useState(false);

  async function toggleAdAccount(connectionId: string, accountId: string, currentEnabled: boolean) {
    try {
      const res = await fetch(`/api/v1/integrations/ad-accounts/${accountId}/sync`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !currentEnabled })
      });
      const json = await res.json();
      if (json.success) {
        setConnections(prev => prev.map(conn => {
          if (conn.id !== connectionId) return conn;
          return {
            ...conn,
            adAccounts: conn.adAccounts.map(acc => acc.id === accountId ? { ...acc, is_sync_enabled: !currentEnabled } : acc)
          };
        }));
      }
    } catch (e) {
      alert('Failed to update sync settings');
    }
  }

  async function toggleSocialPage(connectionId: string, pageId: string, currentEnabled: boolean) {
    try {
      const res = await fetch(`/api/v1/integrations/social-pages/${pageId}/sync`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !currentEnabled })
      });
      const json = await res.json();
      if (json.success) {
        setConnections(prev => prev.map(conn => {
          if (conn.id !== connectionId) return conn;
          return {
            ...conn,
            socialPages: conn.socialPages.map(page => page.id === pageId ? { ...page, is_sync_enabled: !currentEnabled } : page)
          };
        }));
      }
    } catch (e) {
      alert('Failed to update sync settings');
    }
  }

  const handleConnectFacebook = async () => {
    setConnectingFb(true);
    try {
      const res = await fetch('/api/v1/integrations/facebook/auth', { method: 'POST' });
      const json = await res.json();
      if (json.success && json.data.redirectUrl) {
        window.location.href = json.data.redirectUrl;
      } else {
        const msg = typeof json.error === 'string' ? json.error : json.error?.message || 'Unknown error';
        alert('Could not start OAuth flow: ' + msg);
      }
    } catch (e) {
      alert('Network error while connecting to Facebook');
    } finally {
      setConnectingFb(false);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>Integration Hub</h1>
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
          Manage your digital advertising and social connections
        </div>
      </div>

      {/* Available Integrations Grid */}
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Available Integrations</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginBottom: 40 }}>
        
        {/* Facebook Hub Card */}
        <div style={{ 
          background: 'var(--color-bg-card)', 
          border: '1px solid var(--color-border)', 
          borderRadius: 'var(--radius-lg)', 
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ 
              width: 48, height: 48, borderRadius: 8, 
              background: '#E8F4FD', color: '#1877F2',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Facebook size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Facebook / Meta</h3>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>Ads & Organic Page Insights</p>
            </div>
          </div>
          
          <IzButton variant="outline" disabled={connectingFb} style={{ width: '100%', display: 'flex', gap: 8 }} onClick={handleConnectFacebook}>
            <Link2 size={16} /> {connectingFb ? 'Starting Auth...' : 'Connect Account'}
          </IzButton>
        </div>

        {/* Google Ads Placeholder */}
        <div style={{ 
          background: 'var(--color-bg-subtle)', 
          border: '1px dashed var(--color-border)', 
          borderRadius: 'var(--radius-lg)', 
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          opacity: 0.7
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ 
              width: 48, height: 48, borderRadius: 8, 
              background: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 700
            }}>
              G
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Google Ads</h3>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>MCC Accounts Sync (Phase 5)</p>
            </div>
          </div>
          <IzButton variant="secondary" disabled style={{ width: '100%' }}>
            Coming Soon
          </IzButton>
        </div>
      </div>

      {/* Connected Accounts */}
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Your Connections</h2>
      
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <RefreshCw size={24} className="spin" style={{ marginBottom: 16, opacity: 0.5 }} />
          <div>Loading connections...</div>
        </div>
      ) : connections.length === 0 ? (
        <div style={{ 
          padding: 40, textAlign: 'center', 
          background: 'var(--color-bg-card)', 
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)'
        }}>
          <div style={{ color: 'var(--color-text-muted)', marginBottom: 8 }}>No active connections found.</div>
          <p style={{ fontSize: 13, color: 'var(--color-text-subtle)' }}>
            Connect an account above to start syncing metrics and generating automated expenses.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {connections.map(conn => (
            <div key={conn.id} style={{ 
              background: 'var(--color-bg-card)', 
              border: `1px solid ${conn.status === 'error' ? 'var(--color-destructive)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden'
            }}>
              {/* Connection Header */}
              <div style={{ 
                padding: '16px 20px', 
                borderBottom: '1px solid var(--color-border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: conn.status === 'error' ? 'var(--color-destructive-muted)' : 'transparent'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Facebook size={20} color="#1877F2" />
                  <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{conn.provider} Connection</span>
                  
                  {conn.status === 'active' && <IzBadge variant="success" style={{ display: 'flex', gap: 4 }}><CheckCircle2 size={12} /> Active</IzBadge>}
                  {conn.status === 'error' && <IzBadge variant="destructive" style={{ display: 'flex', gap: 4 }}><AlertCircle size={12} /> Disconnected (Action Required)</IzBadge>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                  Connected on {new Date(conn.updated_at).toLocaleDateString()}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 1, background: 'var(--color-border)' }}>
                
                {/* Ad Accounts Section */}
                <div style={{ padding: 20, background: 'var(--color-bg-card)' }}>
                  <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Ad Accounts ({conn.adAccounts.length})
                  </h4>
                  
                  {conn.adAccounts.length === 0 ? (
                    <div style={{ fontSize: 13, color: 'var(--color-text-subtle)' }}>No ad accounts found.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {conn.adAccounts.map(account => (
                        <div key={account.id} style={{ 
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: 10, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                          background: account.is_sync_enabled ? 'var(--color-bg-subtle)' : 'transparent'
                        }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 500, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{account.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                              {account.external_account_id} • {account.currency}
                            </div>
                          </div>
                          <IzButton 
                            size="sm" 
                            variant={account.is_sync_enabled ? 'secondary' : 'outline'}
                            onClick={() => toggleAdAccount(conn.id, account.id, account.is_sync_enabled)}
                            style={{ height: 28, fontSize: 11, padding: '0 8px' }}
                          >
                            {account.is_sync_enabled ? 'Syncing' : 'Off'}
                          </IzButton>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Social Pages Section */}
                <div style={{ padding: 20, background: 'var(--color-bg-card)' }}>
                  <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Social Pages ({conn.socialPages?.length || 0})
                  </h4>
                  
                  {!conn.socialPages || conn.socialPages.length === 0 ? (
                    <div style={{ fontSize: 13, color: 'var(--color-text-subtle)' }}>No Facebook pages found.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {conn.socialPages.map(page => (
                        <div key={page.id} style={{ 
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: 10, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                          background: page.is_sync_enabled ? 'var(--color-bg-subtle)' : 'transparent'
                        }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 500, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{page.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                              ID: {page.external_page_id}
                            </div>
                          </div>
                          <IzButton 
                            size="sm" 
                            variant={page.is_sync_enabled ? 'secondary' : 'outline'}
                            onClick={() => toggleSocialPage(conn.id, page.id, page.is_sync_enabled)}
                            style={{ height: 28, fontSize: 11, padding: '0 8px' }}
                          >
                            {page.is_sync_enabled ? 'Syncing' : 'Off'}
                          </IzButton>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
