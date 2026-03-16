import ComingSoon from '@/components/ui/ComingSoon';

export const metadata = { title: 'Reports — izhubs ERP' };

export default function ReportsPage() {
  return (
    <ComingSoon
      title="Reports"
      milestone="v0.2"
      description="Visual insights into your pipeline, contacts, and revenue."
      plannedFeatures={[
        'Pipeline conversion funnel',
        'Revenue by stage and time period',
        'Contact growth over time',
        'Won / Lost deal breakdown',
        'Export as PDF or CSV',
      ]}
    />
  );
}
