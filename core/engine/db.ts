import { Pool, PoolClient } from 'pg';

// Use a single pool for the application
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:izhubs_dev_2026@localhost:5432/izhubs_erp',
});

// Helper for standardized querying
export const db = {
  query: async (text: string, params?: any[]) => {
    return pool.query(text, params);
  },

  // Get a client for transactions
  getClient: async () => {
    return pool.connect();
  },

  /**
   * Run multiple queries atomically in a transaction.
   * Automatically commits on success, rolls back on error.
   *
   * @example
   * const result = await db.withTransaction(async (client) => {
   *   await client.query('INSERT INTO contacts ...', [...])
   *   await client.query('INSERT INTO activities ...', [...])
   *   return { success: true }
   * })
   */
  withTransaction: async <T>(fn: (client: PoolClient) => Promise<T>): Promise<T> => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },
};
