-- 1. LIMPIAR PRODUCTOS DUPLICADOS EN EL CARRITO
-- Este bloque elimina registros duplicados de cart_products dejando únicamente un registro único por combinación de (id_cart, id_variation).
-- Esto resuelve de raíz el error: org.hibernate.NonUniqueResultException
DELETE FROM cart_products
WHERE id::text NOT IN (
  SELECT MIN(id::text)
  FROM cart_products
  GROUP BY id_cart, id_variation
);


-- 2. INSERTAR MÉTODOS DE ENVÍO
-- Este bloque inserta los métodos de envío 'Zoom', 'MRW' y 'Delivery' si no existen ya en la tabla shipping_methods.
INSERT INTO shipping_methods (id, name, description, price, free_shipping_threshold, is_active)
SELECT gen_random_uuid(), 'Zoom', 'Envío nacional asegurado por Zoom (Cobro en destino).', 5.00, NULL, true
WHERE NOT EXISTS (SELECT 1 FROM shipping_methods WHERE name = 'Zoom');

INSERT INTO shipping_methods (id, name, description, price, free_shipping_threshold, is_active)
SELECT gen_random_uuid(), 'MRW', 'Envío nacional rápido por MRW (Cobro en destino).', 4.50, NULL, true
WHERE NOT EXISTS (SELECT 1 FROM shipping_methods WHERE name = 'MRW');

INSERT INTO shipping_methods (id, name, description, price, free_shipping_threshold, is_active)
SELECT gen_random_uuid(), 'Delivery', 'Despacho a domicilio local en el área metropolitana.', 2.00, 50.00, true
WHERE NOT EXISTS (SELECT 1 FROM shipping_methods WHERE name = 'Delivery');

-- 3. ACTUALIZAR CONFIGURACIÓN DE ENVÍO GRATIS (Por si ya existen los registros)
UPDATE shipping_methods SET free_shipping_threshold = NULL WHERE name IN ('Zoom', 'MRW');
UPDATE shipping_methods SET free_shipping_threshold = 50.00 WHERE name = 'Delivery';
