const { Client } = require('pg');
const setup = async () => {
  const q = process.env.DATABASE_URL, c = new Client(q ? { connectionString: q, ssl: { rejectUnauthorized: false } } : { host: 'localhost', user: 'postgres', password: '123', database: 'postgres', port: 5432 });
  try {
    await c.connect();
    console.log('✅ Connected');
    await c.query(`CREATE TABLE IF NOT EXISTS products (id SERIAL, serial_number VARCHAR UNIQUE, product_name VARCHAR, brand VARCHAR, manufacture_date DATE, registered_at TIMESTAMP DEFAULT NOW());
                   CREATE TABLE IF NOT EXISTS reports (id SERIAL, name VARCHAR, email VARCHAR, message TEXT, date TIMESTAMP DEFAULT NOW());`);
    const s = ['APPLE-2024-001', 'NIKE-2024-XYZ', 'SONY-WH1000XM5', 'SAM-GALAXY-S24'];
    await c.query('DELETE FROM products WHERE serial_number = ANY($1)', [s]);
    await c.query(`INSERT INTO products (serial_number, product_name, brand, manufacture_date) VALUES 
      ('APPLE-2024-001','iPhone 15 Pro','Apple','2024-01-10'), ('NIKE-2024-XYZ','Air Max 2024','Nike','2024-03-15'),
      ('SONY-WH1000XM5','WH-1000XM5 Headphones','Sony','2024-02-20'), ('SAM-GALAXY-S24','Galaxy S24 Ultra','Samsung','2024-01-25')`);
    console.log('✅ Seeded');
  } catch (e) { console.error(e.message); } finally { await c.end(); process.exit(); }
};
setup();
