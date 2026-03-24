import ComingSoon from '@izerp-theme/components/ui/ComingSoon';

export const metadata = { title: 'GDPR & Privacy — izhubs ERP' };

export default function GdprPage() {
  return (
    <ComingSoon
      title="GDPR & Privacy"
      milestone="v0.2"
      description="Tools to help you comply with privacy regulations."
      plannedFeatures={[
        'Contact data export (right to portability)',
        'Contact deletion request workflow (right to erasure)',
        'Consent tracking per contact',
        'Data retention policy settings',
      ]}
    />
  );
}
