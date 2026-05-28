-- =====================================================
-- Migración: Cajas, Monedas en Órdenes y Transacciones
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- 1. Agregar columna id_currency a orders (primero nullable)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS id_currency UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_cost DOUBLE PRECISION DEFAULT 0.0;

-- Poblar shipping_cost para órdenes existentes (calcular como totalAmount - subtotal)
UPDATE orders SET shipping_cost = total_amount - subtotal WHERE shipping_cost IS NULL;
UPDATE orders SET shipping_cost = 0.0 WHERE shipping_cost IS NULL;
ALTER TABLE orders ALTER COLUMN shipping_cost SET NOT NULL;

-- Poblar order_number para órdenes existentes (secuencial por año)
DO $$
DECLARE
    rec RECORD;
    counter INT := 1;
    current_year INT;
BEGIN
    FOR rec IN SELECT id, created_at FROM orders ORDER BY created_at ASC LOOP
        current_year := EXTRACT(YEAR FROM rec.created_at);
        UPDATE orders SET order_number = LPAD(counter::TEXT, 7, '0') || '/' || current_year::TEXT WHERE id = rec.id;
        counter := counter + 1;
    END LOOP;
END $$;

UPDATE orders
SET id_currency = (SELECT id_currency FROM pmethods WHERE id = orders.id_pmethod)
WHERE id_currency IS NULL;

UPDATE orders
SET id_currency = 'd496cda6-bcaf-49c8-ab46-021db20b8164'
WHERE id_currency IS NULL;

-- 3. Fallback: si alguna orden aún no tiene moneda, usar USD
UPDATE orders
SET id_currency = 'd496cda6-bcaf-49c8-ab46-021db20b8164'
WHERE id_currency IS NULL;

-- 4. Hacer la columna NOT NULL
ALTER TABLE orders ALTER COLUMN id_currency SET NOT NULL;

-- 5. Agregar foreign key
ALTER TABLE orders
ADD CONSTRAINT IF NOT EXISTS fk_orders_currency
FOREIGN KEY (id_currency) REFERENCES currencies(id);

-- 6. Agregar columna id_currency a transactions (primero nullable)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS id_currency UUID;

-- 7. Poblar filas existentes derivando la moneda del método de pago
UPDATE transactions t
SET id_currency = (SELECT id_currency FROM pmethods WHERE id = t.id_pmethod)
WHERE id_currency IS NULL;

-- 8. Fallback: si alguna transacción aún no tiene moneda, usar USD
UPDATE transactions
SET id_currency = 'd496cda6-bcaf-49c8-ab46-021db20b8164'
WHERE id_currency IS NULL;

-- 9. Hacer la columna NOT NULL
ALTER TABLE transactions ALTER COLUMN id_currency SET NOT NULL;

-- 10. Agregar foreign key
ALTER TABLE transactions
ADD CONSTRAINT IF NOT EXISTS fk_transactions_currency
FOREIGN KEY (id_currency) REFERENCES currencies(id);

-- 11. Crear tabla cash_registers
CREATE TABLE IF NOT EXISTS cash_registers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    id_currency UUID NOT NULL REFERENCES currencies(id),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Crear 3 cajas por defecto (USD, VES, COP)
INSERT INTO cash_registers (id, name, description, id_currency, is_active)
VALUES
    (gen_random_uuid(), 'Caja USD', 'Caja para pagos en dólares', 'd496cda6-bcaf-49c8-ab46-021db20b8164', true),
    (gen_random_uuid(), 'Caja VES', 'Caja para pagos en bolívares', '23792dea-1aa4-4bc1-ad9d-a9848cafbc6f', true),
    (gen_random_uuid(), 'Caja COP', 'Caja para pagos en pesos colombianos', 'e78c3ca1-a5a5-40fd-863c-7b7de36575a3', true)
ON CONFLICT DO NOTHING;

-- 13. Agregar columna id_cash_register a pmethods (nullable, opcional)
ALTER TABLE pmethods ADD COLUMN IF NOT EXISTS id_cash_register UUID;

-- 14. Agregar foreign key
ALTER TABLE pmethods
ADD CONSTRAINT IF NOT EXISTS fk_pmethods_cash_register
FOREIGN KEY (id_cash_register) REFERENCES cash_registers(id);
