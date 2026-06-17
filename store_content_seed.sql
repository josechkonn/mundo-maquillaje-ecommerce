-- =====================================================
-- SEED: Contenido de Nosotros (Misión, Visión, Esencia)
-- Ejecutar DESPUÉS de store_config_seed.sql si la config ya existe
-- =====================================================

UPDATE store_configs SET
    our_essence = 'Mundo maquillaje nació como una idea de emprendimiento que ayude a las personas a conseguir siempre lo que necesitan en un solo lugar.

Más que una tienda, somos una comunidad dedicada a ofrecerte los mejores productos de maquillaje, cuidado de la piel y el cabello, manicura y accesorios, seleccionados con amor para resaltar tu brillo natural',

    show_mission_vision = true,
    show_mission = true,
    mission_title = 'Nuestra Misión',
    mission_content = 'Nuestra misión es empoderar a cada persona para que se sienta hermosa y segura de sí misma, ofreciendo acceso a productos de belleza de alta calidad de forma fácil y accesible. Tu belleza es nuestra prioridad',

    show_vision = true,
    vision_title = 'Nuestra Visión',
    vision_content = 'Nuestra visión es ser la tienda líder en productos de belleza, reconocida por nuestra calidad, variedad y servicio excepcional, inspirando a cada persona a expresar su autenticidad',

    updated_at = NOW()
WHERE our_essence IS NULL OR our_essence = '';
