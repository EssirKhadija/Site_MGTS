require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool, testConnection } = require('./db');

const seed = async () => {
  await testConnection();

  const fullName = 'Admin MGTS';
  const email    = 'admin@mgts.com';
  const password = 'Admin@1234';
  const phone    = '+212600000000';

  // Check if admin already exists
  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    console.log('⚠️  Admin already exists');
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await pool.query(
    'INSERT INTO users (fullName, email, phone, password, role, status, isVerified) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [fullName, email, phone, hashedPassword, 'admin', 'active', true]
  );

  console.log('✅ Admin created successfully!');
  console.log('📧 Email    :', email);
  console.log('🔑 Password :', password);
  console.log('⚠️  Change the password after first login!');

  process.exit(0);
};

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});