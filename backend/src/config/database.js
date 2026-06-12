import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false
});

// Optional safe test (DO NOT BLOCK APP START)
pool.connect()
  .then((client) => {
    console.log('✅ PostgreSQL connected');
    client.release();
  })
  .catch((err) => {
    console.error('❌ PostgreSQL connection error:', err.message);
  });

export default pool;