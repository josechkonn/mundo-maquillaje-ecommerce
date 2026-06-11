-- ============================================================
-- SEED DATA FOR DASHBOARD TESTING (Supabase compatible)
-- Column names match actual JPA @JoinColumn definitions
-- ============================================================

-- ── 0. Clean previous test data ──────────────────────────
DELETE FROM transactions;
DELETE FROM order_products;
DELETE FROM order_directions;
DELETE FROM orders;
DELETE FROM cart_products;
DELETE FROM carts;
DELETE FROM tracking_events;
DELETE FROM monthly_goals;
DELETE FROM profiles WHERE email LIKE '%@test.com';
DELETE FROM parishes;
DELETE FROM municipalities;
DELETE FROM cities;
DELETE FROM states;

-- ── 0.5. Insert Venezuelan states, municipalities, parishes ────
-- States
INSERT INTO states (id, name) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Amazonas'),
  ('a0000000-0000-0000-0000-000000000002', 'Anzoátegui'),
  ('a0000000-0000-0000-0000-000000000003', 'Apure'),
  ('a0000000-0000-0000-0000-000000000004', 'Aragua'),
  ('a0000000-0000-0000-0000-000000000005', 'Barinas'),
  ('a0000000-0000-0000-0000-000000000006', 'Bolívar'),
  ('a0000000-0000-0000-0000-000000000007', 'Carabobo'),
  ('a0000000-0000-0000-0000-000000000008', 'Cojedes'),
  ('a0000000-0000-0000-0000-000000000009', 'Delta Amacuro'),
  ('a0000000-0000-0000-0000-000000000010', 'Distrito Capital'),
  ('a0000000-0000-0000-0000-000000000011', 'Falcón'),
  ('a0000000-0000-0000-0000-000000000012', 'Guárico'),
  ('a0000000-0000-0000-0000-000000000013', 'Lara'),
  ('a0000000-0000-0000-0000-000000000014', 'La Guaira'),
  ('a0000000-0000-0000-0000-000000000015', 'Mérida'),
  ('a0000000-0000-0000-0000-000000000016', 'Miranda'),
  ('a0000000-0000-0000-0000-000000000017', 'Monagas'),
  ('a0000000-0000-0000-0000-000000000018', 'Nueva Esparta'),
  ('a0000000-0000-0000-0000-000000000019', 'Portuguesa'),
  ('a0000000-0000-0000-0000-000000000020', 'Sucre'),
  ('a0000000-0000-0000-0000-000000000021', 'Táchira'),
  ('a0000000-0000-0000-0000-000000000022', 'Trujillo'),
  ('a0000000-0000-0000-0000-000000000023', 'Yaracuy'),
  ('a0000000-0000-0000-0000-000000000024', 'Zulia');

