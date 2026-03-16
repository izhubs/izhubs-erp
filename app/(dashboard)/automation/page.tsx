import ComingSoon from '@/components/ui/ComingSoon';

export const metadata = { title: 'Automation — izhubs ERP' };

export default function AutomationPage() {
  return (
    <ComingSoon
      title="Automation"
      milestone="v0.3"
      description="Build workflows that run automatically — no code needed."
      plannedFeatures={[
        'Trigger: record created / updated / stage changed',
        'Condition: field value matches rule',
        'Action: send message, update field, create activity',
        'Built-in connectors: Telegram, Zalo, Slack, Email',
      ]}
    />
  );
}
