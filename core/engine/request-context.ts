/**
 * Request Context — propagates auth identity through the async call stack.
 *
 * Uses Node.js AsyncLocalStorage so any code called within a request
 * (engine functions, helpers, triggers) can read the current user/tenant
 * without needing it passed as a parameter.
 *
 * Usage:
 *   // Set at the edge (withPermission):
 *   requestContext.run({ userId: claims.sub, tenantId: claims.tenantId }, handler)
 *
 *   // Read anywhere in the call tree:
 *   const { userId } = getRequestContext() ?? {}
 */
import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContextData {
  userId: string;
  tenantId: string;
}

const storage = new AsyncLocalStorage<RequestContextData>();

/** Run a function within a request context. */
export function withRequestContext<T>(ctx: RequestContextData, fn: () => T): T {
  return storage.run(ctx, fn);
}

/** Read the current request context. Returns null outside of a request. */
export function getRequestContext(): RequestContextData | null {
  return storage.getStore() ?? null;
}
