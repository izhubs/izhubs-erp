import ComingSoon from '@izerp-theme/components/ui/ComingSoon';

export const metadata = { title: 'Integrations — izhubs ERP' };

export default function IntegrationsPage() {
  return (
    <ComingSoon
      title="Integrations"
      milestone="v0.2"
      description="Connect izhubs ERP to your other tools via outbound webhooks and API keys."
      plannedFeatures={[
        'Outbound webhooks (send events to n8n, Zapier, Make)',
        'Public API key management',
        'Google Contacts sync',
        'Telegram / Zalo / Slack notification channels',
      ]}
    />
  );
}
