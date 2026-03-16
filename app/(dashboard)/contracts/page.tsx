import ComingSoon from '@/components/ui/ComingSoon';

export const metadata = { title: 'Contracts — izhubs ERP' };

export default function ContractsPage() {
  return (
    <ComingSoon
      title="Contracts"
      milestone="v0.2"
      description="Attach contracts to deals and contacts, track signing status."
      plannedFeatures={[
        'Upload and link PDF contracts to deals',
        'Track signing status (draft / sent / signed / expired)',
        'Expiry reminders via notification',
      ]}
    />
  );
}
