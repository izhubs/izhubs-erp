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

  // TODO: implement
  // await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ chat_id: chatId, text: message.text, parse_mode: message.parseMode }),
  // });
  console.log('[telegram] stub — would send to', chatId, ':', message.text);
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