-- Municipalities (2 per state, real names)
INSERT INTO municipalities (id, name, id_city) VALUES
  -- Amazonas (city: Puerto Ayacucho)
  ('b0000000-0000-0000-0000-000000000001', 'Atures', 'd0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000002', 'Autana', 'd0000000-0000-0000-0000-000000000001'),
  -- Anzoátegui (cities: Barcelona, Puerto La Cruz)
  ('b0000000-0000-0000-0000-000000000003', 'Simón Bolívar', 'd0000000-0000-0000-0000-000000000002'),
  ('b0000000-0000-0000-0000-000000000004', 'Sotillo', 'd0000000-0000-0000-0000-000000000003'),
  -- Apure (city: San Fernando)
  ('b0000000-0000-0000-0000-000000000005', 'Páez', 'd0000000-0000-0000-0000-000000000004'),
  ('b0000000-0000-0000-0000-000000000006', 'Muñoz', 'd0000000-0000-0000-0000-000000000004'),
  -- Aragua (city: Maracay)
  ('b0000000-0000-0000-0000-000000000007', 'Girardot', 'd0000000-0000-0000-0000-000000000005'),
  ('b0000000-0000-0000-0000-000000000008', 'Mario Briceño Iragorry', 'd0000000-0000-0000-0000-000000000005'),
  -- Barinas (city: Barinas)
  ('b0000000-0000-0000-0000-000000000009', 'Barinas', 'd0000000-0000-0000-0000-000000000006'),
  ('b0000000-0000-0000-0000-000000000010', 'Ezequiel Zamora', 'd0000000-0000-0000-0000-000000000006'),
  -- Bolívar (cities: Ciudad Guayana, Ciudad Bolívar)
  ('b0000000-0000-0000-0000-000000000011', 'Caroní', 'd0000000-0000-0000-0000-000000000008'),
  ('b0000000-0000-0000-0000-000000000012', 'Heres', 'd0000000-0000-0000-0000-000000000007'),
  -- Carabobo (cities: Valencia, Naguanagua)
  ('b0000000-0000-0000-0000-000000000013', 'Valencia', 'd0000000-0000-0000-0000-000000000009'),
  ('b0000000-0000-0000-0000-000000000014', 'Naguanagua', 'd0000000-0000-0000-0000-000000000010'),
  -- Cojedes (city: San Carlos)
  ('b0000000-0000-0000-0000-000000000015', 'Tinaquillo', 'd0000000-0000-0000-0000-000000000011'),
  ('b0000000-0000-0000-0000-000000000016', 'Girardot', 'd0000000-0000-0000-0000-000000000011'),
  -- Delta Amacuro (city: Tucupita)
  ('b0000000-0000-0000-0000-000000000017', 'Tucupita', 'd0000000-0000-0000-0000-000000000012'),
  ('b0000000-0000-0000-0000-000000000018', 'Antonio Díaz', 'd0000000-0000-0000-0000-000000000012'),
  -- Distrito Capital (city: Caracas)
  ('b0000000-0000-0000-0000-000000000019', 'Libertador', 'd0000000-0000-0000-0000-000000000013'),
  ('b0000000-0000-0000-0000-000000000020', 'Libertador', 'd0000000-0000-0000-0000-000000000013'),
  -- Falcón (cities: Coro, Punto Fijo)
  ('b0000000-0000-0000-0000-000000000021', 'Miranda', 'd0000000-0000-0000-0000-000000000015'),
  ('b0000000-0000-0000-0000-000000000022', 'Colina', 'd0000000-0000-0000-0000-000000000016'),
  -- Guárico (cities: San Juan de los Morros, Calabozo)
  ('b0000000-0000-0000-0000-000000000023', 'San Juan de Los Morros', 'd0000000-0000-0000-0000-000000000017'),
  ('b0000000-0000-0000-0000-000000000024', 'Ortiz', 'd0000000-0000-0000-0000-000000000018'),
  -- Lara (city: Barquisimeto)
  ('b0000000-0000-0000-0000-000000000025', 'Iribarren', 'd0000000-0000-0000-0000-000000000019'),
  ('b0000000-0000-0000-0000-000000000026', 'Jiménez', 'd0000000-0000-0000-0000-000000000019'),
  -- La Guaira (city: Catia La Mar)
  ('b0000000-0000-0000-0000-000000000027', 'Vargas', 'd0000000-0000-0000-0000-000000000014'),
  ('b0000000-0000-0000-0000-000000000028', 'Vargas', 'd0000000-0000-0000-0000-000000000014'),
  -- Mérida (cities: Mérida, El Vigía)
  ('b0000000-0000-0000-0000-000000000029', 'Libertador', 'd0000000-0000-0000-0000-000000000021'),
  ('b0000000-0000-0000-0000-000000000030', 'Campo Elías', 'd0000000-0000-0000-0000-000000000022'),
  -- Miranda (cities: Los Teques, Guarenas)
  ('b0000000-0000-0000-0000-000000000031', 'Chacao', 'd0000000-0000-0000-0000-000000000023'),
  ('b0000000-0000-0000-0000-000000000032', 'Sucre', 'd0000000-0000-0000-0000-000000000024'),
  -- Monagas (city: Maturín)
  ('b0000000-0000-0000-0000-000000000033', 'Maturín', 'd0000000-0000-0000-0000-000000000025'),
  ('b0000000-0000-0000-0000-000000000034', 'Punceres', 'd0000000-0000-0000-0000-000000000025'),
  -- Nueva Esparta (cities: Porlamar, La Asunción)
  ('b0000000-0000-0000-0000-000000000035', 'Mariño', 'd0000000-0000-0000-0000-000000000027'),
  ('b0000000-0000-0000-0000-000000000036', 'Maneiro', 'd0000000-0000-0000-0000-000000000026'),
  -- Portuguesa (cities: Guanare, Acarigua)
  ('b0000000-0000-0000-0000-000000000037', 'Guanare', 'd0000000-0000-0000-0000-000000000028'),
  ('b0000000-0000-0000-0000-000000000038', 'Ospino', 'd0000000-0000-0000-0000-000000000029'),
  -- Sucre (cities: Cumaná, Carúpano)
  ('b0000000-0000-0000-0000-000000000039', 'Sucre', 'd0000000-0000-0000-0000-000000000030'),
  ('b0000000-0000-0000-0000-000000000040', 'Ribero', 'd0000000-0000-0000-0000-000000000031'),
  -- Táchira (cities: San Cristóbal, Táriba)
  ('b0000000-0000-0000-0000-000000000041', 'San Cristóbal', 'd0000000-0000-0000-0000-000000000032'),
  ('b0000000-0000-0000-0000-000000000042', 'Cárdenas', 'd0000000-0000-0000-0000-000000000033'),
  -- Trujillo (cities: Trujillo, Valera)
  ('b0000000-0000-0000-0000-000000000043', 'Trujillo', 'd0000000-0000-0000-0000-000000000035'),
  ('b0000000-0000-0000-0000-000000000044', 'Valera', 'd0000000-0000-0000-0000-000000000034'),
  -- Yaracuy (cities: San Felipe, Yaritagua)
  ('b0000000-0000-0000-0000-000000000045', 'Peña', 'd0000000-0000-0000-0000-000000000036'),
  ('b0000000-0000-0000-0000-000000000046', 'Bolívar', 'd0000000-0000-0000-0000-000000000037'),
  -- Zulia (cities: Maracaibo, Cabimas)
  ('b0000000-0000-0000-0000-000000000047', 'Maracaibo', 'd0000000-0000-0000-0000-000000000038'),
  ('b0000000-0000-0000-0000-000000000048', 'San Francisco', 'd0000000-0000-0000-0000-000000000038');

