import IzFormBuilder from '@/components/plugins/izform/IzFormBuilder';
import RequireModule from '@/components/providers/RequireModule';

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Edit Form — izhubs ERP',
};

export default async function EditIzFormPage({ params }: Props) {
  const { id } = await params;

  return (
    <RequireModule moduleId="izform">
      <IzFormBuilder formId={id} />
    </RequireModule>
  );
}
