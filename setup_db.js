const { Client } = require('pg');

/**
 * Database Setup Script
 * Sets up the products, reports, and dataset tables.
 */
const setup = async () => {
  const config = process.env.DATABASE_URL ? {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  } : {
    host: 'localhost',
    user: 'postgres',
    password: '123',
    database: 'postgres',
    port: 5432
  };

  const client = new Client(config);

  try {
    console.log('🔄 Connecting to PostgreSQL...');
    await client.connect();
    console.log('✅ Connected.');

    // 1. Create Tables
    console.log('🔄 Ensuring tables exist...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        serial_number VARCHAR(100) UNIQUE NOT NULL,
        product_name VARCHAR(255),
        brand VARCHAR(100),
        manufacture_date DATE,
        registered_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100),
        message TEXT,
        date TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS cp_products (
        product_id VARCHAR(100) PRIMARY KEY,
        seller_id VARCHAR(100),
        category VARCHAR(100),
        brand VARCHAR(100),
        price DECIMAL(10,2),
        seller_rating DECIMAL(3,1),
        seller_reviews INTEGER,
        product_images INTEGER,
        description_length INTEGER,
        shipping_time_days INTEGER,
        spelling_errors INTEGER,
        domain_age_days INTEGER,
        contact_info_complete BOOLEAN,
        return_policy_clear BOOLEAN,
        payment_methods_count INTEGER,
        listing_date DATE,
        seller_country VARCHAR(10),
        shipping_origin VARCHAR(10),
        views INTEGER,
        purchases INTEGER,
        wishlist_adds INTEGER,
        certification_badges INTEGER,
        warranty_months INTEGER,
        bulk_orders BOOLEAN,
        unusual_payment_patterns BOOLEAN,
        ip_location_mismatch BOOLEAN,
        is_counterfeit BOOLEAN
      );

      CREATE TABLE IF NOT EXISTS cp_transactions (
        transaction_id VARCHAR(100) PRIMARY KEY,
        customer_id VARCHAR(100),
        transaction_date TIMESTAMP,
        customer_age INTEGER,
        customer_location VARCHAR(10),
        quantity INTEGER,
        unit_price DECIMAL(10,2),
        total_amount DECIMAL(10,2),
        payment_method VARCHAR(50),
        shipping_speed VARCHAR(50),
        customer_history_orders INTEGER,
        discount_applied BOOLEAN,
        discount_percentage DECIMAL(5,2),
        shipping_cost DECIMAL(10,2),
        delivery_time_days INTEGER,
        refund_requested BOOLEAN,
        velocity_flag BOOLEAN,
        geolocation_mismatch BOOLEAN,
        device_fingerprint_new BOOLEAN,
        involves_counterfeit BOOLEAN
      );

      CREATE TABLE IF NOT EXISTS site_stats (
        stat_name VARCHAR(50) PRIMARY KEY,
        stat_value INTEGER DEFAULT 0
      );

      INSERT INTO site_stats (stat_name, stat_value) 
      VALUES ('total_fakes_found', 534) 
      ON CONFLICT (stat_name) DO NOTHING;
    `);

    console.log('✅ All tables initialized successfully.');

  } catch (err) {
    console.error('❌ Database Setup Error:', err.message);
  } finally {
    await client.end();
    process.exit();
  }
};

setup();
