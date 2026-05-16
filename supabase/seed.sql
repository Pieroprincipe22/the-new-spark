insert into services (slug, name, description, price, duration_minutes, sort_order)
values
  ('corte-clasico', 'Corte clásico', 'Corte tradicional limpio, rápido y adaptado al estilo del cliente.', 8.00, 30, 1),
  ('corte-jubilado', 'Corte jubilado', 'Servicio especial para jubilados con acabado cuidado y profesional.', 8.00, 30, 2),
  ('degradado-moderno', 'Degradado moderno', 'Degradado actual con acabado definido y estilo moderno.', 12.00, 40, 3),
  ('degradado-diseno-elaborado', 'Degradado + diseño elaborado', 'Degradado con diseño personalizado y detalle trabajado.', 14.00, 50, 4),
  ('degradado-arreglo-barba', 'Degradado + arreglo de barba', 'Corte degradado acompañado de arreglo completo de barba.', 16.00, 60, 5),
  ('degradado-perfilado-barba', 'Degradado + perfilado de barba', 'Degradado con perfilado de barba para definir contornos y líneas.', 13.50, 50, 6),
  ('cejas-navaja', 'Cejas con navaja', 'Limpieza y definición de cejas con acabado preciso.', 3.00, 10, 7),
  ('barba-completa', 'Barba completa', 'Arreglo completo de barba con perfilado y acabado limpio.', 7.00, 25, 8)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  duration_minutes = excluded.duration_minutes,
  sort_order = excluded.sort_order,
  active = true;

insert into products (slug, name, description, price_label, stock, sort_order)
values
  ('cera-pelo', 'Cera para el pelo', 'Fijación y textura para mantener el peinado durante el día.', 'Consultar', 0, 1),
  ('polvo-peinar', 'Polvo de peinar', 'Volumen, textura y acabado natural para peinados modernos.', 'Consultar', 0, 2),
  ('gel-fijador', 'Gel fijador', 'Fijación fuerte para estilos definidos y duraderos.', 'Consultar', 0, 3),
  ('espuma-barba', 'Espuma para barba', 'Producto para preparar el afeitado y cuidar la piel.', 'Consultar', 0, 4),
  ('aceite-barba', 'Aceite para barba', 'Hidratación, brillo y suavidad para barba y piel.', 'Consultar', 0, 5),
  ('after-shave', 'After shave', 'Cuidado posterior al afeitado para calmar y refrescar la piel.', 'Consultar', 0, 6)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  price_label = excluded.price_label,
  stock = excluded.stock,
  sort_order = excluded.sort_order,
  active = true;