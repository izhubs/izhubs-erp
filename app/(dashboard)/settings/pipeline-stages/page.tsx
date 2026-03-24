import ComingSoon from '@izerp-theme/components/ui/ComingSoon';

export const metadata = { title: 'Pipeline Stages — izhubs ERP' };

export default function PipelineStagesPage() {
  return (
    <ComingSoon
      title="Pipeline Stages"
      milestone="v0.2"
      description="Customize your deal pipeline with your own stage names and order."
      plannedFeatures={[
        'Rename, reorder, add, and archive stages',
        'Color-code stages for visual clarity',
        'Multiple pipelines per workspace',
        'Migrate existing deals when stages change',
      ]}
    />
  );
}
