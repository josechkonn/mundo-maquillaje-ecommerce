-- Añade columnas necesarias a la tabla currencies según el modelo actual
-- Ejecutar en Supabase SQL Editor si spring.jpa.hibernate.ddl-auto=update no las crea automáticamente

-- Si existen columnas legacy que ya no están en el modelo, eliminarlas
-- (descomentar solo si estás seguro de que no hay datos importantes)
-- ALTER TABLE currencies DROP COLUMN IF EXISTS is_base;
-- ALTER TABLE currencies DROP COLUMN IF EXISTS is_synced;
-- ALTER TABLE currencies DROP COLUMN IF EXISTS last_rate_source;
