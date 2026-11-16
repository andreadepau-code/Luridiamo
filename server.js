require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to database at:', res.rows[0].now);
  }
});

// API Routes

// GET /api/places - Fetch all active places
app.get('/api/places', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM places WHERE is_active = true ORDER BY rating DESC NULLS LAST'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/places/:id - Fetch single place
app.get('/api/places/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM places WHERE id = $1', [req.params.id]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Place not found' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/places - Add a new place (crowdsourced)
app.post('/api/places', async (req, res) => {
  try {
    const { name, latitude, longitude, address, opening_hours, closing_hours, image_url, specialties } = req.body;
    const result = await pool.query(
      `INSERT INTO places (name, latitude, longitude, address, opening_hours, closing_hours, image_url, specialties, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       RETURNING *`,
      [name, latitude, longitude, address, opening_hours, closing_hours, image_url, specialties || [], true]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reviews/:placeId - Fetch reviews for a place
app.get('/api/reviews/:placeId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM reviews WHERE place_id = $1 ORDER BY created_at DESC',
      [req.params.placeId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reviews - Add a review
app.post('/api/reviews', async (req, res) => {
  try {
    const { place_id, rating, comment, user_name } = req.body;
    const result = await pool.query(
      `INSERT INTO reviews (place_id, rating, comment, user_name, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [place_id, rating, comment, user_name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reports - Submit a user report (crowdsourced)
app.post('/api/reports', async (req, res) => {
  try {
    const { name, latitude, longitude, address, opening_hours, specialties, image_url, reported_by } = req.body;
    const result = await pool.query(
      `INSERT INTO user_reports (name, latitude, longitude, address, opening_hours, specialties, image_url, reported_by, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', NOW())
       RETURNING *`,
      [name, latitude, longitude, address, opening_hours, specialties, image_url, reported_by]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Serve the app
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.listen(port, () => {
  console.log(`Luridiamo server running on port ${port}`);
  console.log(`App available at: http://localhost:${port}`);
});