-- Parishes (2 per municipality, real names)
INSERT INTO parishes (id, name, id_municipality) VALUES
  -- Atures
  ('c0000000-0000-0000-0000-000000000001', 'Fernando Girón Tovar', 'b0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000002', 'Alto Ventuari', 'b0000000-0000-0000-0000-000000000001'),
  -- Autana
  ('c0000000-0000-0000-0000-000000000003', 'Isla Ratón', 'b0000000-0000-0000-0000-000000000002'),
  ('c0000000-0000-0000-0000-000000000004', 'Samariapo', 'b0000000-0000-0000-0000-000000000002'),
  -- Simón Bolívar
  ('c0000000-0000-0000-0000-000000000005', 'Bergatín', 'b0000000-0000-0000-0000-000000000003'),
  ('c0000000-0000-0000-0000-000000000006', 'Caigua', 'b0000000-0000-0000-0000-000000000003'),
  -- Sotillo
  ('c0000000-0000-0000-0000-000000000007', 'Puerto La Cruz', 'b0000000-0000-0000-0000-000000000004'),
  ('c0000000-0000-0000-0000-000000000008', 'Pozuelos', 'b0000000-0000-0000-0000-000000000004'),
  -- Páez
  ('c0000000-0000-0000-0000-000000000009', 'Guasdualito', 'b0000000-0000-0000-0000-000000000005'),
  ('c0000000-0000-0000-0000-000000000010', 'Aramendi', 'b0000000-0000-0000-0000-000000000005'),
  -- Muñoz
  ('c0000000-0000-0000-0000-000000000011', 'Bruzual', 'b0000000-0000-0000-0000-000000000006'),
  ('c0000000-0000-0000-0000-000000000012', 'Mantecal', 'b0000000-0000-0000-0000-000000000006'),
  -- Girardot (Aragua)
  ('c0000000-0000-0000-0000-000000000013', 'Pedro José Ovalles', 'b0000000-0000-0000-0000-000000000007'),
  ('c0000000-0000-0000-0000-000000000014', 'Joaquín Crespo', 'b0000000-0000-0000-0000-000000000007'),
  -- Mario Briceño Iragorry
  ('c0000000-0000-0000-0000-000000000015', 'Caña de Azúcar', 'b0000000-0000-0000-0000-000000000008'),
  ('c0000000-0000-0000-0000-000000000016', 'El Limón', 'b0000000-0000-0000-0000-000000000008'),
  -- Barinas
  ('c0000000-0000-0000-0000-000000000017', 'Barinas', 'b0000000-0000-0000-0000-000000000009'),
  ('c0000000-0000-0000-0000-000000000018', 'Alberto Arvelo Torrealba', 'b0000000-0000-0000-0000-000000000009'),
  -- Ezequiel Zamora
  ('c0000000-0000-0000-0000-000000000019', 'Santa Bárbara', 'b0000000-0000-0000-0000-000000000010'),
  ('c0000000-0000-0000-0000-000000000020', 'Pedro Briceño Méndez', 'b0000000-0000-0000-0000-000000000010'),
  -- Caroní
  ('c0000000-0000-0000-0000-000000000021', 'Vista al Sol', 'b0000000-0000-0000-0000-000000000011'),
  ('c0000000-0000-0000-0000-000000000022', 'Chirica', 'b0000000-0000-0000-0000-000000000011'),
  -- Heres
  ('c0000000-0000-0000-0000-000000000023', 'Catedral', 'b0000000-0000-0000-0000-000000000012'),
  ('c0000000-0000-0000-0000-000000000024', 'Zea', 'b0000000-0000-0000-0000-000000000012'),
  -- Valencia
  ('c0000000-0000-0000-0000-000000000025', 'Candelaria', 'b0000000-0000-0000-0000-000000000013'),
  ('c0000000-0000-0000-0000-000000000026', 'Catedral', 'b0000000-0000-0000-0000-000000000013'),
  -- Naguanagua
  ('c0000000-0000-0000-0000-000000000027', 'Naguanagua', 'b0000000-0000-0000-0000-000000000014'),
  ('c0000000-0000-0000-0000-000000000028', 'Naguanagua', 'b0000000-0000-0000-0000-000000000014'),
  -- Tinaquillo
  ('c0000000-0000-0000-0000-000000000029', 'Tinaquillo', 'b0000000-0000-0000-0000-000000000015'),
  ('c0000000-0000-0000-0000-000000000030', 'El Baúl', 'b0000000-0000-0000-0000-000000000015'),
  -- Girardot (Cojedes)
  ('c0000000-0000-0000-0000-000000000031', 'El Baúl', 'b0000000-0000-0000-0000-000000000016'),
  ('c0000000-0000-0000-0000-000000000032', 'Sucre', 'b0000000-0000-0000-0000-000000000016'),
  -- Tucupita
  ('c0000000-0000-0000-0000-000000000033', 'San José', 'b0000000-0000-0000-0000-000000000017'),
  ('c0000000-0000-0000-0000-000000000034', 'Juan Millán', 'b0000000-0000-0000-0000-000000000017'),
  -- Antonio Díaz
  ('c0000000-0000-0000-0000-000000000035', 'Curiapo', 'b0000000-0000-0000-0000-000000000018'),
  ('c0000000-0000-0000-0000-000000000036', 'Almirante Luis Brión', 'b0000000-0000-0000-0000-000000000018'),
  -- Libertador (DC)
  ('c0000000-0000-0000-0000-000000000037', 'Catedral', 'b0000000-0000-0000-0000-000000000019'),
  ('c0000000-0000-0000-0000-000000000038', 'Altagracia', 'b0000000-0000-0000-0000-000000000019'),
  -- Libertador (DC dup)
  ('c0000000-0000-0000-0000-000000000039', 'San Juan', 'b0000000-0000-0000-0000-000000000020'),
  ('c0000000-0000-0000-0000-000000000040', 'San Agustín', 'b0000000-0000-0000-0000-000000000020'),
  -- Miranda (Falcón)
  ('c0000000-0000-0000-0000-000000000041', 'Casigua', 'b0000000-0000-0000-0000-000000000021'),
  ('c0000000-0000-0000-0000-000000000042', 'Guzmán Guillermo', 'b0000000-0000-0000-0000-000000000021'),
  -- Colina
  ('c0000000-0000-0000-0000-000000000043', 'La Vela de Coro', 'b0000000-0000-0000-0000-000000000022'),
  ('c0000000-0000-0000-0000-000000000044', 'Acurigua', 'b0000000-0000-0000-0000-000000000022'),
  -- San Juan de Los Morros
  ('c0000000-0000-0000-0000-000000000045', 'San Juan de Los Morros', 'b0000000-0000-0000-0000-000000000023'),
  ('c0000000-0000-0000-0000-000000000046', 'El Sombrero', 'b0000000-0000-0000-0000-000000000023'),
  -- Ortiz
  ('c0000000-0000-0000-0000-000000000047', 'Ortiz', 'b0000000-0000-0000-0000-000000000024'),
  ('c0000000-0000-0000-0000-000000000048', 'San Francisco de Asís', 'b0000000-0000-0000-0000-000000000024'),
  -- Iribarren
  ('c0000000-0000-0000-0000-000000000049', 'Unión', 'b0000000-0000-0000-0000-000000000025'),
  ('c0000000-0000-0000-0000-000000000050', 'Catedral', 'b0000000-0000-0000-0000-000000000025'),
  -- Jiménez
  ('c0000000-0000-0000-0000-000000000051', 'Quíbor', 'b0000000-0000-0000-0000-000000000026'),
  ('c0000000-0000-0000-0000-000000000052', 'Juan Bautista Rodríguez', 'b0000000-0000-0000-0000-000000000026'),
  -- Vargas
  ('c0000000-0000-0000-0000-000000000053', 'Caraballeda', 'b0000000-0000-0000-0000-000000000027'),
  ('c0000000-0000-0000-0000-000000000054', 'Catia La Mar', 'b0000000-0000-0000-0000-000000000027'),
  -- Vargas dup
  ('c0000000-0000-0000-0000-000000000055', 'La Guaira', 'b0000000-0000-0000-0000-000000000028'),
  ('c0000000-0000-0000-0000-000000000056', 'Macuto', 'b0000000-0000-0000-0000-000000000028'),
  -- Libertador (Mérida)
  ('c0000000-0000-0000-0000-000000000057', 'Arias', 'b0000000-0000-0000-0000-000000000029'),
  ('c0000000-0000-0000-0000-000000000058', 'Caracciolo Parra Olmedo', 'b0000000-0000-0000-0000-000000000029'),
  -- Campo Elías
  ('c0000000-0000-0000-0000-000000000059', 'Ejido', 'b0000000-0000-0000-0000-000000000030'),
  ('c0000000-0000-0000-0000-000000000060', 'Fernández Peña', 'b0000000-0000-0000-0000-000000000030'),
  -- Chacao
  ('c0000000-0000-0000-0000-000000000061', 'Chacao', 'b0000000-0000-0000-0000-000000000031'),
  ('c0000000-0000-0000-0000-000000000062', 'Chacao', 'b0000000-0000-0000-0000-000000000031'),
  -- Sucre (Miranda)
  ('c0000000-0000-0000-0000-000000000063', 'Petare', 'b0000000-0000-0000-0000-000000000032'),
  ('c0000000-0000-0000-0000-000000000064', 'Leoncio Martínez', 'b0000000-0000-0000-0000-000000000032'),
  -- Maturín
  ('c0000000-0000-0000-0000-000000000065', 'Maturín', 'b0000000-0000-0000-0000-000000000033'),
  ('c0000000-0000-0000-0000-000000000066', 'San Simón', 'b0000000-0000-0000-0000-000000000033'),
  -- Punceres
  ('c0000000-0000-0000-0000-000000000067', 'Quiriquire', 'b0000000-0000-0000-0000-000000000034'),
  ('c0000000-0000-0000-0000-000000000068', 'Cachipo', 'b0000000-0000-0000-0000-000000000034'),
  -- Mariño
  ('c0000000-0000-0000-0000-000000000069', 'Porlamar', 'b0000000-0000-0000-0000-000000000035'),
  ('c0000000-0000-0000-0000-000000000070', 'Porlamar', 'b0000000-0000-0000-0000-000000000035'),
  -- Maneiro
  ('c0000000-0000-0000-0000-000000000071', 'Aguirre', 'b0000000-0000-0000-0000-000000000036'),
  ('c0000000-0000-0000-0000-000000000072', 'Pampatar', 'b0000000-0000-0000-0000-000000000036'),
  -- Guanare
  ('c0000000-0000-0000-0000-000000000073', 'Guanare', 'b0000000-0000-0000-0000-000000000037'),
  ('c0000000-0000-0000-0000-000000000074', 'Córdoba', 'b0000000-0000-0000-0000-000000000037'),
  -- Ospino
  ('c0000000-0000-0000-0000-000000000075', 'Ospino', 'b0000000-0000-0000-0000-000000000038'),
  ('c0000000-0000-0000-0000-000000000076', 'Aparición', 'b0000000-0000-0000-0000-000000000038'),
  -- Sucre (Sucre)
  ('c0000000-0000-0000-0000-000000000077', 'Cumaná', 'b0000000-0000-0000-0000-000000000039'),
  ('c0000000-0000-0000-0000-000000000078', 'Santa Inés', 'b0000000-0000-0000-0000-000000000039'),
  -- Ribero
  ('c0000000-0000-0000-0000-000000000079', 'Cariaco', 'b0000000-0000-0000-0000-000000000040'),
  ('c0000000-0000-0000-0000-000000000080', 'Ricaurte', 'b0000000-0000-0000-0000-000000000040'),
  -- San Cristóbal
  ('c0000000-0000-0000-0000-000000000081', 'La Concordia', 'b0000000-0000-0000-0000-000000000041'),
  ('c0000000-0000-0000-0000-000000000082', 'San Juan Bautista', 'b0000000-0000-0000-0000-000000000041'),
  -- Cárdenas
  ('c0000000-0000-0000-0000-000000000083', 'Táriba', 'b0000000-0000-0000-0000-000000000042'),
  ('c0000000-0000-0000-0000-000000000084', 'Amenodoro Rangel Lamús', 'b0000000-0000-0000-0000-000000000042'),
  -- Trujillo
  ('c0000000-0000-0000-0000-000000000085', 'Trujillo', 'b0000000-0000-0000-0000-000000000043'),
  ('c0000000-0000-0000-0000-000000000086', 'Andrés Linares', 'b0000000-0000-0000-0000-000000000043'),
  -- Valera
  ('c0000000-0000-0000-0000-000000000087', 'Juan Ignacio Montilla', 'b0000000-0000-0000-0000-000000000044'),
  ('c0000000-0000-0000-0000-000000000088', 'La Puerta', 'b0000000-0000-0000-0000-000000000044'),
  -- Peña
  ('c0000000-0000-0000-0000-000000000089', 'Yaritagua', 'b0000000-0000-0000-0000-000000000045'),
  ('c0000000-0000-0000-0000-000000000090', 'San Andrés', 'b0000000-0000-0000-0000-000000000045'),
  -- Bolívar (Yaracuy)
  ('c0000000-0000-0000-0000-000000000091', 'Aroa', 'b0000000-0000-0000-0000-000000000046'),
  ('c0000000-0000-0000-0000-000000000092', 'San Andrés', 'b0000000-0000-0000-0000-000000000046'),
  -- Maracaibo
  ('c0000000-0000-0000-0000-000000000093', 'Cacique Mara', 'b0000000-0000-0000-0000-000000000047'),
  ('c0000000-0000-0000-0000-000000000094', 'Cristo de Aranza', 'b0000000-0000-0000-0000-000000000047'),
  -- San Francisco
  ('c0000000-0000-0000-0000-000000000095', 'San Francisco', 'b0000000-0000-0000-0000-000000000048'),
  ('c0000000-0000-0000-0000-000000000096', 'El Bajo', 'b0000000-0000-0000-0000-000000000048');

