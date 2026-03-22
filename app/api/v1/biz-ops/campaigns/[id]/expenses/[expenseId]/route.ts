import { NextResponse } from 'next/server';
import { ApiResponse } from '@/core/engine/response';
import { withModule } from '@/core/engine/rbac';
import { getExpense, updateExpense, deleteExpense, UpdateExpenseSchema } from '@/modules/biz-ops/engine/expenses';

export const GET = withModule('biz-ops', 'expenses:read', async (req, { params, tenantId }) => {
  try {
    const expense = await getExpense(tenantId, params.expenseId);
    if (!expense) return ApiResponse.notFound('Expense not found');
    return ApiResponse.success({ data: expense });
  } catch (err: any) {
    return ApiResponse.serverError(err);
  }
});

export const PATCH = withModule('biz-ops', 'expenses:write', async (req, { params, tenantId }) => {
  try {
    const body = await req.json();
    const parsed = UpdateExpenseSchema.safeParse(body);
    if (!parsed.success) return ApiResponse.validationError(parsed.error);

    const expense = await updateExpense(tenantId, params.expenseId, parsed.data);
    if (!expense) return ApiResponse.notFound('Expense not found');
    return ApiResponse.success({ data: expense });
  } catch (err: any) {
    return ApiResponse.serverError(err);
  }
});

export const DELETE = withModule('biz-ops', 'expenses:delete', async (req, { params, tenantId }) => {
  try {
    const success = await deleteExpense(tenantId, params.expenseId);
    if (!success) return ApiResponse.notFound('Expense not found');
    return ApiResponse.success({ message: 'Deleted successfully' });
  } catch (err: any) {
    return ApiResponse.serverError(err);
  }
});
