import { PublicFormView } from '@/components/plugins/izform/PublicFormView';
import { db } from '@/core/engine/db';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  try {
    const res = await db.query('SELECT name FROM izform_forms WHERE id = $1', [id]);
    if (res.rowCount && res.rowCount > 0 && res.rows[0]?.name) {
      return { title: `${res.rows[0].name}` };
    }
  } catch (e) {}
  return { title: 'Form — izhubs ERP' };
}

export default async function PublicFormPage({ params }: Props) {
  const { id } = await params;
  
  try {
    const formRes = await db.query('SELECT * FROM izform_forms WHERE id = $1 AND is_active = true', [id]);
    if (formRes.rowCount === 0) {
      return <PublicFormView formId={id} error="Form not found or inactive" />;
    }
    
    const fieldsRes = await db.query('SELECT * FROM izform_fields WHERE form_id = $1 ORDER BY position ASC', [id]);
    const initialForm = {
      ...formRes.rows[0],
      fields: fieldsRes.rows
    };
    
    return <PublicFormView formId={id} initialForm={initialForm as any} />;
  } catch (err: any) {
    return <PublicFormView formId={id} error={err.message || "Error loading form"} />;
  }
}
