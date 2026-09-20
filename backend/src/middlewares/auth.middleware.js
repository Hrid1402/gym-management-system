import { pool } from '../db/index.js';
import { supabase } from '../lib/supabaseClient.js';


//Require authentication
export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Unauthorized: Token is invalid or expired' });
  }

  try {
    const clientResult = await pool.query(
      'SELECT id, first_name, last_name, email, dni, phone, date_of_birth, address FROM clients WHERE supabase_user_id = $1',
      [user.id]
    );

    if (clientResult.rows.length > 0) {
      req.user = { type: 'client', ...clientResult.rows[0] };
      return next();
    }

    const staffResult = await pool.query(
      'SELECT id, name, email, role, is_active FROM users WHERE supabase_user_id = $1',
      [user.id]
    );

    if (staffResult.rows.length > 0) {
      req.user = { type: 'staff', ...staffResult.rows[0] };
      return next();
    }

    return res.status(404).json({ error: 'Profile not found in system database' });
  } catch (error) {
    console.error('Middleware database error:', error);
    return res.status(500).json({ error: 'Internal server error while verifying user profile' });
  }
};


// This runs AFTER requireAuth. It checks the role attached to req.user.
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    // If they aren't logged in at all
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // If they are a client trying to access a staff-only route
    if (req.user.type !== 'staff') {
      return res.status(403).json({ error: 'Access denied: Staff only' });
    }

    // If they are staff, check if their specific role is allowed
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied: Requires one of [${allowedRoles.join(', ')}]` });
    }

    next();
  };
};