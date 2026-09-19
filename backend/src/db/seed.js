import 'dotenv/config';
import { pool } from './index.js';

const insertMockData = async () => {
  const client = await pool.connect();
  
  try {
    console.log('Inserting mockup data...');
    await client.query('BEGIN');

    // 1. Insert User
    await client.query(`
      INSERT INTO users (id, supabase_user_id, name, email, role) 
      VALUES 
        ('tz4a98xxre49x8jf98z12345', '550e8400-e29b-41d4-a716-446655440000', 'Admin User', 'admin@gym.com', 'ADMIN'),
        ('tz4a98xxre49x8jf98z12346', '550e8400-e29b-41d4-a716-446655440001', 'Trainer John', 'john@gym.com', 'TRAINER');
    `);

    // 2. Insert Client
    await client.query(`
      INSERT INTO clients (id, supabase_user_id, dni, first_name, last_name, phone, email, date_of_birth)
      VALUES 
        ('client98xxre49x8jf98z111', '550e8400-e29b-41d4-a716-446655440002', '12345678', 'Jane', 'Doe', '555-0198', 'jane.client@example.com', '1990-05-15');
    `);

    // 3. Insert Membership Plan
    await client.query(`
      INSERT INTO membership_plans (id, name, price, duration_days)
      VALUES 
        ('plan98xxre49x8jf98z222', 'Monthly Premium', 49.99, 30),
        ('plan98xxre49x8jf98z333', 'Annual Basic', 399.99, 365);
    `);

    // 4. Insert Membership
    await client.query(`
      INSERT INTO memberships (id, client_id, plan_id, start_date, end_date, status)
      VALUES 
        (
          'memb98xxre49x8jf98z444', 
          'client98xxre49x8jf98z111', 
          'plan98xxre49x8jf98z222', 
          CURRENT_DATE, 
          CURRENT_DATE + INTERVAL '30 days', 
          'ACTIVE'
        );
    `);

    await client.query('COMMIT');
    console.log('Mockup data inserted successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error inserting mockup data:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

insertMockData();