// =============================================
//  COUNTERFEIT CHECKER - Main Server (server.js)
// =============================================

const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

// ----------------------------
// PostgreSQL Connection Setup
// ----------------------------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  // Local fallback if no DATABASE_URL is found
  host: process.env.DATABASE_URL ? undefined : 'localhost',
  user: process.env.DATABASE_URL ? undefined : 'postgres',
  password: process.env.DATABASE_URL ? undefined : '123',
  database: process.env.DATABASE_URL ? undefined : 'counterfeit_db',
  port: process.env.DATABASE_URL ? undefined : 5432,
});

// ----------------------------
// Middleware
// ----------------------------
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// ----------------------------
// Routes
// ----------------------------

// HEALTH CHECK for Deployment (Tests DB connection)
app.get('/ping', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.send('pong (Database: OK)');
  } catch (err) {
    console.error('Ping DB Error:', err.message);
    res.send(`pong (Database: Error - ${err.message})`);
  }
});

// HOME PAGE - Landing Page
app.get('/', (req, res) => {
  res.render('index.html');
});

// VERIFY PAGE - Serial Number Checker
app.get('/verify', (req, res) => {
  res.render('verify.html', { result: null, serial: null });
});

// CHECK SERIAL - Form submission
app.post('/check', async (req, res) => {
  const serial = req.body.serial_number.trim().toUpperCase();

  try {
    const query = 'SELECT * FROM products WHERE serial_number = $1';
    const result = await pool.query(query, [serial]);

    if (result.rows.length > 0) {
      res.render('verify.html', {
        result: 'genuine',
        serial: serial,
        product: result.rows[0]
      });
    } else {
      res.render('verify.html', {
        result: 'counterfeit',
        serial: serial,
        product: null
      });
    }
  } catch (err) {
    console.error('Database error:', err);
    res.render('verify.html', { result: 'error', serial: serial, product: null });
  }
});

// ABOUT PAGE
app.get('/about', (req, res) => {
  res.render('about.html');
});

// CONTACT FORM
app.get('/contact', (req, res) => {
  res.render('contact.html', { sent: false });
});

// CONTACT FORM - Submission
app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;

  // Save to JSON file (Only if filesystem is writable)
  try {
    const reportPath = path.join(__dirname, 'reports.json');
    const report = { name, email, message, date: new Date().toLocaleString() };
    const reports = fs.existsSync(reportPath) ? JSON.parse(fs.readFileSync(reportPath)) : [];
    reports.push(report);
    fs.writeFileSync(reportPath, JSON.stringify(reports, null, 2));
  } catch (err) {
    console.warn('Filesystem is read-only (expected on Vercel). Report not saved to JSON.');
  }

  console.log(`Report received: ${name} (${email})`);
  res.render('contact.html', { sent: true });
});

// ----------------------------
// Start Server
// ----------------------------
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
