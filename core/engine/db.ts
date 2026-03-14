import { Pool } from 'pg';

// Use a single pool for the application
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/izhubs_erp',
});

// Helper for standardized querying
export const db = {
  query: async (text: string, params?: any[]) => {
    return pool.query(text, params);
  },
  // Get a client for transactions
  getClient: async () => {
    return pool.connect();
  }
};
