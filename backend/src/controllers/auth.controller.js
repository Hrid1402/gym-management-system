import { pool } from '../db/index.js';
import { supabase } from '../lib/supabaseClient.js';
import 'dotenv/config';

// --- EXISTING LOGIC ---

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) return res.status(401).json({ error: authError.message });

    const supabaseUserId = authData.user.id;
    const token = authData.session.access_token;

    const clientResult = await pool.query('SELECT * FROM clients WHERE supabase_user_id = $1', [supabaseUserId]);
    let userProfile = clientResult.rows[0];
    let userType = 'client';

    if (!userProfile) {
      const staffResult = await pool.query('SELECT * FROM users WHERE supabase_user_id = $1', [supabaseUserId]);
      userProfile = staffResult.rows[0];
      userType = 'staff';
      if (userProfile && !userProfile.is_active) {
        return res.status(403).json({ error: 'This account has been deactivated' });
      }
    }

    if (!userProfile) return res.status(404).json({ error: 'Database profile missing' });

    return res.status(200).json({ message: 'Login successful', token, user: { type: userType, ...userProfile } });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const register = async (req, res) => {
  const { email, password, dni, first_name, last_name, phone } = req.body;
  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
  if (authError) return res.status(400).json({ error: authError.message });

  const supabaseUserId = authData.user.id;
  const clientDbId = `CLI-${Date.now()}`;

  try {
    await pool.query(
      `INSERT INTO clients (id, supabase_user_id, dni, first_name, last_name, phone, email)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [clientDbId, supabaseUserId, dni, first_name, last_name, phone, email]
    );
    return res.status(201).json({ message: 'Client registered!', client_id: clientDbId });
  } catch (error) {
    await supabase.auth.admin.deleteUser(supabaseUserId);
    return res.status(500).json({ error: 'Failed to create database profile' });
  }
};

export const logout = async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  try {
    const { error } = await supabase.auth.admin.signOut(token);
    if (error) return res.status(500).json({ error: 'Failed to sign out' });
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const requestPasswordRecovery = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${(process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '')}/reset-password`,
    });
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ message: 'Recovery email sent' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePassword = async (req, res) => {
  const { new_password } = req.body;
  const authHeader = req.headers.authorization;
  if (!new_password) return res.status(400).json({ error: 'New password required' });
  if (!authHeader) return res.status(401).json({ error: 'Missing token' });

  try {
    const { error } = await supabase.auth.updateUser(
      { password: new_password },
      { accessToken: authHeader.split(' ')[1] }
    );
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCurrentUser = (req, res) => {
  res.json({ currentUser: req.user });
};

// --- NEW: SELF SERVICE LOGIC ---

export const changePassword = async (req, res) => {
  const { new_password } = req.body;
  const token = req.headers.authorization.split(' ')[1];

  if (!new_password) return res.status(400).json({ error: 'New password is required' });

  try {
    const { error } = await supabase.auth.updateUser({ password: new_password }, { accessToken: token });
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (req, res) => {
  const { email } = req.body;
  const token = req.headers.authorization.split(' ')[1];
  const userId = req.user.id;
  const userType = req.user.type;

  try {
    // 1. If email is being changed, update it in Supabase first
    if (email && email !== req.user.email) {
      const { error: authError } = await supabase.auth.updateUser({ email }, { accessToken: token });
      if (authError) return res.status(400).json({ error: `Supabase Auth Error: ${authError.message}` });
    }

    // 2. Update local database based on user type
    let updatedProfile;

    if (userType === 'client') {
      const { first_name, last_name, phone, address, date_of_birth, photo_path, dni } = req.body;
      const result = await pool.query(
        `UPDATE clients 
         SET first_name = COALESCE($1, first_name),
             last_name = COALESCE($2, last_name),
             phone = COALESCE($3, phone),
             address = COALESCE($4, address),
             date_of_birth = COALESCE($5, date_of_birth),
             photo_path = COALESCE($6, photo_path),
             dni = COALESCE($7, dni),
             email = COALESCE($8, email),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $9 RETURNING *`,
        [first_name, last_name, phone, address, date_of_birth, photo_path, dni, email, userId]
      );
      updatedProfile = result.rows[0];
    } else {
      // Staff profile update
      const { name } = req.body;
      const result = await pool.query(
        `UPDATE users 
         SET name = COALESCE($1, name),
             email = COALESCE($2, email),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3 RETURNING *`,
        [name, email, userId]
      );
      updatedProfile = result.rows[0];
    }

    return res.status(200).json({ 
      message: 'Profile updated successfully', 
      user: updatedProfile 
    });

  } catch (error) {
    console.error('Update profile error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'This Email or DNI is already in use by another account.' });
    }
    return res.status(500).json({ error: 'Internal server error updating profile' });
  }
};