import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pkg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function testDB() {
  try {
    await client.connect();
    console.log('DB connected successfully');

    const res = await client.query('SELECT NOW()');
    console.log('Server time:', res.rows);

    await client.end();
  } catch (err) {
    console.error('❌ DB connection failed:', err);
  }
}

testDB();