import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pool from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const migrate = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Running database migrations...');
    
    const schemaPath = join(__dirname, '../../schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at: ${schemaPath}`);
    }
    
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    await client.query(schema);
    
    console.log('Database migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrate()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default migrate;