-- ── 0.6. Insert Venezuelan cities ────────────────────────
INSERT INTO cities (id, name, id_state) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'Puerto Ayacucho', 'a0000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000002', 'Barcelona', 'a0000000-0000-0000-0000-000000000002'),
  ('d0000000-0000-0000-0000-000000000003', 'Puerto La Cruz', 'a0000000-0000-0000-0000-000000000002'),
  ('d0000000-0000-0000-0000-000000000004', 'San Fernando', 'a0000000-0000-0000-0000-000000000003'),
  ('d0000000-0000-0000-0000-000000000005', 'Maracay', 'a0000000-0000-0000-0000-000000000004'),
  ('d0000000-0000-0000-0000-000000000006', 'Barinas', 'a0000000-0000-0000-0000-000000000005'),
  ('d0000000-0000-0000-0000-000000000007', 'Ciudad Bolívar', 'a0000000-0000-0000-0000-000000000006'),
  ('d0000000-0000-0000-0000-000000000008', 'Ciudad Guayana', 'a0000000-0000-0000-0000-000000000006'),
  ('d0000000-0000-0000-0000-000000000009', 'Valencia', 'a0000000-0000-0000-0000-000000000007'),
  ('d0000000-0000-0000-0000-000000000010', 'Naguanagua', 'a0000000-0000-0000-0000-000000000007'),
  ('d0000000-0000-0000-0000-000000000011', 'San Carlos', 'a0000000-0000-0000-0000-000000000008'),
  ('d0000000-0000-0000-0000-000000000012', 'Tucupita', 'a0000000-0000-0000-0000-000000000009'),
  ('d0000000-0000-0000-0000-000000000013', 'Caracas', 'a0000000-0000-0000-0000-000000000010'),
  ('d0000000-0000-0000-0000-000000000014', 'Catia La Mar', 'a0000000-0000-0000-0000-000000000014'),
  ('d0000000-0000-0000-0000-000000000015', 'Coro', 'a0000000-0000-0000-0000-000000000011'),
  ('d0000000-0000-0000-0000-000000000016', 'Punto Fijo', 'a0000000-0000-0000-0000-000000000011'),
  ('d0000000-0000-0000-0000-000000000017', 'San Juan de los Morros', 'a0000000-0000-0000-0000-000000000012'),
  ('d0000000-0000-0000-0000-000000000018', 'Calabozo', 'a0000000-0000-0000-0000-000000000012'),
  ('d0000000-0000-0000-0000-000000000019', 'Barquisimeto', 'a0000000-0000-0000-0000-000000000013'),
  ('d0000000-0000-0000-0000-000000000020', 'La Grita', 'a0000000-0000-0000-0000-000000000021'),
  ('d0000000-0000-0000-0000-000000000021', 'Mérida', 'a0000000-0000-0000-0000-000000000015'),
  ('d0000000-0000-0000-0000-000000000022', 'El Vigía', 'a0000000-0000-0000-0000-000000000015'),
  ('d0000000-0000-0000-0000-000000000023', 'Los Teques', 'a0000000-0000-0000-0000-000000000016'),
  ('d0000000-0000-0000-0000-000000000024', 'Guarenas', 'a0000000-0000-0000-0000-000000000016'),
  ('d0000000-0000-0000-0000-000000000025', 'Maturín', 'a0000000-0000-0000-0000-000000000017'),
  ('d0000000-0000-0000-0000-000000000026', 'La Asunción', 'a0000000-0000-0000-0000-000000000018'),
  ('d0000000-0000-0000-0000-000000000027', 'Porlamar', 'a0000000-0000-0000-0000-000000000018'),
  ('d0000000-0000-0000-0000-000000000028', 'Guanare', 'a0000000-0000-0000-0000-000000000019'),
  ('d0000000-0000-0000-0000-000000000029', 'Acarigua', 'a0000000-0000-0000-0000-000000000019'),
  ('d0000000-0000-0000-0000-000000000030', 'Cumaná', 'a0000000-0000-0000-0000-000000000020'),
  ('d0000000-0000-0000-0000-000000000031', 'Carúpano', 'a0000000-0000-0000-0000-000000000020'),
  ('d0000000-0000-0000-0000-000000000032', 'San Cristóbal', 'a0000000-0000-0000-0000-000000000021'),
  ('d0000000-0000-0000-0000-000000000033', 'Táriba', 'a0000000-0000-0000-0000-000000000021'),
  ('d0000000-0000-0000-0000-000000000034', 'Valera', 'a0000000-0000-0000-0000-000000000022'),
  ('d0000000-0000-0000-0000-000000000035', 'Trujillo', 'a0000000-0000-0000-0000-000000000022'),
  ('d0000000-0000-0000-0000-000000000036', 'San Felipe', 'a0000000-0000-0000-0000-000000000023'),
  ('d0000000-0000-0000-0000-000000000037', 'Yaritagua', 'a0000000-0000-0000-0000-000000000023'),
  ('d0000000-0000-0000-0000-000000000038', 'Maracaibo', 'a0000000-0000-0000-0000-000000000024'),
  ('d0000000-0000-0000-0000-000000000039', 'Cabimas', 'a0000000-0000-0000-0000-000000000024'),
  ('d0000000-0000-0000-0000-000000000040', 'Ciudad Ojeda', 'a0000000-0000-0000-0000-000000000024');

