const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3005;

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
app.use(session({
  secret: 'verify-it-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// --- Auth Middleware ---
const isAuthenticated = (req, res, next) => {
  if (req.session.manufacturer) return next();
  res.redirect('/manufacturer/login');
};

// Global Middleware for Views
app.use((req, res, next) => {
  res.locals.manufacturer = req.session.manufacturer || null;
  next();
});

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

// --- Manufacturer Routes ---

app.get('/manufacturer/signup', (req, res) => {
  res.render('manufacturer-signup.html');
});

app.post('/manufacturer/signup', async (req, res) => {
  const { username, email, password, company_name } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO manufacturers (username, email, password, company_name) VALUES ($1, $2, $3, $4)',
      [username, email, hashedPassword, company_name]
    );
    res.redirect('/manufacturer/login');
  } catch (err) {
    res.status(500).send('Error during signup: ' + err.message);
  }
});

app.get('/manufacturer/login', (req, res) => {
  res.render('manufacturer-login.html', { error: null });
});

app.post('/manufacturer/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM manufacturers WHERE username = $1', [username]);
    if (rows.length > 0) {
      const match = await bcrypt.compare(password, rows[0].password);
      if (match) {
        req.session.manufacturer = rows[0];
        return res.redirect('/manufacturer/dashboard');
      }
    }
    res.render('manufacturer-login.html', { error: 'Invalid username or password' });
  } catch (err) {
    res.status(500).send('Error during login: ' + err.message);
  }
});

app.get('/manufacturer/dashboard', isAuthenticated, (req, res) => {
  res.render('dashboard.html', { 
    manufacturer: req.session.manufacturer,
    success: req.query.success === 'true',
    error: req.query.error || null
  });
});

app.post('/manufacturer/add-serial', isAuthenticated, async (req, res) => {
  const { serial_number, product_name, brand, manufacture_date } = req.body;
  const manufacturer_id = req.session.manufacturer.id;
  try {
    await pool.query(
      'INSERT INTO products (serial_number, product_name, brand, manufacture_date, manufacturer_id) VALUES ($1, $2, $3, $4, $5)',
      [serial_number.toUpperCase(), product_name, brand, manufacture_date, manufacturer_id]
    );
    res.redirect('/manufacturer/dashboard?success=true');
  } catch (err) {
    res.redirect(`/manufacturer/dashboard?error=${encodeURIComponent(err.message)}`);
  }
});

app.get('/manufacturer/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// --- Server Bootstrap ---
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
}

module.exports = app;
