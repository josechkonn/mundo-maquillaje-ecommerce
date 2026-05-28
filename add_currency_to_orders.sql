-- Agregar columna id_currency a la tabla orders
-- Esta columna guarda un snapshot de la moneda usada en la transacción
ALTER TABLE orders
ADD COLUMN id_currency UUID NOT NULL DEFAULT (SELECT id FROM currencies WHERE code = 'USD' LIMIT 1);

-- Agregar constraint de foreign key
ALTER TABLE orders
ADD CONSTRAINT fk_orders_currency
FOREIGN KEY (id_currency) REFERENCES currencies(id);
