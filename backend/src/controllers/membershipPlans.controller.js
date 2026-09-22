import { pool } from '../db/index.js';
import { isPositiveInteger, isPositiveNumber } from '../lib/validation.js';

export const createPlan = async (req, res) => {
  const { name, price, duration_days } = req.body;

  if (!name || price === undefined || duration_days === undefined) {
    return res.status(400).json({ error: 'Name, price, and duration_days are required' });
  }
  if (!isPositiveNumber(price)) {
    return res.status(400).json({ error: 'Price must be a number greater than zero' });
  }
  if (!isPositiveInteger(duration_days)) {
    return res.status(400).json({ error: 'Duration must be a whole number greater than zero' });
  }

  const planId = `PLN-${Date.now()}`;

  try {
    const result = await pool.query(
      `INSERT INTO membership_plans (id, name, price, duration_days)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [planId, name, price, duration_days]
    );

    return res.status(201).json({
      message: 'Plan created successfully',
      plan: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating plan:', error);
    if (error.code === '23505') { 
      return res.status(400).json({ error: 'A plan with this name already exists' });
    }
    return res.status(500).json({ error: 'Internal server error creating plan' });
  }
};

export const getPlans = async (req, res) => {
  try {
    let query = 'SELECT * FROM membership_plans';
    
    if (req.user.type === 'client') {
      query += ' WHERE is_active = true';
    }
    
    query += ' ORDER BY price ASC';

    const result = await pool.query(query);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching plans:', error);
    return res.status(500).json({ error: 'Internal server error fetching plans' });
  }
};

export const getPlanById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM membership_plans WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    if (req.user.type === 'client' && !result.rows[0].is_active) {
      return res.status(403).json({ error: 'This plan is no longer active' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching plan details:', error);
    return res.status(500).json({ error: 'Internal server error fetching plan details' });
  }
};

export const updatePlan = async (req, res) => {
  const { id } = req.params;
  const { name, price, duration_days } = req.body;

  if (price !== undefined && !isPositiveNumber(price)) {
    return res.status(400).json({ error: 'Price must be a number greater than zero' });
  }
  if (duration_days !== undefined && !isPositiveInteger(duration_days)) {
    return res.status(400).json({ error: 'Duration must be a whole number greater than zero' });
  }

  try {
    const result = await pool.query(
      `UPDATE membership_plans 
       SET name = COALESCE($1, name),
           price = COALESCE($2, price),
           duration_days = COALESCE($3, duration_days),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [name, price, duration_days, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    return res.status(200).json({
      message: 'Plan updated successfully',
      plan: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating plan:', error);
    return res.status(500).json({ error: 'Internal server error updating plan' });
  }
};

export const togglePlanStatus = async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  if (typeof is_active !== 'boolean') {
    return res.status(400).json({ error: 'is_active must be a boolean value (true or false)' });
  }

  try {
    const result = await pool.query(
      `UPDATE membership_plans 
       SET is_active = $1, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    return res.status(200).json({
      message: `Plan ${is_active ? 'activated' : 'deactivated'} successfully`,
      plan: result.rows[0],
    });
  } catch (error) {
    console.error('Error toggling plan status:', error);
    return res.status(500).json({ error: 'Internal server error toggling plan status' });
  }
};