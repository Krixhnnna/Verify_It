
CREATE DATABASE counterfeit_db;


\c counterfeit_db;

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
