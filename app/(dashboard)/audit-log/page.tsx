import ComingSoon from '@/components/ui/ComingSoon';

export const metadata = { title: 'Audit Log — izhubs ERP' };

export default function AuditLogPage() {
  return (
    <ComingSoon
      title="Audit Log"
      milestone="v0.2"
      description="Track every change made in your workspace — who did what, and when."
      plannedFeatures={[
        'Full history of create / update / delete actions',
        'Filter by user, entity type, or date range',
        'Export audit trail as CSV',
      ]}
    />
  );
}
