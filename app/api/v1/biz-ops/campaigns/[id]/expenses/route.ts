import { NextResponse } from 'next/server';
import { ApiResponse } from '@/core/engine/response';
import { withModule } from '@/core/engine/rbac';
import { listExpensesByCampaign, createExpense, CreateExpenseSchema } from '@/modules/biz-ops/engine/expenses';

export const GET = withModule('biz-ops', 'expenses:read', async (req, claims, ctx) => {
  const tenantId = claims.tenantId!;
  const params = ctx?.params as { id: string };
  try {
    const expenses = await listExpensesByCampaign(tenantId, params.id);
    return ApiResponse.success({ data: expenses });
  } catch (err: any) {
    return ApiResponse.serverError(err);
  }
});

export const POST = withModule('biz-ops', 'expenses:write', async (req, claims, ctx) => {
  const tenantId = claims.tenantId!;
  const params = ctx?.params as { id: string };
  try {
    const body = await req.json();
    const parsed = CreateExpenseSchema.safeParse({ ...body, campaign_id: params.id });
    if (!parsed.success) return ApiResponse.validationError(parsed.error);

    const expense = await createExpense(tenantId, parsed.data);
    return ApiResponse.success({ data: expense });
  } catch (err: any) {
    return ApiResponse.serverError(err);
  }
});
