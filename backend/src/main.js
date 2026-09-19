import 'dotenv/config';
import express from 'express';
import { pool } from './db/index.js'; // Named import matching the export
import router from './routes/index.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use('/api', router);

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