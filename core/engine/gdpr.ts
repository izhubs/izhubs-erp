import { db } from '@/core/engine/db';

// =============================================================
// GDPR Engine — Right to Erasure (Phase 1.4)
// Anonymizes a user: wipes all PII (email, name, phone) → [removed].
// Preserves all business records (contacts, deals, notes) for audit.
// Only core/engine/ may call db.query() directly.
// =============================================================

export interface AnonymizeResult {
  userId: string;
  anonymizedAt: Date;
}

/**
 * Anonymize a user (GDPR Right to Erasure).
 * Sets email → "[removed]@anonymized.invalid", name → "[removed]", clears phone.
 * Sets anonymized_at so login is permanently blocked.
 */
export async function anonymizeUser(userId: string): Promise<AnonymizeResult | null> {
  const result = await db.query(
    `UPDATE users
     SET
       email         = $1,
       name          = '[removed]',
       password_hash = '[removed]',
       anonymized_at = NOW(),
       updated_at    = NOW()
     WHERE id = $2
       AND anonymized_at IS NULL
     RETURNING id, anonymized_at`,
    [`[removed]-${userId}@anonymized.invalid`, userId]
  );

  if ((result.rowCount ?? 0) === 0) return null;

  return {
    userId: result.rows[0].id as string,
    anonymizedAt: result.rows[0].anonymized_at as Date,
  };
}

/**
 * Check if a user is anonymized (called by login route).
 */
export async function isAnonymized(userId: string): Promise<boolean> {
  const result = await db.query(
    `SELECT anonymized_at FROM users WHERE id = $1`,
    [userId]
  );
  return !!result.rows[0]?.anonymized_at;
}