-- ── 1. Insert fake profiles with lastAccessAt + random state ──
DO $$
DECLARE
    i INT;
    fake_name TEXT;
    fake_email TEXT;
    fake_last_access TIMESTAMP;
    random_state_id UUID;
BEGIN
    FOR i IN 1..200 LOOP
        fake_name := 'Usuario ' || i;
        fake_email := 'usuario' || i || '@test.com';
        fake_last_access := NOW() - (random() * 45 || ' days')::INTERVAL;

        SELECT id INTO random_state_id FROM states ORDER BY random() LIMIT 1;

        INSERT INTO profiles (id, name, email, role, last_access_at, id_state, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            fake_name,
            fake_email,
            CASE WHEN i <= 5 THEN 'ADMIN' WHEN i <= 20 THEN 'EMPLOYEE' ELSE 'USER' END,
            fake_last_access,
            random_state_id,
            NOW() - (random() * 180 || ' days')::INTERVAL,
            NOW() - (random() * 30 || ' days')::INTERVAL
        )
        ON CONFLICT (email) DO NOTHING;
    END LOOP;
END $$;

-- ── 2. Insert fake tracking events ────────────────────────
DO $$
DECLARE
    i INT;
    event_type TEXT;
    event_date TIMESTAMP;
    fake_ip TEXT;
    fake_session TEXT;
    fake_prod_id UUID;
