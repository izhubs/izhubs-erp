import { NextRequest } from 'next/server';
import { ApiResponse, ErrorCodes } from '@/core/engine/response';
import { submitForm, SubmitFormSchema } from '@/core/engine/izform';

/**
 * POST /api/v1/public/forms/[formId]/submit
 * PUBLIC endpoint — no auth required. Anyone can submit.
 * Rate limiting should be applied at infra level.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    const { formId } = params;
    if (!formId) return ApiResponse.error('Form ID required', 400, {}, ErrorCodes.VALIDATION_FAILED);

    const body = await req.json();
    const parsed = SubmitFormSchema.safeParse(body);
    if (!parsed.success) return ApiResponse.validationError(parsed.error);

    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? undefined;
    const submission = await submitForm(formId, parsed.data.data, ip);

    return ApiResponse.success(
      { submissionId: submission.id, message: 'Form submitted successfully' },
      201
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.includes('not found or inactive')) {
      return ApiResponse.error(message, 404, {}, ErrorCodes.NOT_FOUND);
    }
    return ApiResponse.serverError(err, 'POST /api/v1/public/forms/[formId]/submit');
  }
}
