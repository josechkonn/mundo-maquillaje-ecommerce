-- ============================================================
-- SEED FOUNDATIONS — Currencies, Cash Registers,
--                   Payment Methods, Shipping Methods
-- ============================================================

-- ── 1. Currencies ────────────────────────────────────────
INSERT INTO currencies (id, name, code, symbol, exchange_rate, decimal_places, symbol_position, is_active, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Dólar estadounidense', 'USD', '$',       1.0,  2, 'LEFT', true, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000002', 'Bolívar',              'VES', 'Bs',     80.0,  2, 'LEFT', true, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000003', 'Peso colombiano',      'COP', '$',      50.0,  2, 'LEFT', true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- ── 2. Cash Registers ────────────────────────────────────
INSERT INTO cash_registers (id, name, description, id_currency, balance, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Caja USD', 'Caja principal en dólares',
   (SELECT id FROM currencies WHERE code = 'USD'), 0, true, NOW(), NOW()),
  (gen_random_uuid(), 'Caja VES', 'Caja principal en bolívares',
   (SELECT id FROM currencies WHERE code = 'VES'), 0, true, NOW(), NOW()),
  (gen_random_uuid(), 'Caja COP', 'Caja principal en pesos colombianos',
   (SELECT id FROM currencies WHERE code = 'COP'), 0, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ── 3. Payment Methods ──────────────────────────────────
-- 3a. Zelle (USD)
INSERT INTO pmethods (id, name, slug, "order", is_active, id_currency, id_cash_register, image_url, created_at, edit_at)
VALUES (
  '00000000-0000-0000-0000-000000000101', 'Zelle', 'zelle', 1, true,
  (SELECT id FROM currencies WHERE code = 'USD'),
  (SELECT id FROM cash_registers WHERE name = 'Caja USD'),
  NULL, NOW(), NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO pmethods_fields (id, field, value, "order", id_pmethod)
SELECT gen_random_uuid(), 'Correo Zelle', 'zelle@tienda.com', 1, '00000000-0000-0000-0000-000000000101'
WHERE NOT EXISTS (SELECT 1 FROM pmethods_fields WHERE id_pmethod = '00000000-0000-0000-0000-000000000101' AND field = 'Correo Zelle');

INSERT INTO pmethods_fields (id, field, value, "order", id_pmethod)
SELECT gen_random_uuid(), 'Titular', 'Tienda C.A.', 2, '00000000-0000-0000-0000-000000000101'
WHERE NOT EXISTS (SELECT 1 FROM pmethods_fields WHERE id_pmethod = '00000000-0000-0000-0000-000000000101' AND field = 'Titular');

-- 3b. Transferencia Bancaria (VES)
INSERT INTO pmethods (id, name, slug, "order", is_active, id_currency, id_cash_register, image_url, created_at, edit_at)
VALUES (
  '00000000-0000-0000-0000-000000000102', 'Transferencia Bancaria', 'transferencia', 2, true,
  (SELECT id FROM currencies WHERE code = 'VES'),
  (SELECT id FROM cash_registers WHERE name = 'Caja VES'),
  NULL, NOW(), NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO pmethods_fields (id, field, value, "order", id_pmethod)
SELECT gen_random_uuid(), 'Banco', 'Banco de Venezuela', 1, '00000000-0000-0000-0000-000000000102'
WHERE NOT EXISTS (SELECT 1 FROM pmethods_fields WHERE id_pmethod = '00000000-0000-0000-0000-000000000102' AND field = 'Banco');

INSERT INTO pmethods_fields (id, field, value, "order", id_pmethod)
SELECT gen_random_uuid(), 'Número de cuenta', '0102-0000-00-0000000000', 2, '00000000-0000-0000-0000-000000000102'
WHERE NOT EXISTS (SELECT 1 FROM pmethods_fields WHERE id_pmethod = '00000000-0000-0000-0000-000000000102' AND field = 'Número de cuenta');

INSERT INTO pmethods_fields (id, field, value, "order", id_pmethod)
SELECT gen_random_uuid(), 'Titular', 'Tienda C.A.', 3, '00000000-0000-0000-0000-000000000102'
WHERE NOT EXISTS (SELECT 1 FROM pmethods_fields WHERE id_pmethod = '00000000-0000-0000-0000-000000000102' AND field = 'Titular');

INSERT INTO pmethods_fields (id, field, value, "order", id_pmethod)
SELECT gen_random_uuid(), 'Cédula/RIF', 'J-00000000-0', 4, '00000000-0000-0000-0000-000000000102'
WHERE NOT EXISTS (SELECT 1 FROM pmethods_fields WHERE id_pmethod = '00000000-0000-0000-0000-000000000102' AND field = 'Cédula/RIF');

-- 3c. Pago Móvil (VES)
INSERT INTO pmethods (id, name, slug, "order", is_active, id_currency, id_cash_register, image_url, created_at, edit_at)
VALUES (
  '00000000-0000-0000-0000-000000000103', 'Pago Móvil', 'pago-movil', 3, true,
  (SELECT id FROM currencies WHERE code = 'VES'),
  (SELECT id FROM cash_registers WHERE name = 'Caja VES'),
  NULL, NOW(), NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO pmethods_fields (id, field, value, "order", id_pmethod)
SELECT gen_random_uuid(), 'Teléfono', '0412-0000000', 1, '00000000-0000-0000-0000-000000000103'
WHERE NOT EXISTS (SELECT 1 FROM pmethods_fields WHERE id_pmethod = '00000000-0000-0000-0000-000000000103' AND field = 'Teléfono');

INSERT INTO pmethods_fields (id, field, value, "order", id_pmethod)
SELECT gen_random_uuid(), 'Banco', 'Banco de Venezuela', 2, '00000000-0000-0000-0000-000000000103'
WHERE NOT EXISTS (SELECT 1 FROM pmethods_fields WHERE id_pmethod = '00000000-0000-0000-0000-000000000103' AND field = 'Banco');

INSERT INTO pmethods_fields (id, field, value, "order", id_pmethod)
SELECT gen_random_uuid(), 'Titular', 'Tienda C.A.', 3, '00000000-0000-0000-0000-000000000103'
WHERE NOT EXISTS (SELECT 1 FROM pmethods_fields WHERE id_pmethod = '00000000-0000-0000-0000-000000000103' AND field = 'Titular');

INSERT INTO pmethods_fields (id, field, value, "order", id_pmethod)
SELECT gen_random_uuid(), 'Cédula', 'V-00000000', 4, '00000000-0000-0000-0000-000000000103'
WHERE NOT EXISTS (SELECT 1 FROM pmethods_fields WHERE id_pmethod = '00000000-0000-0000-0000-000000000103' AND field = 'Cédula');

-- 3d. Efectivo / Contra Entrega (COP)
INSERT INTO pmethods (id, name, slug, "order", is_active, id_currency, id_cash_register, image_url, created_at, edit_at)
VALUES (
  '00000000-0000-0000-0000-000000000104', 'Efectivo / Contra Entrega', 'efectivo', 4, true,
  (SELECT id FROM currencies WHERE code = 'COP'),
  (SELECT id FROM cash_registers WHERE name = 'Caja COP'),
  NULL, NOW(), NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- ── 4. Shipping Methods ──────────────────────────────────
INSERT INTO shipping_methods (id, name, description, price, free_shipping_threshold, is_active)
VALUES
  ('00000000-0000-0000-0000-000000000201', 'Delivery',
   'Envío a domicilio', 5.0, 50.0, true),
  ('00000000-0000-0000-0000-000000000202', 'Retiro en tienda',
   'Retiras personalmente por nuestra tienda', 0.0, NULL, true)
ON CONFLICT DO NOTHING;
