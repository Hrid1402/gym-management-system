import 'dotenv/config'; // Must be the very first import to load the connection string
import express from 'express';
import { pool } from './db/index.js'; // Named import matching the export

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ message: 'Gym' });
});

app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'connected', 
      db_time: result.rows[0].now 
    });
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ error: 'Failed to connect to the database' });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
  console.log(`http://localhost:${port}`);
  console.log(`\nTest database connection: http://localhost:${port}/api/test-db`);
});