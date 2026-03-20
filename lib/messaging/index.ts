// =============================================================
// izhubs ERP — Messaging Connectors
// Multi-channel notifications: Telegram, Slack, Zalo OA.
// Extensions or automations can use these to send notifications.
// =============================================================

export interface Message {
  text: string;
  parseMode?: 'HTML' | 'Markdown';
}

// ---- Telegram ----
export async function sendTelegram(chatId: string, message: Message): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) { console.warn('[messaging] TELEGRAM_BOT_TOKEN not set'); return; }

  // Format required: "chatId_threadId" or just "chatId"
  const parts = chatId.split('_');
  const targetChatId = parts[0];
  const threadId = parts[1] ? parseInt(parts[1]) : undefined;

  try {
    const payload: any = { 
      chat_id: targetChatId, 
      text: message.text, 
      parse_mode: message.parseMode 
    };
    if (threadId) {
      payload.message_thread_id = threadId;
    }

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch(e) {
    console.warn('[messaging] Failed to send Telegram alert:', e);
  }
}

// ---- Slack ----
export async function sendSlack(webhookUrl: string, text: string): Promise<void> {
  // TODO: implement
  // await fetch(webhookUrl, { method: 'POST', body: JSON.stringify({ text }) });
  console.log('[slack] stub — would send:', text);
}

// ---- Zalo OA ----
export async function sendZalo(userId: string, message: string): Promise<void> {
  // TODO: implement Zalo OA Send Message API
  // https://developers.zalo.me/docs/official-account/gui-tin-nhan/gui-tin-nhan-text
  console.log('[zalo] stub — would send to', userId, ':', message);
}

// ---- Universal sender ----
export type Channel = 'telegram' | 'slack' | 'zalo';

export async function notify(
  channel: Channel,
  target: string,
  text: string
): Promise<void> {
  switch (channel) {
    case 'telegram': return sendTelegram(target, { text });
    case 'slack':    return sendSlack(target, text);
    case 'zalo':     return sendZalo(target, text);
  }
}
