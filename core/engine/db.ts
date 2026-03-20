import { Pool, PoolClient } from 'pg';

// Single connection pool — max 10 to prevent exhaustion in production.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:izhubs_dev_2026@localhost:5432/izhubs_erp',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Helper for standardized querying
export const db = {
  /**
   * Plain query — no RLS context. Use for migrations, admin ops, and
   * queries where tenant filtering happens in the WHERE clause.
   */
  query: async (text: string, params?: unknown[]) => {
    return pool.query(text, params);
  },

  /**
   * Tenant-scoped query — sets app.current_tenant_id session variable
   * so Postgres RLS policies can enforce tenant isolation at DB level.
   * Use this for all data queries in API routes.
   *
   * @example
   *   const rows = await db.queryAsTenant(tenantId, 'SELECT * FROM contacts WHERE ...', [])
   */
  queryAsTenant: async (
    tenantId: string,
    text: string,
    params?: unknown[]
  ) => {
    const client = await pool.connect();
    try {
      // SET LOCAL only applies within this connection checkout — safe for pool
      await client.query(`SET app.current_tenant_id = '${tenantId}'`);
      return await client.query(text, params);
    } finally {
      // Reset and release so next checkout gets a clean connection
      await client.query(`RESET app.current_tenant_id`).catch(() => {});
      client.release();
    }
  },

  /**
   * Get a raw client for manual transaction management.
   * Remember to call client.release() when done.
   */
  getClient: async (): Promise<PoolClient> => {
    return pool.connect();
  },

  /**
   * Run multiple queries atomically in a transaction.
   * Automatically commits on success, rolls back on error.
   * Does NOT set RLS context — pass tenantId to use withTenantTransaction.
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

  /**
   * Tenant-scoped transaction — sets RLS context + runs queries atomically.
   * Use for all multi-step write operations that need tenant isolation + atomicity.
   *
   * @example
   *   await db.withTenantTransaction(tenantId, async (client) => {
   *     await client.query('INSERT INTO contacts ...', [...])
   *     await client.query('INSERT INTO activities ...', [...])
   *   })
   */
  withTenantTransaction: async <T>(
    tenantId: string,
    fn: (client: PoolClient) => Promise<T>
  ): Promise<T> => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SET LOCAL app.current_tenant_id = '${tenantId}'`);
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

/**
 * Builds a generic INSERT query dynamically mapping camelCase objects to snake_case columns.
 * Undefined values are silently omitted to allow database DEFAULT specifications to fire.
 * @param table - The table name
 * @param data - The data object containing columns to insert
 * @param returning - The columns to return (e.g. "id, name" or "*")
 */
export function buildInsertQuery(table: string, data: Record<string, unknown>, returning: string = '*'): { text: string; values: unknown[] } {
  const columns: string[] = [];
  const placeholders: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      columns.push(key.replace(/[A-Z]/g, l => `_${l.toLowerCase()}`));
      placeholders.push(`$${idx++}`);
      values.push(value);
    }
  }

  return {
    text: `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING ${returning}`,
    values
  };
}

/**
 * Builds a generic UPDATE query dynamically mapping camelCase objects to snake_case columns.
 * @param table - The table name to heavily update
 * @param data - The fields mapped for patching
 * @param whereCol - The condition identifier string (usually "id")
 * @param whereVal - The condition target value to patch
 * @param returning - The columns to return (e.g. "id, name" or "*")
 */
export function buildUpdateQuery(table: string, data: Record<string, unknown>, whereCol: string, whereVal: unknown, returning: string = '*'): { text: string; values: unknown[] } | null {
  const setClauses: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      setClauses.push(`${key.replace(/[A-Z]/g, l => `_${l.toLowerCase()}`)} = $${idx++}`);
      values.push(value);
    }
  }
  
  if (setClauses.length === 0) return null;

  setClauses.push(`updated_at = NOW()`);
  values.push(whereVal);

  return {
    text: `UPDATE ${table} SET ${setClauses.join(', ')} WHERE ${whereCol} = $${idx} AND deleted_at IS NULL RETURNING ${returning}`,
    values
  };
}
