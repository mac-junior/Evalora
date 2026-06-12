import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

const seedAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL || 'admin@evalora.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin@123456';

    console.log(' Seeding admin user...');

    const existingAdmin = await pool.query(
      'SELECT * FROM admins WHERE email = $1',
      [email]
    );

    if (existingAdmin.rows.length > 0) {
      console.log('Admin already exists');
      await pool.end();
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await pool.query(
      'INSERT INTO admins (email, password, fullname, username) VALUES ($1, $2, $3, $4)',
      [email, hashedPassword, 'Administrator', 'admin']
    );

    console.log('Admin seeded successfully');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    await pool.end();
    process.exit(1);
  }
};

seedAdmin();