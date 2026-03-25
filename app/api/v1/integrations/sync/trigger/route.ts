import { ApiResponse } from '@/core/engine/response';
import { withPermission } from '@/core/engine/rbac';
import { triggerNightlySync } from '@/core/engine/jobs/scheduler';

export const POST = withPermission('settings:manage', async (req) => {
  try {
    // Manually run the fan-out function to find all active ad accounts
    // and queue them into BullMQ.
    await triggerNightlySync();
    
    return ApiResponse.success({ 
      message: 'Global synchronization jobs have been enqueued successfully.' 
    });
  } catch (error: any) {
    console.error('[API] Failed to trigger sync:', error);
    return ApiResponse.error(error.message || 'Failed to trigger sync', 500);
  }
});
