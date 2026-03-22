import { IzFormDetail } from '@/components/plugins/izform/IzFormDetail';
import RequireModule from '@/components/providers/RequireModule';

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Form Details — izhubs ERP',
};

export default async function IzFormDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <RequireModule moduleId="izform">
      <IzFormDetail formId={id} />
    </RequireModule>
  );
}
