const express = require('express'), fs = require('fs'), path = require('path'), bodyParser = require('body-parser'), { Pool } = require('pg'), app = express(), PORT = 3000;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  host: process.env.DATABASE_URL ? undefined : 'localhost',
  user: process.env.DATABASE_URL ? undefined : 'postgres',
  password: process.env.DATABASE_URL ? undefined : '123',
  database: process.env.DATABASE_URL ? undefined : 'counterfeit_db',
  port: process.env.DATABASE_URL ? undefined : 5432,
});
app.set('view engine', 'html').engine('html', require('ejs').renderFile).set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public'))).use(bodyParser.urlencoded({ extended: true }));
app.get('/ping', async (req, res) => {
  try { await pool.query('SELECT 1'); res.send('pong (Database: OK)'); }
  catch (e) { console.error(e.message); res.send(`pong (Database: Error - ${e.message})`); }
});
app.get('/', (req, res) => res.render('index.html'));
app.get('/verify', (req, res) => res.render('verify.html', { result: null, serial: null }));
app.post('/check', async (req, res) => {
  const serial = req.body.serial_number.trim().toUpperCase();
  try {
    const { rows } = await pool.query('SELECT * FROM products WHERE serial_number = $1', [serial]);
    res.render('verify.html', { result: rows.length ? 'genuine' : 'counterfeit', serial, product: rows[0] || null });
  } catch (e) { console.error(e); res.render('verify.html', { result: 'error', serial, product: null }); }
});
app.get('/about', (req, res) => res.render('about.html'));
app.get('/contact', (req, res) => res.render('contact.html', { sent: false }));
app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;
  try {
    const p = path.join(__dirname, 'reports.json'), r = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p)) : [];
    r.push({ name, email, message, date: new Date().toLocaleString() });
    fs.writeFileSync(p, JSON.stringify(r, null, 2));
  } catch (e) { console.warn('FS read-only'); }
  res.render('contact.html', { sent: true });
});
if (process.env.NODE_ENV !== 'production') app.listen(PORT, () => console.log(`✅ http://localhost:${PORT}`));
module.exports = app;
