import { PublicFormView } from '@/components/plugins/izform/PublicFormView';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  return { title: 'Form — izhubs ERP' };
}

export default async function PublicFormPage({ params }: Props) {
  const { id } = await params;
  return <PublicFormView formId={id} />;
}
