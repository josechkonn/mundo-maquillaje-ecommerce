-- Fix alert_quantity NULL values in existing product variations
-- Run this against your PostgreSQL database

UPDATE products_variations
SET alert_quantity = 5
WHERE alert_quantity IS NULL;

-- Ensure the column has a DEFAULT value going forward
ALTER TABLE products_variations
ALTER COLUMN alert_quantity SET DEFAULT 5;

-- Ensure the column is NOT NULL (if data is clean)
ALTER TABLE products_variations
ALTER COLUMN alert_quantity SET NOT NULL;
