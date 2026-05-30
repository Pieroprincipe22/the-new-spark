insert into services (slug, name, description, price, duration_minutes, sort_order)
values
  ('corte-clasico', 'Corte clÃ¡sico', 'Corte tradicional limpio, rÃ¡pido y adaptado al estilo del cliente.', 8.00, 30, 1),
  ('corte-jubilado', 'Corte jubilado', 'Servicio especial para jubilados con acabado cuidado y profesional.', 8.00, 30, 2),
  ('degradado-moderno', 'Degradado moderno', 'Degradado actual con acabado definido y estilo moderno.', 12.00, 30, 3),
  ('degradado-diseno-elaborado', 'Degradado + diseÃ±o elaborado', 'Degradado con diseÃ±o personalizado y detalle trabajado.', 14.00, 35, 4),
  ('degradado-arreglo-barba', 'Degradado + arreglo de barba', 'Corte degradado acompaÃ±ado de arreglo completo de barba.', 16.00, 40, 5),
  ('degradado-perfilado-barba', 'Degradado con perfilado de barba para definir contornos y lÃ­neas.', 'Degradado con perfilado de barba para definir contornos y lÃ­neas.', 13.50, 35, 6),
  ('cejas-navaja', 'Cejas con navaja', 'Limpieza y definiciÃ³n de cejas con acabado preciso.', 3.00, 10, 7),
  ('barba-completa', 'Barba completa', 'Arreglo completo de barba con perfilado y acabado limpio.', 7.00, 20, 8)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  duration_minutes = excluded.duration_minutes,
  sort_order = excluded.sort_order,
  active = true;

insert into products (
  slug,
  name,
  description,
  price_label,
  stock,
  active,
  image_url,
  sort_order
)
values
  (
    'polvo-peinar',
    'Nish Man Powder Styling P1',
    'Polvo de peinado ideal para dar volumen, textura y un acabado mate natural sin apelmazar el cabello.',
    'Consultar',
    1,
    true,
    '/productos/nish-man-powder-styling-p1.webp',
    1
  ),
  (
    'cera-pelo',
    'Nish Man 03 Hair Styling Wax Flaming',
    'Cera de peinado para definir, moldear y mantener el estilo durante el dÃ­a con un acabado marcado.',
    'Consultar',
    1,
    true,
    '/productos/nish-man-03-wax-flaming.webp',
    2
  ),
  (
    'nish-man-08-wax-matte',
    'Nish Man 08 Hair Styling Wax Matte',
    'Cera mate para conseguir un peinado natural, definido y sin brillo excesivo.',
    'Consultar',
    1,
    true,
    '/productos/nish-man-08-wax-matte.webp',
    3
  )
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  price_label = excluded.price_label,
  stock = excluded.stock,
  active = excluded.active,
  image_url = excluded.image_url,
  sort_order = excluded.sort_order;

update products
set active = false
where slug in (
  'gel-fijador',
  'espuma-barba',
  'aceite-barba',
  'after-shave'
);
