import { NextRequest, NextResponse } from 'next/server';
import { getFormPublic } from '@/core/engine/izform';

/**
 * GET /api/v1/public/forms/[formId]
 * Public endpoint — returns form metadata (fields, name, etc.) for rendering.
 * No auth required. Only returns active, non-deleted forms.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params;

  const form = await getFormPublic(formId);
  if (!form) {
    return NextResponse.json(
      { success: false, error: { message: 'Form not found or inactive' } },
      { status: 404 }
    );
  }

  // Only expose safe fields (no webhookUrl, no autoConvertLead, no tenantId)
  return NextResponse.json({
    success: true,
    data: {
      id: form.id,
      name: form.name,
      description: form.description,
      fields: form.fields,
    },
  });
}
