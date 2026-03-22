import { NextResponse } from 'next/server';
import { ApiResponse } from '@/core/engine/response';
import { withModule } from '@/core/engine/rbac';
import { listPaymentsByContract, createPayment, CreatePaymentSchema } from '@/modules/biz-ops/engine/payments';

export const GET = withModule('biz-ops', 'payments:read', async (req, { params, tenantId }: { params: { id: string }, tenantId: string }) => {
  try {
    const payments = await listPaymentsByContract(tenantId, params.id);
    return ApiResponse.success({ data: payments });
  } catch (err: any) {
    return ApiResponse.serverError(err);
  }
});

export const POST = withModule('biz-ops', 'payments:write', async (req, { params, tenantId }: { params: { id: string }, tenantId: string }) => {
  try {
    const body = await req.json();
    const parsed = CreatePaymentSchema.safeParse({ ...body, contract_id: params.id });
    if (!parsed.success) return ApiResponse.validationError(parsed.error);

    const payment = await createPayment(tenantId, parsed.data);
    return ApiResponse.success({ data: payment });
  } catch (err: any) {
    return ApiResponse.serverError(err);
  }
});
