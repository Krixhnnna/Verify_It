const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

// --- Database Configuration ---
const pool = new Pool(process.env.DATABASE_URL ? {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
} : {
  host: 'localhost',
  user: 'postgres',
  password: '123',
  database: 'counterfeit_db',
  port: 5432,
});

// --- Middleware & View Engine ---
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// --- Routes ---

// Health Check / API Reports
app.get('/api', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM reports ORDER BY date DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Navigation
app.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT stat_value FROM site_stats WHERE stat_name = 'total_fakes_found'");
    const totalSolved = rows.length ? rows[0].stat_value : 0;
    res.render('index.html', { totalSolved });
  } catch (err) {
    res.render('index.html', { totalSolved: 534 }); // Fallback
  }
});

app.get('/about', (req, res) => res.render('about.html'));

// Verification Logic
app.get('/verify', (req, res) => {
  res.render('verify.html', { result: null, serial: null });
});

app.post('/check', async (req, res) => {
  const serial = req.body.serial_number.trim().toUpperCase();
  try {
    const { rows } = await pool.query('SELECT * FROM products WHERE serial_number = $1', [serial]);
    const isCounterfeit = rows.length === 0;

    if (isCounterfeit) {
      await pool.query("UPDATE site_stats SET stat_value = stat_value + 1 WHERE stat_name = 'total_fakes_found'");
    }

    res.render('verify.html', {
      result: isCounterfeit ? 'counterfeit' : 'genuine',
      serial: serial,
      product: rows[0] || null
    });
  } catch (err) {
    res.render('verify.html', { result: 'error', serial: serial, product: null });
  }
});

// Contact Reporting
app.get('/contact', (req, res) => {
  res.render('contact.html', { sent: false });
});

app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;
  try {
    await pool.query(
      'INSERT INTO reports (name, email, message) VALUES ($1, $2, $3)',
      [name, email, message]
    );
    res.render('contact.html', { sent: true });
  } catch (err) {
    console.error('DB Report Error:', err.message);
    res.render('contact.html', { sent: false });
  }
});

// --- Server Bootstrap ---
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
}

module.exports = app;
