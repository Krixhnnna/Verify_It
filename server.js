const express = require('express');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

// --- Database Configuration ---
const dbConfig = process.env.DATABASE_URL ? {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
} : {
  host: 'localhost',
  user: 'postgres',
  password: '123',
  database: 'counterfeit_db',
  port: 5432,
};

const pool = new Pool(dbConfig);

// --- Middleware & View Engine ---
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// --- Routes ---

// Health check and diagnostic
app.get('/ping', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.send('pong (Database: OK)');
  } catch (err) {
    res.send(`pong (Database: Error - ${err.message})`);
  }
});

// Navigation
app.get('/', (req, res) => res.render('index.html'));
app.get('/about', (req, res) => res.render('about.html'));

// Verification Logic
app.get('/verify', (req, res) => {
  res.render('verify.html', { result: null, serial: null });
});

app.post('/check', async (req, res) => {
  const serial = req.body.serial_number.trim().toUpperCase();
  try {
    const { rows } = await pool.query('SELECT * FROM products WHERE serial_number = $1', [serial]);
    res.render('verify.html', {
      result: rows.length ? 'genuine' : 'counterfeit',
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

app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;
  const reportPath = path.join(__dirname, 'reports.json');

  try {
    const reports = fs.existsSync(reportPath) ? JSON.parse(fs.readFileSync(reportPath)) : [];
    reports.push({ name, email, message, date: new Date().toLocaleString() });
    fs.writeFileSync(reportPath, JSON.stringify(reports, null, 2));
  } catch (err) {
    console.warn('Filesystem is read-only (expected on Vercel). Report not saved localy.');
  }

  res.render('contact.html', { sent: true });
});

// --- Server Bootstrap ---
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
}

module.exports = app;
