import ComingSoon from '@izerp-theme/components/ui/ComingSoon';

export const metadata = { title: 'Extensions — izhubs ERP' };

export default function ExtensionsPage() {
  return (
    <ComingSoon
      title="Extensions"
      milestone="v0.3"
      description="Install community extensions to add capabilities to your workspace."
      plannedFeatures={[
        'Extension marketplace browser',
        'One-click install and enable/disable',
        'Extensions communicate via EventBus — never touch core data directly',
        'Community: build and publish your own',
      ]}
    />
  );
}
