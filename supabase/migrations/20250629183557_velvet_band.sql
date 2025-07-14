/*
  # Datos de ejemplo para Lista Golden

  1. Empresas de ejemplo
  2. Ubicaciones y servicios
  3. Horarios y promociones
  4. Imágenes de empresas
*/

-- Insertar empresas de ejemplo
INSERT INTO companies (name, short_description, long_description, with_reservation, with_delivery) VALUES 
  ('El Bodegón Dorado', 'Auténtica cocina argentina con un toque gourmet', 'Con más de 30 años de tradición, El Bodegón Dorado es un emblema de la gastronomía cordobesa.', true, true),
  ('Gran Hotel Lujo', 'Experimenta el lujo y confort en el corazón de Buenos Aires', 'Un ícono de la hotelería porteña desde su inauguración en 1920.', true, false),
  ('Cine Estelar 3D', 'Disfruta de los últimos estrenos con la mejor tecnología 3D', 'Primer complejo en la ciudad en ofrecer proyecciones 3D digitales desde 2009.', true, false),
  ('Holy Restaurante', 'Cocina de autor con ingredientes regionales frescos', 'Fundado en 2015, Holy Restaurante se convirtió en un referente de la nueva cocina misionera.', true, true)
ON CONFLICT DO NOTHING;

-- Insertar ubicaciones (precios por provincia)
INSERT INTO locations (description, price, province_id) VALUES 
  ('Córdoba Capital', 10000.00, 5),
  ('Buenos Aires Capital', 10000.00, 1),
  ('Posadas', 10000.00, 13)
ON CONFLICT DO NOTHING;

-- Insertar ubicaciones de empresas
INSERT INTO locations_companies (location_id, company_id, lat, long) VALUES 
  (1, 1, -31.4201, -64.1888), -- El Bodegón Dorado en Córdoba
  (2, 2, -34.6118, -58.3960), -- Gran Hotel Lujo en Buenos Aires
  (1, 3, -31.4201, -64.1888), -- Cine Estelar en Córdoba
  (3, 4, -27.3621, -55.9008)  -- Holy Restaurante en Misiones
ON CONFLICT DO NOTHING;

-- Insertar servicios
INSERT INTO services (description, company_id) VALUES 
  ('Salón principal', 1),
  ('Patio cervecero', 1),
  ('Cava de vinos', 1),
  ('Spa y centro de bienestar', 2),
  ('Piscina climatizada', 2),
  ('Restaurante de alta cocina', 2),
  ('Salas 2D y 3D', 3),
  ('Sonido Dolby Atmos', 3),
  ('Candy bar completo', 3),
  ('Salón principal con aire acondicionado', 4),
  ('Terraza al aire libre', 4),
  ('Wi-Fi gratuito', 4)
ON CONFLICT DO NOTHING;

-- Insertar promociones
INSERT INTO promotions (description, service_id) VALUES 
  ('20% de descuento en todos los platos de la carta', 1),
  ('Paga una noche y quédate dos (2x1 en noches)', 4),
  ('2x1 en entradas para todas las funciones 2D y 3D de Lunes a Jueves', 7),
  ('15% de descuento en todos los platos principales y postres', 10)
ON CONFLICT DO NOTHING;

-- Insertar horarios
INSERT INTO schedules (company_id, days_id, start_time, end_time) VALUES 
  -- El Bodegón Dorado
  (1, 1, '12:00:00', '15:00:00'), -- Lunes almuerzo
  (1, 2, '12:00:00', '15:00:00'), -- Martes almuerzo
  (1, 2, '20:00:00', '00:00:00'), -- Martes cena
  (1, 3, '12:00:00', '15:00:00'), -- Miércoles almuerzo
  (1, 3, '20:00:00', '00:00:00'), -- Miércoles cena
  (1, 4, '12:00:00', '15:00:00'), -- Jueves almuerzo
  (1, 4, '20:00:00', '00:00:00'), -- Jueves cena
  (1, 5, '12:00:00', '15:00:00'), -- Viernes almuerzo
  (1, 5, '20:00:00', '01:00:00'), -- Viernes cena
  (1, 6, '20:00:00', '01:00:00'), -- Sábado cena
  (1, 7, '12:00:00', '16:00:00'), -- Domingo almuerzo
  
  -- Cine Estelar 3D
  (3, 1, '14:00:00', '23:00:00'), -- Lunes
  (3, 2, '14:00:00', '23:00:00'), -- Martes
  (3, 3, '14:00:00', '23:00:00'), -- Miércoles
  (3, 4, '14:00:00', '23:00:00'), -- Jueves
  (3, 5, '14:00:00', '01:00:00'), -- Viernes
  (3, 6, '13:00:00', '01:00:00'), -- Sábado
  (3, 7, '13:00:00', '23:00:00'), -- Domingo
  
  -- Holy Restaurante
  (4, 2, '18:00:00', '00:00:00'), -- Martes
  (4, 3, '18:00:00', '00:00:00'), -- Miércoles
  (4, 4, '18:00:00', '00:00:00'), -- Jueves
  (4, 5, '18:00:00', '01:00:00'), -- Viernes
  (4, 6, '12:00:00', '16:00:00'), -- Sábado almuerzo
  (4, 6, '18:00:00', '01:00:00'), -- Sábado cena
  (4, 7, '12:00:00', '16:00:00')  -- Domingo almuerzo
ON CONFLICT DO NOTHING;

-- Insertar imágenes de empresas
INSERT INTO companies_images (file_url, company_id) VALUES 
  ('https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=600', 1),
  ('https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600', 1),
  ('https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=600', 2),
  ('https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=600', 2),
  ('https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=600', 3),
  ('https://images.pexels.com/photos/7991319/pexels-photo-7991319.jpeg?auto=compress&cs=tinysrgb&w=600', 3),
  ('https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600', 4),
  ('https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=600', 4)
ON CONFLICT DO NOTHING;