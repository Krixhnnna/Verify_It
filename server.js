// =============================================
//  COUNTERFEIT CHECKER - Main Server (server.js)
// =============================================

const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// ----------------------------
// PostgreSQL Connection Setup
// ----------------------------
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || 'postgres://postgres:123@localhost:5432/counterfeit_db',
  ssl: process.env.POSTGRES_URL ? { rejectUnauthorized: false } : false
});

// ----------------------------
// Middleware & View Engine
// ----------------------------
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// ----------------------------
// Routes
// ----------------------------

// HOME PAGE
app.get('/', (req, res) => {
  res.render('index.html');
});

// VERIFY PAGE
app.get('/verify', (req, res) => {
  res.render('verify.html', { result: null, serial: null });
});

// CHECK SERIAL
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

// CONTACT PAGE
app.get('/contact', (req, res) => {
  res.render('contact.html', { sent: false });
});

// CONTACT FORM - Submission
app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;
  
  // Save to JSON file (ONLY LOCALLY - Vercel filesystem is read-only)
  if (!process.env.VERCEL) {
    try {
      const report = { name, email, message, date: new Date().toLocaleString() };
      const reportsFile = path.join(__dirname, 'reports.json');
      const reports = fs.existsSync(reportsFile) ? JSON.parse(fs.readFileSync(reportsFile)) : [];
      reports.push(report);
      fs.writeFileSync(reportsFile, JSON.stringify(reports, null, 2));
    } catch (e) {
      console.error('Local JSON save error:', e);
    }
  }

  console.log(`Report received from ${name} (${email})`);
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

// Export for Vercel
module.exports = app;
