import { pool } from '../db/index.js';

// 1. Staff Registration
export const registerMembershipStaff = async (req, res) => {
  const { client_id, plan_id, start_date } = req.body;

  if (!client_id || !plan_id || !start_date) {
    return res.status(400).json({ error: 'client_id, plan_id, and start_date are required' });
  }

  try {
    // NEW: Check if client already has an active or pending membership
    const activeCheck = await pool.query(
      `SELECT id FROM memberships WHERE client_id = $1 AND status IN ('ACTIVE', 'PENDING')`,
      [client_id]
    );
    if (activeCheck.rows.length > 0) {
      return res.status(400).json({ error: 'This client already has an active or pending membership. Cancel it first.' });
    }

    const planResult = await pool.query('SELECT duration_days FROM membership_plans WHERE id = $1', [plan_id]);
    if (planResult.rows.length === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const membershipId = `MEM-${Date.now()}`;
    const insertResult = await pool.query(
      `INSERT INTO memberships (id, client_id, plan_id, start_date, end_date, status)
       VALUES ($1, $2, $3, $4, $4::DATE + ($5 * INTERVAL '1 day'), 'ACTIVE')
       RETURNING *`,
      [membershipId, client_id, plan_id, start_date, planResult.rows[0].duration_days]
    );

    return res.status(201).json({ message: 'Membership registered', membership: insertResult.rows[0] });
  } catch (error) {
    console.error('Error registering membership (staff):', error);
    return res.status(500).json({ error: 'Internal server error registering membership' });
  }
};

// 2. Client Self-Registration
export const registerMembershipClient = async (req, res) => {
  const { plan_id } = req.body;
  const client_id = req.user.id; 

  if (!plan_id) {
    return res.status(400).json({ error: 'plan_id is required' });
  }

  try {
    // NEW: Check if the client already has an active or pending membership
    const activeCheck = await pool.query(
      `SELECT id FROM memberships WHERE client_id = $1 AND status IN ('ACTIVE', 'PENDING')`,
      [client_id]
    );
    if (activeCheck.rows.length > 0) {
      return res.status(400).json({ error: 'You already have an active membership. Please cancel it before buying a new one.' });
    }

    const planResult = await pool.query('SELECT duration_days, is_active FROM membership_plans WHERE id = $1', [plan_id]);
    if (planResult.rows.length === 0 || !planResult.rows[0].is_active) {
      return res.status(404).json({ error: 'Plan not found or inactive' });
    }

    const membershipId = `MEM-${Date.now()}`;
    const insertResult = await pool.query(
      `INSERT INTO memberships (id, client_id, plan_id, start_date, end_date, status)
       VALUES ($1, $2, $3, CURRENT_DATE, CURRENT_DATE + ($4 * INTERVAL '1 day'), 'ACTIVE')
       RETURNING *`,
      [membershipId, client_id, plan_id, planResult.rows[0].duration_days]
    );

    return res.status(201).json({ message: 'Membership acquired', membership: insertResult.rows[0] });
  } catch (error) {
    console.error('Error registering membership (client):', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// 3. View Memberships (Keep your existing getMemberships function here)
export const getMemberships = async (req, res) => {
  // ... (Your existing code)
};

// 4. NEW: Cancel Membership
export const cancelMembership = async (req, res) => {
  const { id } = req.params;

  try {
    // First, find the membership to verify ownership
    const memResult = await pool.query('SELECT client_id, status FROM memberships WHERE id = $1', [id]);
    
    if (memResult.rows.length === 0) {
      return res.status(404).json({ error: 'Membership not found' });
    }

    const membership = memResult.rows[0];

    // Security Check: If it's a client, ensure they own this specific membership
    if (req.user.type === 'client' && membership.client_id !== req.user.id) {
      return res.status(403).json({ error: 'You do not have permission to cancel this membership' });
    }

    // Logic Check: Don't cancel an already cancelled or expired membership
    if (membership.status === 'CANCELLED' || membership.status === 'EXPIRED') {
      return res.status(400).json({ error: `Membership is already ${membership.status.toLowerCase()}` });
    }

    // Update the status
    const updateResult = await pool.query(
      `UPDATE memberships SET status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id]
    );

    return res.status(200).json({
      message: 'Membership cancelled successfully',
      membership: updateResult.rows[0]
    });
  } catch (error) {
    console.error('Error cancelling membership:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};