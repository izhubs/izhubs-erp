import { PublicFormView } from '@izerp-plugin/components/plugins/izform/PublicFormView';
import { db } from '@/core/engine/db';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  try {
    const res = await db.query('SELECT name FROM iz_forms WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (res.rowCount && res.rowCount > 0 && res.rows[0]?.name) {
      return { title: `${res.rows[0].name}` };
    }
  } catch (e) {}
  return { title: 'Form — izhubs ERP' };
}

export default async function PublicFormPage({ params }: Props) {
  const { id } = await params;
  
  try {
    const formRes = await db.query('SELECT * FROM iz_forms WHERE id = $1 AND is_active = true AND deleted_at IS NULL', [id]);
    if (formRes.rowCount === 0) {
      return <PublicFormView formId={id} error="Form not found or inactive" />;
    }
    
    const dbRow = formRes.rows[0];
    const initialForm = {
      id: dbRow.id,
      tenantId: dbRow.tenant_id,
      name: dbRow.name,
      description: dbRow.description,
      fields: typeof dbRow.fields === 'string' ? JSON.parse(dbRow.fields) : dbRow.fields,
      isActive: dbRow.is_active,
      webhookUrl: dbRow.webhook_url,
      autoConvertLead: dbRow.auto_convert_lead,
      createdAt: dbRow.created_at
    };
    
    return <PublicFormView formId={id} initialForm={initialForm as any} />;
  } catch (err: any) {
    return <PublicFormView formId={id} error={err.message || "Error loading form"} />;
  }
}
