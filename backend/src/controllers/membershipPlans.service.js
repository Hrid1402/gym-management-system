import { pool } from '../db/index.js';

export const getAllPlans = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM membership_plans');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

export const getPlanById = async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'Membership plan ID is required' });
  }

  try {
    const result = await pool.query('SELECT * FROM membership_plans WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Membership plan not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};