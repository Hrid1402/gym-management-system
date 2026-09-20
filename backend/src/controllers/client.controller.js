import { pool } from '../db/index.js';
import { supabase } from '../lib/supabaseClient.js';

// 1. List and Search Clients (Req 2)
export const getClients = async (req, res) => {
  const { search } = req.query;

  try {
    let query = `
      SELECT id, dni, first_name, last_name, phone, email, date_of_birth 
      FROM clients
    `;
    let values = [];

    // If the frontend sends ?search=juan or ?search=7234, we filter using ILIKE
    if (search) {
      query += ` WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR dni ILIKE $1 `;
      values = [`%${search}%`];
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, values);
    return res.status(200).json(result.rows);

  } catch (error) {
    console.error('Error fetching clients:', error);
    return res.status(500).json({ error: 'Internal server error fetching clients' });
  }
};

// 2. View Client Details & Active Membership (Req 3)
export const getClientById = async (req, res) => {
  const { id } = req.params;

  try {
    // A. Get the basic profile
    const clientResult = await pool.query('SELECT * FROM clients WHERE id = $1', [id]);
    
    if (clientResult.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // B. Get their most recent active or pending membership plan
    const membershipResult = await pool.query(`
      SELECT m.id, m.start_date, m.end_date, m.status, p.name as plan_name, p.price
      FROM memberships m
      JOIN membership_plans p ON m.plan_id = p.id
      WHERE m.client_id = $1 AND m.status IN ('ACTIVE', 'PENDING')
      ORDER BY m.end_date DESC 
      LIMIT 1
    `, [id]);

    const client = clientResult.rows[0];
    const membership = membershipResult.rows.length > 0 ? membershipResult.rows[0] : null;

    return res.status(200).json({
      ...client,
      current_membership: membership
    });

  } catch (error) {
    console.error('Error fetching client details:', error);
    return res.status(500).json({ error: 'Internal server error fetching client details' });
  }
};

// 3. Edit Client Data (Req 3)
export const updateClient = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, phone, address, date_of_birth, photo_path } = req.body;

  try {
    // COALESCE means: If the frontend didn't send a field (it's null), keep the existing value.
    const result = await pool.query(
      `UPDATE clients 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone = COALESCE($3, phone),
           address = COALESCE($4, address),
           date_of_birth = COALESCE($5, date_of_birth),
           photo_path = COALESCE($6, photo_path),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 
       RETURNING id, first_name, last_name, phone, address`,
      [first_name, last_name, phone, address, date_of_birth, photo_path, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    return res.status(200).json({ 
      message: 'Client updated successfully', 
      client: result.rows[0] 
    });

  } catch (error) {
    console.error('Error updating client:', error);
    return res.status(500).json({ error: 'Internal server error updating client' });
  }
};

// 4. Delete Client (Req 2)
export const deleteClient = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM clients WHERE id = $1 RETURNING supabase_user_id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Optional MVP bonus: You can also tell Supabase to delete their login entirely
    // using supabaseAdmin.auth.admin.deleteUser(result.rows[0].supabase_user_id) 

    return res.status(200).json({ message: 'Client deleted successfully' });

  } catch (error) {
    console.error('Error deleting client:', error);
    return res.status(500).json({ error: 'Internal server error deleting client' });
  }
};