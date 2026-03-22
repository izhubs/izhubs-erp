import { NextResponse } from 'next/server';
import { ApiResponse } from '@/core/engine/response';
import { withModule } from '@/core/engine/rbac';
import { getPayment, updatePayment, deletePayment, UpdatePaymentSchema } from '@/modules/biz-ops/engine/payments';

export const GET = withModule('biz-ops', 'payments:read', async (req, { params, tenantId }) => {
  try {
    const payment = await getPayment(tenantId, params.paymentId);
    if (!payment) return ApiResponse.notFound('Payment not found');
    return ApiResponse.success({ data: payment });
  } catch (err: any) {
    return ApiResponse.serverError(err);
  }
});

export const PATCH = withModule('biz-ops', 'payments:write', async (req, { params, tenantId }) => {
  try {
    const body = await req.json();
    const parsed = UpdatePaymentSchema.safeParse(body);
    if (!parsed.success) return ApiResponse.validationError(parsed.error);

    const payment = await updatePayment(tenantId, params.paymentId, parsed.data);
    if (!payment) return ApiResponse.notFound('Payment not found');
    return ApiResponse.success({ data: payment });
  } catch (err: any) {
    return ApiResponse.serverError(err);
  }
});

export const DELETE = withModule('biz-ops', 'payments:delete', async (req, { params, tenantId }) => {
  try {
    const success = await deletePayment(tenantId, params.paymentId);
    if (!success) return ApiResponse.notFound('Payment not found');
    return ApiResponse.success({ message: 'Deleted successfully' });
  } catch (err: any) {
    return ApiResponse.serverError(err);
  }
});
