import { pool } from './index.js'; 

const insertMockData = async () => {
  const client = await pool.connect();
  
  try {
    console.log('--- STARTING DATABASE SEED ---');
    await client.query('BEGIN');

    // 1. Insert Staff (Admin & Receptionist)
    console.log('Inserting staff...');
    await client.query(`
      INSERT INTO users (id, supabase_user_id, name, email, role) 
      VALUES 
        ('USR-admin-001', '0ffe9f5f-c2a7-4d9d-bb92-21308fca2539', 'Admin User', 'admin@gmail.com', 'ADMIN'),
        ('USR-recep-002', '5bdb9837-e91a-4751-96ed-ce3f30bb6f49', 'Front Desk', 'recepcion@gmail.com', 'RECEPTIONIST');
    `);

    // 2. Insert Client
    console.log('Inserting clients...');
    await client.query(`
      INSERT INTO clients (id, supabase_user_id, dni, first_name, last_name, phone, email, date_of_birth)
      VALUES 
        ('CLI-cliente-001', '7da72d76-4368-475a-b363-3f3610e38b60', '72345678', 'Carlos', 'Mendoza', '987654321', 'cliente@gmail.com', '1995-03-20');
    `);

    // 3. Insert Membership Plans (Requirement 4 mock data)
    console.log('Inserting membership plans...');
    await client.query(`
      INSERT INTO membership_plans (id, name, price, duration_days)
      VALUES 
        ('PLN-weekly-001', 'Pase Semanal', 20.00, 7),
        ('PLN-monthly-002', 'Mensualidad Básica', 60.00, 30),
        ('PLN-trimestral-003', 'Plan Trimestral', 160.00, 90),
        ('PLN-annual-004', 'Membresía VIP Anual', 600.00, 365);
    `);

    // 4. Insert Membership (Requirement 5 mock data)
    console.log('Assigning plans to clients...');
    await client.query(`
      INSERT INTO memberships (id, client_id, plan_id, start_date, end_date, status)
      VALUES 
        (
          'MEM-carlos-001', 
          'CLI-cliente-001', 
          'PLN-monthly-002', 
          CURRENT_DATE, 
          CURRENT_DATE + INTERVAL '30 days', 
          'ACTIVE'
        );
    `);

    await client.query('COMMIT');
    console.log('\n✅ MOCKUP DATA INSERTED SUCCESSFULLY.');
    console.log('You can now log in using the passwords you set for:');
    console.log('- admin@gmail.com');
    console.log('- recepcion@gmail.com');
    console.log('- cliente@gmail.com');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Error inserting mockup data:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

insertMockData();