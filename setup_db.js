const { Client } = require('pg');

/**
 * Database Setup Script
 * Sets up the products table and seeds it with sample data.
 * Supports both local and cloud PostgreSQL via DATABASE_URL.
 */
const setup = async () => {
  const config = process.env.DATABASE_URL ? {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  } : {
    host: 'localhost',
    user: 'postgres',
    password: '123',
    database: 'postgres', // Connect to default DB or counterfeit_db
    port: 5432
  };

  const client = new Client(config);

  try {
    console.log('🔄 Connecting to PostgreSQL...');
    await client.connect();
    console.log('✅ Connected.');

    // 1. Create the Products Table
    console.log('🔄 Ensuring "products" table exists...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        serial_number VARCHAR(50) UNIQUE NOT NULL,
        product_name VARCHAR(100),
        brand VARCHAR(100),
        manufacture_date DATE,
        registered_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 2. Data Cleaning
    const serialNumbers = [
      'APPLE-2024-001', 
      'NIKE-2024-XYZ', 
      'SONY-WH1000XM5', 
      'SAM-GALAXY-S24'
    ];
    
    console.log('🔄 Refreshing sample product data...');
    await client.query('DELETE FROM products WHERE serial_number = ANY($1)', [serialNumbers]);
    
    // 3. Data Seeding
    await client.query(`
      INSERT INTO products (serial_number, product_name, brand, manufacture_date) 
      VALUES
        ('APPLE-2024-001', 'iPhone 15 Pro', 'Apple', '2024-01-10'),
        ('NIKE-2024-XYZ', 'Air Max 2024', 'Nike', '2024-03-15'),
        ('SONY-WH1000XM5', 'WH-1000XM5 Headphones', 'Sony', '2024-02-20'),
        ('SAM-GALAXY-S24', 'Galaxy S24 Ultra', 'Samsung', '2024-01-25');
    `);

    console.log('✅ Success! Your database is now seeded and ready.');

  } catch (err) {
    console.error('❌ Database Setup Error:', err.message);
  } finally {
    await client.end();
    process.exit();
  }
};

setup();
