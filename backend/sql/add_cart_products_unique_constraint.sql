-- 1. LIMPIAR PRODUCTOS DUPLICADOS EN EL CARRITO
-- Elimina registros duplicados de cart_products dejando únicamente un registro
-- único por combinación de (id_cart, id_variation), sumando las cantidades
-- antes de eliminar.
BEGIN;

-- Sumar cantidades de duplicados al registro "principal" (el más antiguo)
UPDATE cart_products cp
SET quantity = sub.total_qty
FROM (
    SELECT MIN(id) AS keep_id, id_cart, id_variation, SUM(quantity) AS total_qty
    FROM cart_products
    GROUP BY id_cart, id_variation
    HAVING COUNT(*) > 1
) sub
WHERE cp.id = sub.keep_id;

-- Eliminar los duplicados (todos excepto el más antiguo por grupo)
DELETE FROM cart_products cp
WHERE cp.id NOT IN (
    SELECT MIN(id)
    FROM cart_products
    GROUP BY id_cart, id_variation
);

-- 2. AGREGAR CONSTRAINTS ÚNICOS
-- Previene futuros duplicados a nivel de base de datos
ALTER TABLE cart_products ADD CONSTRAINT uq_cart_products_cart_variation UNIQUE (id_cart, id_variation);

COMMIT;
