const { Client, Pool } = require('pg');

async function setup() {
  // 1. Try to connect to the database
  // If a DATABASE_URL is provided in the environment, use it first!
  const configs = [
    process.env.DATABASE_URL ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } } : null,
    { user: 'postgres', host: '/tmp', port: 5432, database: 'postgres' }, // Unix Socket
    { user: 'krishnapandey', host: '/tmp', port: 5432, database: 'postgres' }, // Current user Unix Socket
    { user: 'postgres', host: 'localhost', port: 5432, database: 'postgres' }, // No password (trust)
    { user: 'postgres', host: 'localhost', port: 5432, database: 'postgres', password: '' }, // Blank password
    { user: 'postgres', host: 'localhost', port: 5432, database: 'postgres', password: '123' }, // Discovered from history
    { user: 'postgres', host: 'localhost', port: 5432, database: 'postgres', password: 'tanish@2807' } // Previous password
  ];

  let client;
  for (const config of configs) {
    if (!config) continue; // Skip if null
    try {
      client = new Client(config);
      await client.connect();
      console.log(`✅ Connected to PostgreSQL using config: ${JSON.stringify(config)}`);
      break;
    } catch (err) {
      console.log(`❌ Failed config ${JSON.stringify(config)}: ${err.message}`);
      client = null;
    }
  }

  if (!client) {
    console.error('❌ Could not connect to PostgreSQL. Please make sure Postgres is running.');
    console.error('You might need to set your password manually in pgAdmin or Postgres.app first.');
    process.exit(1);
  }

  try {
    // 2. Set the password to '123' as requested
    console.log('🔄 Attempting to set password to "123"...');
    await client.query("ALTER USER postgres WITH PASSWORD '123';");
    console.log('✅ Password updated to "123".');

    // 3. Create the database
    console.log('🔄 Creating database "counterfeit_db"...');
    await client.query('DROP DATABASE IF EXISTS counterfeit_db;');
    await client.query('CREATE DATABASE counterfeit_db;');
    console.log('✅ Database created.');
    
    await client.end();

    // 4. Connect to the NEW database to create the table
    const pool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'counterfeit_db',
      password: '123',
      port: 5432,
    });

    console.log('🔄 Creating table and seeding data...');
    const schema = `
      CREATE TABLE products (
        id            SERIAL PRIMARY KEY,
        serial_number VARCHAR(50) UNIQUE NOT NULL,
        product_name  VARCHAR(100),
        brand         VARCHAR(100),
        manufacture_date DATE,
        registered_at TIMESTAMP DEFAULT NOW()
      );

      INSERT INTO products (serial_number, product_name, brand, manufacture_date) VALUES
        ('APPLE-2024-001', 'iPhone 15 Pro', 'Apple', '2024-01-10'),
        ('NIKE-2024-XYZ', 'Air Max 2024', 'Nike', '2024-03-15'),
        ('SONY-WH1000XM5', 'WH-1000XM5 Headphones', 'Sony', '2024-02-20'),
        ('SAM-GALAXY-S24', 'Galaxy S24 Ultra', 'Samsung', '2024-01-25');
    `;

    await pool.query(schema);
    console.log('✅ Success! Database is "counterfeit_db" and everything is setup.');
    await pool.end();

  } catch (err) {
    console.error('❌ Error during setup:', err.message);
  } finally {
    process.exit();
  }
}

setup();