BEGIN
    FOR i IN 1..5000 LOOP
        event_type := CASE
            WHEN random() < 0.5 THEN 'PAGE_VIEW'
            WHEN random() < 0.7 THEN 'PRODUCT_VIEW'
            WHEN random() < 0.85 THEN 'ADD_TO_CART'
            WHEN random() < 0.95 THEN 'CHECKOUT_START'
            ELSE 'PURCHASE'
        END;

        event_date := NOW() - (random() * 30 || ' days')::INTERVAL - (random() * 24 || ' hours')::INTERVAL;
        fake_ip := (floor(random() * 255)::INT || '.' || floor(random() * 255)::INT || '.' || floor(random() * 255)::INT || '.' || floor(random() * 255)::INT);
        fake_session := gen_random_uuid()::TEXT;

        IF event_type IN ('PRODUCT_VIEW', 'ADD_TO_CART') THEN
            SELECT id INTO fake_prod_id FROM products ORDER BY random() LIMIT 1;
        ELSE
            fake_prod_id := NULL;
        END IF;

        INSERT INTO tracking_events (id, event_type, user_id, product_id, ip_address, session_id, metadata, created_at)
        VALUES (
            gen_random_uuid(),
            event_type,
            CASE WHEN random() < 0.3 THEN (SELECT id FROM profiles ORDER BY random() LIMIT 1) ELSE NULL END,
            fake_prod_id,
            fake_ip,
            fake_session,
            CASE WHEN event_type = 'ADD_TO_CART' THEN '{"quantity": ' || (floor(random() * 5) + 1)::TEXT || '}' ELSE NULL END,
            event_date
        );
    END LOOP;
