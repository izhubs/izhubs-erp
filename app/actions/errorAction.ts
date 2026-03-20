'use server';

import { db } from '@/core/engine/db';
import { notify } from '../../lib/messaging';

export async function reportUIError(errorInfo: { 
  message: string; 
  stack?: string; 
  digest?: string; 
  path: string;
  meta?: any; // Allows passing user inputs, component states, etc. for reproduction
}) {
  const metaObj = {
    stack: errorInfo.stack?.substring(0, 800) || 'No stack trace',
    digest: errorInfo.digest,
    path: errorInfo.path,
    ...(errorInfo.meta || {})
  };

  // 1. Log to Database for later QA/Reproduction
  try {
    await db.query(`
      INSERT INTO system_logs (level, context, message, meta)
      VALUES ($1, $2, $3, $4)
    `, ['error', 'UI_ERROR', errorInfo.message, JSON.stringify(metaObj)]);
  } catch (dbErr) {
    console.error('[ErrorAction] Failed to write to system_logs', dbErr);
  }

  // 2. Alert Telegram (Fire & Forget)
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!chatId) return;

  const text = `🚨 *IZHUBS ERP UI ERROR* 🚨
*Path:* ${errorInfo.path}
*Message:* ${errorInfo.message}`;

  notify('telegram', chatId, text).catch(console.error);
}
