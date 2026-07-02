import { Pool } from 'pg';

let pool: Pool | null = null;

const getPool = (): Pool | null => {
  if (!pool && process.env.DATABASE_URL) {
    try {
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
    } catch (error) {
      console.error('Failed to create database pool:', error);
      pool = null;
    }
  }
  return pool;
};

export interface Donation {
  id: string;
  amount: number;
  donor_name: string;
  transaction_id: string;
  created_at: string;
}

export interface CreateDonationData {
  amount: number;
  donor_name: string;
  transaction_id: string;
}

export const createDonationRecord = async (data: CreateDonationData): Promise<Donation | null> => {
  const dbPool = getPool();
  if (!dbPool) {
    console.warn('Database not available, skipping donation record');
    return null;
  }
  
  try {
    const query = `
      INSERT INTO donations (amount, donor_name, transaction_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [data.amount, data.donor_name, data.transaction_id];
    
    const result = await dbPool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Failed to create donation record:', error);
    return null;
  }
};

export const getDonations = async (): Promise<Donation[]> => {
  const dbPool = getPool();
  if (!dbPool) {
    console.warn('Database not available, returning empty donations');
    return [];
  }
  
  try {
    const query = `
      SELECT id, amount, donor_name, transaction_id, created_at
      FROM donations
      ORDER BY created_at DESC
      LIMIT 20
    `;
    
    const result = await dbPool.query(query);
    return result.rows.map((row) => ({
      ...row,
      amount: row.amount / 100,
    }));
  } catch (error) {
    console.error('Failed to get donations:', error);
    return [];
  }
};

export const getTotalDonations = async (): Promise<number> => {
  const dbPool = getPool();
  if (!dbPool) {
    return 0;
  }
  
  try {
    const query = `
      SELECT COALESCE(SUM(amount), 0) as total
      FROM donations
    `;
    
    const result = await dbPool.query(query);
    return result.rows[0].total / 100;
  } catch (error) {
    console.error('Failed to get total donations:', error);
    return 0;
  }
};

export const initDonationsTable = async (): Promise<void> => {
  const dbPool = getPool();
  if (!dbPool) {
    console.warn('Database not available, skipping table initialization');
    return;
  }
  
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS donations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        amount INT NOT NULL,
        donor_name VARCHAR(100) DEFAULT '匿名用户',
        transaction_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    await dbPool.query(query);
    console.log('Donations table initialized successfully');
  } catch (error) {
    console.error('Failed to initialize donations table:', error);
  }
};
