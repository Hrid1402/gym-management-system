import 'dotenv/config';
import { pool } from './index.js';
import { supabaseAdmin } from '../lib/supabaseClient.js';

const initializeAdmin = async () => {
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;
  const adminName = process.env.INITIAL_ADMIN_NAME || 'Genesis Manager';

  if (!adminEmail || !adminPassword) {
    console.error('Missing INITIAL_ADMIN_EMAIL or INITIAL_ADMIN_PASSWORD in environment variables.');
    process.exit(1);
  }

  const client = await pool.connect();

  try {
    const adminCheck = await client.query("SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1");
    
    if (adminCheck.rows.length > 0) {
      console.log('Admin account already exists. Skipping Genesis Admin creation.');
      return;
    }

    console.log('No Admin found. Creating Genesis Admin...');
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true 
    });

    if (authError) {
      if (authError.message.includes('already exists')) {
          console.error(`upabase Auth: User ${adminEmail} already exists, but isn't in PostgreSQL. You may need to clean up Supabase.`);
          return;
      }
      throw new Error(`Supabase error: ${authError.message}`);
    }

    //Insert the new Admin into your local database
    const adminDbId = `USR-${Date.now()}`;
    await client.query(
      `INSERT INTO users (id, supabase_user_id, name, email, role) 
       VALUES ($1, $2, $3, $4, 'ADMIN')`,
      [adminDbId, authData.user.id, adminName, adminEmail]
    );

    console.log(`Genesis Admin created successfully: ${adminEmail}`);

  } catch (error) {
    console.error('Error creating initial admin:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

initializeAdmin();