import { neon } from '@neondatabase/serverless';

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    return null;
  }
  try {
    return neon(url);
  } catch (error) {
    console.error('Failed to initialize Neon DB client:', error);
    return null;
  }
}

export async function isDbConnected(): Promise<boolean> {
  const sql = getDb();
  if (!sql) return false;
  try {
    const res = await sql`SELECT 1 as connected;`;
    return Boolean(res && res.length > 0);
  } catch (err) {
    console.warn('Neon DB connection check failed:', err);
    return false;
  }
}
