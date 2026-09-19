import 'dotenv/config';
import { pool } from './index.js';

const buildSchema = async () => {
  const client = await pool.connect();
  
  try {
    console.log('Building database schema...');
    await client.query('BEGIN');

    // Drop tables and types in reverse dependency order
    await client.query(`
      DROP TABLE IF EXISTS memberships CASCADE;
      DROP TABLE IF EXISTS membership_plans CASCADE;
      DROP TABLE IF EXISTS clients CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      
      DROP TYPE IF EXISTS user_role CASCADE;
      DROP TYPE IF EXISTS membership_status CASCADE;
    `);

    // Define Enums
    await client.query(`
      CREATE TYPE user_role AS ENUM ('ADMIN', 'RECEPTIONIST', 'TRAINER');
      CREATE TYPE membership_status AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'SUSPENDED', 'CANCELLED');
    `);

    // Define Tables
    await client.query(`
      CREATE TABLE users (
        id VARCHAR(30) PRIMARY KEY,
        supabase_user_id UUID UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        role user_role NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE clients (
        id VARCHAR(30) PRIMARY KEY,
        supabase_user_id UUID UNIQUE NOT NULL,
        dni VARCHAR(20) UNIQUE NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(255),
        date_of_birth DATE,
        address TEXT,
        photo_path TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE membership_plans (
        id VARCHAR(30) PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        duration_days INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE memberships (
        id VARCHAR(30) PRIMARY KEY,
        client_id VARCHAR(30) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        plan_id VARCHAR(30) NOT NULL REFERENCES membership_plans(id) ON DELETE CASCADE,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status membership_status DEFAULT 'PENDING',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query('COMMIT');
    console.log('Schema created successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error building schema:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

buildSchema();