// =============================================================
// izhubs ERP — Outbound Webhook Dispatcher
// Sends system events to configured webhook URLs.
// Integrates with: n8n, Zapier, Make, custom endpoints.
// =============================================================

import type { EventName, EventPayload } from '@/core/schema/events';

export async function dispatchWebhook<T extends EventName>(
  event: T,
  payload: EventPayload<T>
): Promise<void> {
  // TODO: implement
  // 1. Query active webhooks subscribed to this event from DB
  // 2. For each webhook, POST payload with HMAC signature header
  // 3. Log delivery result to webhook_deliveries table

  console.log('[webhook] stub — would dispatch:', event, 'to all subscribed webhooks');
}

export function signPayload(payload: string, secret: string): string {
  // TODO: implement HMAC-SHA256 signing
  // const crypto = await import('crypto');
  // return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return 'stub-signature';
}
