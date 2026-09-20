import { pool } from '../db/index.js';
import { supabase } from '../lib/supabaseClient.js';

//login
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return res.status(401).json({ error: authError.message });
    }

    const token = authData.session.access_token;
    const supabaseUserId = authData.user.id;
    const clientResult = await pool.query(
      'SELECT id, first_name, last_name FROM clients WHERE supabase_user_id = $1',
      [supabaseUserId]
    );

    let userProfile = clientResult.rows[0];
    let userType = 'client';

    if (!userProfile) {
      const staffResult = await pool.query(
        'SELECT id, name, role, is_active FROM users WHERE supabase_user_id = $1',
        [supabaseUserId]
      );

      userProfile = staffResult.rows[0];
      userType = 'staff';

      if (userProfile && !userProfile.is_active) {
        return res.status(403).json({ error: 'This staff account has been deactivated' });
      }
    }

    if (!userProfile) {
      return res.status(404).json({ error: 'Database profile missing for this account' });
    }

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: { type: userType, ...userProfile },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'An internal server error occurred during login' });
  }
};

//register
export const register = async (req, res) => {
  const { email, password, dni, first_name, last_name, phone } = req.body;
  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });

  if (authError) {
    return res.status(400).json({ error: authError.message });
  }

  const supabaseUserId = authData.user.id;
  const clientDbId = `CLI-${Date.now()}`;

  try {
    await pool.query(
      `INSERT INTO clients
        (id, supabase_user_id, dni, first_name, last_name, phone, email)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [clientDbId, supabaseUserId, dni, first_name, last_name, phone, email]
    );

    return res.status(201).json({
      message: 'Client registered successfully!',
      client_id: clientDbId,
    });
  } catch (error) {
    console.error('Failed to insert into Postgres:', error);
    await supabase.auth.admin.deleteUser(supabaseUserId);
    return res.status(500).json({ error: 'Failed to create client profile in database.' });
  }
};

//logout
export const logout = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(400).json({ error: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { error } = await supabase.auth.admin.signOut(token);

    if (error) {
      return res.status(500).json({ error: 'Failed to sign out from the authentication server' });
    }

    return res.status(200).json({ message: 'Successfully logged out' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'An internal server error occurred during logout' });
  }
};

//Password Recovery
export const requestPasswordRecovery = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // Update this URL to match your actual frontend password reset page
      redirectTo: 'http://localhost:3000/reset-password', 
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Password recovery email sent successfully' });
  } catch (error) {
    console.error('Password recovery error:', error);
    return res.status(500).json({ error: 'An internal server error occurred' });
  }
};

// Update Password (using the recovery token)
export const updatePassword = async (req, res) => {
  const { new_password } = req.body;
  const authHeader = req.headers.authorization;

  if (!new_password) {
    return res.status(400).json({ error: 'New password is required' });
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing recovery token' });
  }

  const recoveryToken = authHeader.split(' ')[1];

  try {
    const { error } = await supabase.auth.updateUser(
      { password: new_password },
      { accessToken: recoveryToken }
    );

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    return res.status(500).json({ error: 'An internal server error occurred while updating the password' });
  }
};

//Get current user
export const getCurrentUser = (req, res) => {
  res.json({
    message: 'You have successfully accessed a secured route!',
    timestamp: new Date().toISOString(),
    currentUser: req.user,
  });
};