END $$;

-- ── 3. Insert fake orders with realistic amounts ──────────
DO $$
DECLARE
    i INT;
    order_date TIMESTAMP;
    fake_subtotal DOUBLE PRECISION;
    fake_total DOUBLE PRECISION;
    curr_id UUID;
    curr_code TEXT;
    fake_user_id UUID;
    fake_shipping_id UUID;
    fake_pmethod_id UUID;
    fake_order_number TEXT;
    fake_status TEXT;
BEGIN
    SELECT id INTO fake_shipping_id FROM shipping_methods ORDER BY random() LIMIT 1;
    SELECT id INTO fake_pmethod_id FROM pmethods ORDER BY random() LIMIT 1;

    FOR i IN 1..500 LOOP
        order_date := NOW() - (random() * 30 || ' days')::INTERVAL - (random() * 24 || ' hours')::INTERVAL;

        SELECT id, code INTO curr_id, curr_code FROM currencies ORDER BY random() LIMIT 1;

        fake_subtotal := CASE curr_code
            WHEN 'USD' THEN (random() * 80 + 5)::INT
            WHEN 'VES' THEN (random() * 300000 + 10000)::INT
            WHEN 'COP' THEN (random() * 1500000 + 50000)::INT
            ELSE (random() * 80 + 5)::INT
        END;
        fake_total := fake_subtotal + (fake_subtotal * 0.16);

        SELECT id INTO fake_user_id FROM profiles WHERE role = 'USER' ORDER BY random() LIMIT 1;

        fake_order_number := 'ORD-' || to_char(order_date, 'YYYYMMDD') || '-' || lpad(i::TEXT, 4, '0');

        fake_status := CASE
            WHEN random() < 0.6 THEN 'PAID'
            WHEN random() < 0.8 THEN 'PROCESSING'
            WHEN random() < 0.9 THEN 'DELIVERED'
            ELSE 'SHIPPED'
        END;

        INSERT INTO orders (
            id, id_user, id_currency, id_shipping_method, id_pmethod,
            order_number,
            subtotal, tax_amount, discount_amount, shipping_cost, total_amount,
            status, created_at, updated_at
        )
        VALUES (
            gen_random_uuid(),
            fake_user_id,
            curr_id,
            fake_shipping_id,
            fake_pmethod_id,
            fake_order_number,
            fake_subtotal,
            fake_subtotal * 0.16,
            0,
            CASE WHEN curr_code = 'VES' THEN 10000 WHEN curr_code = 'COP' THEN 50000 ELSE 10 END,
            fake_total,
            fake_status,
            order_date,
            order_date
        );
    END LOOP;
END $$;

-- ── 4. Insert fake order_products ─────────────────────────
DO $$
DECLARE
    order_rec RECORD;
    i INT;
    curr_code TEXT;
    fake_variation_id UUID;
    fake_price DOUBLE PRECISION;
    fake_qty INT;
    fake_subtotal DOUBLE PRECISION;
BEGIN
    FOR order_rec IN SELECT o.id, c.code FROM orders o JOIN currencies c ON o.id_currency = c.id WHERE o.status IN ('PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED') LOOP
        curr_code := order_rec.code;

        FOR i IN 1..(floor(random() * 4) + 1)::INT LOOP
            SELECT id INTO fake_variation_id FROM products_variations ORDER BY random() LIMIT 1;
            fake_price := CASE curr_code
                WHEN 'USD' THEN (random() * 30 + 5)::INT
                WHEN 'VES' THEN (random() * 100000 + 5000)::INT
                WHEN 'COP' THEN (random() * 500000 + 20000)::INT
                ELSE (random() * 30 + 5)::INT
            END;
            fake_qty := (floor(random() * 5) + 1)::INT;
            fake_subtotal := fake_price * fake_qty;

            INSERT INTO order_products (
                id, id_order, id_variation, product_name, variation_name,
                price, quantity, subtotal, discount, tax_amount
            )
            VALUES (
                gen_random_uuid(),
                order_rec.id,
                fake_variation_id,
                'Producto Test ' || floor(random() * 100)::INT,
                'Variación ' || floor(random() * 10)::INT,
                fake_price,
                fake_qty,
                fake_subtotal,
                0,
                fake_subtotal * 0.16
            );
        END LOOP;
    END LOOP;
END $$;

-- ── 5. Insert monthly goals ────────────────────────────────
DO $$
DECLARE
    curr RECORD;
    current_month INT;
    current_year INT;
BEGIN
    current_month := EXTRACT(MONTH FROM NOW())::INT;
    current_year := EXTRACT(YEAR FROM NOW())::INT;

    FOR curr IN SELECT code FROM currencies LOOP
        INSERT INTO monthly_goals (id, currency_id, month, year, goal_amount, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            (SELECT id FROM currencies WHERE code = curr.code),
            current_month,
            current_year,
            CASE curr.code
                WHEN 'USD' THEN 5000
                WHEN 'VES' THEN 400000000
                WHEN 'COP' THEN 20000000
                ELSE 10000
            END,
            NOW(),
            NOW()
        )
        ON CONFLICT DO NOTHING;
    END LOOP;
