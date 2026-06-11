-- Añade la columna balance a la tabla cash_registers si no existe
-- Ejecutar en Supabase SQL Editor si spring.jpa.hibernate.ddl-auto=update no la crea automáticamente

ALTER TABLE cash_registers
ADD COLUMN IF NOT EXISTS balance NUMERIC(19, 2) DEFAULT 0.00;

-- Asegura que el valor por defecto sea 0 para registros existentes
UPDATE cash_registers SET balance = 0.00 WHERE balance IS NULL;
