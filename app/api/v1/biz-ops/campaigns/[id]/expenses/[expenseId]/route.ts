import { NextResponse } from 'next/server';
import { ApiResponse } from '@/core/engine/response';
import { withModule } from '@/core/engine/rbac';
import { getExpense, updateExpense, deleteExpense, UpdateExpenseSchema } from '@izerp-plugin/modules/biz-ops/engine/expenses';

export const GET = withModule('biz-ops', 'expenses:read', async (req, claims, ctx) => {
  const tenantId = claims.tenantId!;
  const params = ctx?.params as { expenseId: string };
  try {
    const expense = await getExpense(tenantId, params.expenseId);
    if (!expense) return ApiResponse.error('Expense not found', 404);
    return ApiResponse.success(expense);
  } catch (err: any) {
    return ApiResponse.serverError(err);
  }
});

export const PATCH = withModule('biz-ops', 'expenses:write', async (req, claims, ctx) => {
  const tenantId = claims.tenantId!;
  const params = ctx?.params as { expenseId: string };
  try {
    const body = await req.json();
    const parsed = UpdateExpenseSchema.safeParse(body);
    if (!parsed.success) return ApiResponse.validationError(parsed.error);

    const expense = await updateExpense(tenantId, params.expenseId, parsed.data);
    if (!expense) return ApiResponse.error('Expense not found', 404);
    return ApiResponse.success(expense);
  } catch (err: any) {
    return ApiResponse.serverError(err);
  }
});

export const DELETE = withModule('biz-ops', 'expenses:delete', async (req, claims, ctx) => {
  const tenantId = claims.tenantId!;
  const params = ctx?.params as { expenseId: string };
  try {
    const success = await deleteExpense(tenantId, params.expenseId);
    if (!success) return ApiResponse.error('Expense not found', 404);
    return ApiResponse.success({ message: 'Deleted successfully' });
  } catch (err: any) {
    return ApiResponse.serverError(err);
  }
});