END $$;

-- ── 6. Insert older orders for "vs last week" comparison ───
DO $$
DECLARE
    i INT;
    order_date TIMESTAMP;
    fake_subtotal DOUBLE PRECISION;
    fake_total DOUBLE PRECISION;
    curr_id UUID;
    curr_code TEXT;
    fake_user_id UUID;
    fake_shipping_id UUID;
    fake_pmethod_id UUID;
BEGIN
    SELECT id INTO fake_shipping_id FROM shipping_methods ORDER BY random() LIMIT 1;
    SELECT id INTO fake_pmethod_id FROM pmethods ORDER BY random() LIMIT 1;

    FOR i IN 1..200 LOOP
        order_date := NOW() - (random() * 14 + 7 || ' days')::INTERVAL - (random() * 24 || ' hours')::INTERVAL;

        SELECT id, code INTO curr_id, curr_code FROM currencies ORDER BY random() LIMIT 1;

        fake_subtotal := CASE curr_code
            WHEN 'USD' THEN (random() * 80 + 5)::INT
            WHEN 'VES' THEN (random() * 300000 + 10000)::INT
            WHEN 'COP' THEN (random() * 1500000 + 50000)::INT
            ELSE (random() * 80 + 5)::INT
        END;
        fake_total := fake_subtotal + (fake_subtotal * 0.16);

        SELECT id INTO fake_user_id FROM profiles WHERE role = 'USER' ORDER BY random() LIMIT 1;

        INSERT INTO orders (
            id, id_user, id_currency, id_shipping_method, id_pmethod,
            order_number,
            subtotal, tax_amount, discount_amount, shipping_cost, total_amount,
            status, created_at, updated_at
        )
        VALUES (
            gen_random_uuid(),
            fake_user_id,
            curr_id,
            fake_shipping_id,
            fake_pmethod_id,
            'ORD-OLD-' || i,
            fake_subtotal,
            fake_subtotal * 0.16,
            0,
            CASE WHEN curr_code = 'VES' THEN 10000 WHEN curr_code = 'COP' THEN 50000 ELSE 10 END,
            fake_total,
            'PAID',
            order_date,
            order_date
        );
    END LOOP;
END $$;

-- ── 7. Insert transactions for all orders ─────────────────
DO $$
DECLARE
    order_rec RECORD;
    txn_status TEXT;
BEGIN
    FOR order_rec IN SELECT id, id_currency, id_pmethod, total_amount, created_at FROM orders LOOP
        txn_status := CASE
            WHEN order_rec.total_amount > 0 AND random() < 0.9 THEN 'VERIFIED'
            ELSE 'PENDING'
        END;

        INSERT INTO transactions (id, id_order, id_pmethod, id_currency, amount, reference, receipt_url, status, created_at)
        VALUES (
            gen_random_uuid(),
            order_rec.id,
            order_rec.id_pmethod,
            order_rec.id_currency,
            order_rec.total_amount,
            'REF-' || gen_random_uuid()::TEXT,
            CASE WHEN random() < 0.5 THEN 'https://payments.test.com/receipt/' || gen_random_uuid()::TEXT ELSE NULL END,
            txn_status,
            order_rec.created_at
        );
    END LOOP;
END $$;

-- ── 8. Insert carts with products (unpaid carts) ──────────
DO $$
DECLARE
    i INT;
    cart_date TIMESTAMP;
    fake_user_id UUID;
    fake_cart_id UUID;
    fake_var_id UUID;
    fake_qty INT;
    j INT;
    used_variations UUID[];
BEGIN
    FOR i IN 1..80 LOOP
        cart_date := NOW() - (random() * 7 || ' days')::INTERVAL - (random() * 24 || ' hours')::INTERVAL;
        SELECT id INTO fake_user_id FROM profiles WHERE role = 'USER' ORDER BY random() LIMIT 1;

        INSERT INTO carts (id, id_user, status, created_at, edit_at)
        VALUES (gen_random_uuid(), fake_user_id, 'ACTIVE', cart_date, cart_date)
        RETURNING id INTO fake_cart_id;

        used_variations := '{}';
        FOR j IN 1..(floor(random() * 3) + 1)::INT LOOP
            SELECT id INTO fake_var_id FROM products_variations WHERE NOT id = ANY(used_variations) ORDER BY random() LIMIT 1;
            EXIT WHEN NOT FOUND;
            used_variations := array_append(used_variations, fake_var_id);
            fake_qty := (floor(random() * 4) + 1)::INT;

            INSERT INTO cart_products (id, id_cart, id_variation, quantity, added_at)
            VALUES (gen_random_uuid(), fake_cart_id, fake_var_id, fake_qty, cart_date);
        END LOOP;
    END LOOP;
END $$;

-- ── Summary ──────────────────────────────────────────────────
SELECT
    (SELECT COUNT(*) FROM profiles WHERE email LIKE '%@test.com') AS total_profiles,
    (SELECT COUNT(*) FROM tracking_events) AS total_events,
    (SELECT COUNT(*) FROM carts) AS total_carts,
    (SELECT COUNT(*) FROM cart_products) AS total_cart_products,
    (SELECT COUNT(*) FROM orders) AS total_orders,
    (SELECT COUNT(*) FROM order_products) AS total_order_products,
    (SELECT COUNT(*) FROM transactions) AS total_transactions,
    (SELECT COUNT(*) FROM monthly_goals) AS total_goals;
