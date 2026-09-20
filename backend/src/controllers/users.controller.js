import { pool } from '../db/index.js';
import { supabaseAdmin } from '../lib/supabaseClient.js';

// 1. Get all staff (already done)
export const getStaff = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, is_active, created_at 
       FROM users 
       ORDER BY created_at DESC`
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching staff:', error);
    return res.status(500).json({ error: 'Internal server error fetching staff' });
  }
};

// 2. Create new staff member
export const createStaff = async (req, res) => {
  const { email, password, name, role } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: 'Email, password, name, and role are required' });
  }

  // Ensure the role is valid based on your ENUM
  if (!['ADMIN', 'RECEPTIONIST', 'TRAINER'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role specified' });
  }

  try {
    // A. Create the user in Supabase silently
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true // Skip email verification for staff accounts
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const supabaseUserId = authData.user.id;
    const staffDbId = `USR-${Date.now()}`;

    // B. Insert into local PostgreSQL
    const result = await pool.query(
      `INSERT INTO users (id, supabase_user_id, name, email, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, is_active`,
      [staffDbId, supabaseUserId, name, email, role]
    );

    return res.status(201).json({
      message: 'Staff member created successfully',
      staff: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating staff:', error);
    return res.status(500).json({ error: 'Internal server error creating staff' });
  }
};

// 3. Edit existing staff (Name, Role, Status)
export const updateStaff = async (req, res) => {
  const { id } = req.params;
  const { name, role, is_active } = req.body;

  try {
    // We only update local profile details. 
    // If they need to change their email/password, they use the normal auth flows.
    const result = await pool.query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           role = COALESCE($2, role),
           is_active = COALESCE($3, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, name, email, role, is_active`,
      [name, role, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    return res.status(200).json({
      message: 'Staff member updated successfully',
      staff: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating staff:', error);
    return res.status(500).json({ error: 'Internal server error updating staff' });
  }
};