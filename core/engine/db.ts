import { Pool, PoolClient } from 'pg';

// Single connection pool — max 10 to prevent exhaustion in production.
// Default pg pool is 10 but set explicitly for clarity and override safety.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:izhubs_dev_2026@localhost:5432/izhubs_erp',
  max: 10,               // max concurrent connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

console.log('[db] pool max:', 10, '| idle timeout: 30s | connect timeout: 5s');


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
