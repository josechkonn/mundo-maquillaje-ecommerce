-- =====================================================
-- MÉTODOS DE PAGO: Pago Móvil BDV y Nequi
-- Datos de ejemplo (ficticios) para testing
-- =====================================================

-- Verificar que existan las monedas necesarias
-- Si no existen, insertarlas primero
INSERT INTO currencies (id, name, code, symbol, exchange_rate, decimal_places, symbol_position, is_active)
SELECT gen_random_uuid(), 'Bolívar Venezolano', 'VES', 'Bs.', 36.50, 2, 'LEFT', true
WHERE NOT EXISTS (SELECT 1 FROM currencies WHERE code = 'VES');

INSERT INTO currencies (id, name, code, symbol, exchange_rate, decimal_places, symbol_position, is_active)
SELECT gen_random_uuid(), 'Peso Colombiano', 'COP', '$', 0.00024, 0, 'LEFT', true
WHERE NOT EXISTS (SELECT 1 FROM currencies WHERE code = 'COP');


-- =====================================================
-- 1. PAGO MÓVIL BDV (Banco de Venezuela) - VES
-- =====================================================
INSERT INTO pmethods (id, name, slug, "order", is_active, id_currency, created_at, edit_at)
SELECT 
    gen_random_uuid(),
    'Pago Móvil BDV',
    'pago-movil-bdv',
    1,
    true,
    (SELECT id FROM currencies WHERE code = 'VES'),
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM pmethods WHERE slug = 'pago-movil-bdv');

-- Campos del Pago Móvil BDV
INSERT INTO pmethods_fields (id, field, value, "order", id_pmethod)
SELECT 
    gen_random_uuid(),
    'Teléfono',
    '0414-1234567',
    1,
    (SELECT id FROM pmethods WHERE slug = 'pago-movil-bdv')
WHERE NOT EXISTS (
    SELECT 1 FROM pmethods_fields 
    WHERE field = 'Teléfono' 
    AND id_pmethod = (SELECT id FROM pmethods WHERE slug = 'pago-movil-bdv')
);

INSERT INTO pmethods_fields (id, field, value, "order", id_pmethod)
SELECT 
    gen_random_uuid(),
    'Cédula/RIF',
    'V-12.345.678',
    2,
    (SELECT id FROM pmethods WHERE slug = 'pago-movil-bdv')
WHERE NOT EXISTS (
    SELECT 1 FROM pmethods_fields 
    WHERE field = 'Cédula/RIF' 
    AND id_pmethod = (SELECT id FROM pmethods WHERE slug = 'pago-movil-bdv')
);

INSERT INTO pmethods_fields (id, field, value, "order", id_pmethod)
SELECT 
    gen_random_uuid(),
    'Banco',
    'Banco de Venezuela',
    3,
    (SELECT id FROM pmethods WHERE slug = 'pago-movil-bdv')
WHERE NOT EXISTS (
    SELECT 1 FROM pmethods_fields 
    WHERE field = 'Banco' 
    AND id_pmethod = (SELECT id FROM pmethods WHERE slug = 'pago-movil-bdv')
);


-- =====================================================
-- 2. NEQUI - COP
-- =====================================================
INSERT INTO pmethods (id, name, slug, "order", is_active, id_currency, created_at, edit_at)
SELECT 
    gen_random_uuid(),
    'Nequi',
    'nequi',
    2,
    true,
    (SELECT id FROM currencies WHERE code = 'COP'),
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM pmethods WHERE slug = 'nequi');

-- Campo de Nequi
INSERT INTO pmethods_fields (id, field, value, "order", id_pmethod)
SELECT 
    gen_random_uuid(),
    'Número de celular',
    '300-1234567',
    1,
    (SELECT id FROM pmethods WHERE slug = 'nequi')
WHERE NOT EXISTS (
    SELECT 1 FROM pmethods_fields 
    WHERE field = 'Número de celular' 
    AND id_pmethod = (SELECT id FROM pmethods WHERE slug = 'nequi')
);


-- =====================================================
-- VERIFICACIÓN: Consultar métodos creados
-- =====================================================
SELECT 
    pm.name AS "Método de Pago",
    pm.slug AS "Slug",
    c.code AS "Moneda",
    pf.field AS "Campo",
    pf.value AS "Valor"
FROM pmethods pm
JOIN currencies c ON pm.id_currency = c.id
LEFT JOIN pmethods_fields pf ON pm.id = pf.id_pmethod
WHERE pm.slug IN ('pago-movil-bdv', 'nequi')
ORDER BY pm."order", pf."order";
