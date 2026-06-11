-- =====================================================
-- SEED: Configuración de la Tienda (Ajustes / Nosotros)
-- =====================================================

-- 1. Configuración principal
INSERT INTO store_configs (
    id, address, phone, whatsapp, instagram_url, tiktok_url, facebook_url,
    hours_mon_fri, hours_sat, hours_sun, google_maps_embed, our_essence,
    show_pillars, pillars_title, show_mission_vision, show_mission, mission_title,
    mission_content, show_vision, vision_title, vision_content, updated_at
)
SELECT
    gen_random_uuid(),
    'Carrera 5 con calle 6, Esquina Rosada, San Juan de Colón, Estado Táchira',
    '0422-2772709',
    '+584222772709',
    'https://instagram.com/mundomaquillaje',
    'https://tiktok.com/@mundomaquillaje',
    'https://facebook.com/mundomaquillaje',
    '8:30 AM - 6:00 PM',
    '8:30 AM - 5:30 PM',
    'Cerrado',
    '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3951.6888497495574!2d-72.2618991253457!3d8.031024304414777!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e666bc0f9be3b5d%3A0xe7264a938c7fde6!2sCarrera%205%20%26%20Calle%206%2C%20San%20Juan%20de%20Col%C3%B3n%205020%2C%20T%C3%A1chira!5e0!3m2!1sen!2sve!4v1716800000000!5m2!1sen!2sve" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>',
    'Mundo maquillaje nació como una idea de emprendimiento que ayude a las personas a conseguir siempre lo que necesitan en un solo lugar.

Más que una tienda, somos una comunidad dedicada a ofrecerte los mejores productos de maquillaje, cuidado de la piel y el cabello, manicura y accesorios, seleccionados con amor para resaltar tu brillo natural',
    true,
    'Nuestros Pilares',
    true,
    true,
    'Nuestra Misión',
    'Nuestra misión es empoderar a cada persona para que se sienta hermosa y segura de sí misma, ofreciendo acceso a productos de belleza de alta calidad de forma fácil y accesible. Tu belleza es nuestra prioridad',
    true,
    'Nuestra Visión',
    'Nuestra visión es ser la tienda líder en productos de belleza, reconocida por nuestra calidad, variedad y servicio excepcional, inspirando a cada persona a expresar su autenticidad',
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM store_configs);


-- 2. Pilares
INSERT INTO store_pillars (id, title, content, image_url, is_active, order_index, store_config_id)
SELECT gen_random_uuid(), 'Calidad', 'Solo marcas reconocidas y productos probados', 'https://irqqmxphmbnomzsbozxr.supabase.co/storage/v1/object/public/config/calidad.webp', true, 0, sc.id
FROM store_configs sc
WHERE NOT EXISTS (SELECT 1 FROM store_pillars sp WHERE sp.title = 'Calidad')
LIMIT 1;

INSERT INTO store_pillars (id, title, content, image_url, is_active, order_index, store_config_id)
SELECT gen_random_uuid(), 'Variedad', 'Miles de tonos y texturas para todos los gustos y necesidades', 'https://irqqmxphmbnomzsbozxr.supabase.co/storage/v1/object/public/config/variedad.webp', true, 1, sc.id
FROM store_configs sc
WHERE NOT EXISTS (SELECT 1 FROM store_pillars sp WHERE sp.title = 'Variedad')
LIMIT 1;

INSERT INTO store_pillars (id, title, content, image_url, is_active, order_index, store_config_id)
SELECT gen_random_uuid(), 'Tendencia', 'Las últimas novedades y estilos de moda', 'https://irqqmxphmbnomzsbozxr.supabase.co/storage/v1/object/public/config/tendencia.webp', true, 2, sc.id
FROM store_configs sc
WHERE NOT EXISTS (SELECT 1 FROM store_pillars sp WHERE sp.title = 'Tendencia')
LIMIT 1;

INSERT INTO store_pillars (id, title, content, image_url, is_active, order_index, store_config_id)
SELECT gen_random_uuid(), 'Atención', 'Asesoría personalizada y servicio al cliente excepcional', 'https://irqqmxphmbnomzsbozxr.supabase.co/storage/v1/object/public/config/atencion.webp', true, 3, sc.id
FROM store_configs sc
WHERE NOT EXISTS (SELECT 1 FROM store_pillars sp WHERE sp.title = 'Atención')
LIMIT 1;
