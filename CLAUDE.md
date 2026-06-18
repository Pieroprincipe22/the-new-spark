# The New Spark — Guía técnica completa
*Última actualización: 18 junio 2026*

## Stack técnico
- **Framework:** Next.js 16.2.6 (App Router, Turbopack)
- **Base de datos:** Supabase (PostgreSQL) — Project ID: `whkdfdwbeumczqhpfysh`
- **Hosting:** Vercel — dominio: `www.the-new-spark.es`
- **Estilos:** Tailwind CSS 4
- **Email:** Resend — dominio `the-new-spark.es` verificado en IONOS
- **Validación:** Zod
- **Repo:** github.com/Pieroprincipe22/the-new-spark

---

## Variables de entorno requeridas en Vercel

```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
ADMIN_USER
ADMIN_PASSWORD
ADMIN_PASSWORD_HASH         (formato: salt:hash generado con scryptSync)
ADMIN_SESSION_SECRET        (string hex aleatorio de 64 chars)
RESEND_API_KEY              (re_...)
```

**Generar hash de contraseña:**
```bash
node -e "
const crypto = require('crypto');
const password = 'TU_CONTRASEÑA';
const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.scryptSync(password, salt, 32).toString('hex');
console.log(salt + ':' + hash);
"
```

**Generar ADMIN_SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Sistema de autenticación del panel

- **Login público:** `/login` → llama a `POST /api/auth/login`
- **Cookie:** `the_new_spark_panel_session` (httpOnly, secure=true, sameSite=strict, 8h)
- **Middleware:** `src/middleware.ts` — verifica formato cookie (64 chars hex)
- **Verificación real:** `requireAdmin()` en cada Server Component del panel
- **Brute force:** máx 5 intentos → bloqueo 15 min por IP (en memoria)
- **Flujo login:** `/login` → `POST /api/auth/login` → cookie → `window.location.href = '/panel/inicio'`
- **Flujo logout:** `POST /api/auth/logout` → borra cookie → `/login`

**Archivos clave de auth:**
- `src/lib/admin/auth.ts` — lógica completa
- `src/app/api/auth/login/route.ts` — escribe cookie en Response
- `src/app/login/page.tsx` — formulario login (client component)
- `src/middleware.ts` — primera barrera de protección

**NUNCA cambiar el nombre de la cookie sin actualizarlo en los 3 sitios:**
1. `src/lib/admin/auth.ts`
2. `src/app/api/auth/login/route.ts`
3. `src/middleware.ts`

---

## Estructura de rutas

### Públicas
| Ruta | Descripción |
|------|-------------|
| `/` | Landing page principal |
| `/reservar` | Página de reserva de citas |
| `/promociones` | Promociones |
| `/contacto` | Contacto |
| `/privacidad` | Política de privacidad (RGPD) |
| `/sorteo` | Página pública del sorteo con contador |
| `/robots.txt` | SEO |
| `/sitemap.xml` | SEO — incluye todas las rutas públicas |

### Panel admin (protegidas por middleware)
| Ruta | Descripción |
|------|-------------|
| `/login` | Login del panel |
| `/panel` | Redirige a `/panel/inicio` si autenticado |
| `/panel/inicio` | Dashboard con 3 módulos |
| `/panel/citas` | Gestión de citas reservadas |
| `/panel/fidelidad` | Módulo de sellos de fidelidad |
| `/panel/sorteo` | Gestión del sorteo |
| `/panel/sorteo/draw` | Realizar el sorteo |

### API Routes
| Ruta | Método | Auth | Descripción |
|------|--------|------|-------------|
| `/api/appointments` | GET | No | Horas ocupadas por fecha |
| `/api/appointments` | POST | No | Crear cita |
| `/api/auth/login` | POST | No | Login admin |
| `/api/auth/logout` | POST | No | Logout admin |
| `/api/loyalty` | POST | Sí | Añadir sello / canjear recompensa |
| `/api/loyalty/search` | GET | Sí | Buscar clientes por nombre/teléfono |
| `/api/raffle/status` | GET | No | Estado del sorteo activo |
| `/api/raffle/enter` | POST | No | Inscribirse al sorteo |
| `/api/raffle/draw` | POST | Sí | Realizar el sorteo (admin) |

---

## Base de datos Supabase

### Tablas
- `services` — servicios de la barbería
- `customers` — clientes con `loyalty_stamps`
- `appointments` — citas reservadas
- `loyalty_events` — historial de sellos
- `products` — productos de la tienda
- `raffle_configs` — configuración del sorteo
- `raffle_entries` — participantes del sorteo

### Índice único en citas
```sql
CREATE UNIQUE INDEX appointments_unique_active_slot
ON appointments (appointment_date, appointment_time)
WHERE status <> 'cancelled';
```

### RLS activado en todas las tablas

---

## Módulo de reservas

**Formulario:** `src/components/booking/BookingForm.tsx`
- Rate limiting: 5 POST/10min por IP, 60 GET/min por IP
- Validación Zod server-side en `src/lib/validation.ts`
- RGPD: checkbox obligatorio + enlace a `/privacidad`
- Botón WhatsApp post-reserva con mensaje pre-escrito
- Anti-doble reserva: constraint UNIQUE en Supabase

**API:** `src/app/api/appointments/route.ts`

---

## Módulo de fidelidad

**Reglas:** 9 sellos = 1 recompensa

**Búsqueda:** por nombre (ilike) o teléfono (normalizado)

**Archivos:**
- `src/lib/admin/customers.ts` — funciones CRUD completas
- `src/app/panel/fidelidad/page.tsx` — UI panel (client component)
- `src/app/api/loyalty/route.ts` — POST: add/redeem
- `src/app/api/loyalty/search/route.ts` — GET: buscar clientes

**Funciones disponibles en customers.ts:**
- `getAdminCustomers()`
- `getAdminCustomerById(id)`
- `addCustomerLoyaltyStamps({customerId, stamps, reason})`
- `redeemCustomerLoyaltyReward({customerId, stamps, reason})`

---

## Módulo de sorteo ✅ COMPLETADO Y FUNCIONAL

**Flujo de estados:**
```
draft → open → closed → finished
```

- `draft`: creado, no visible públicamente, solo Nick puede verlo
- `open`: inscripciones abiertas, formulario visible en /sorteo con contador
- `closed`: inscripciones cerradas, contador de anuncio visible
- `finished`: ganador anunciado, email enviado, página muestra resultado

**Flujo de Nick (admin):**
1. `/panel/sorteo` → Crear sorteo (título, premio, fechas)
2. Pulsar "✅ Activar sorteo" → pasa a `open`
3. Esperar inscripciones
4. Pulsar "Cerrar inscripciones" → pasa a `closed`
5. Pulsar "🎲 Realizar sorteo" → elige ganador al azar + envía email
6. Página `/sorteo` muestra el ganador automáticamente

**Botón eliminar:** disponible en estado `draft` y `closed` para limpiar sorteos de prueba

**Archivos:**
- `src/lib/admin/raffle.ts` — funciones CRUD
- `src/lib/email/raffle-winner.ts` — plantilla email con Resend
- `src/app/sorteo/page.tsx` — página pública con contador en tiempo real
- `src/app/panel/sorteo/page.tsx` — panel admin completo
- `src/app/panel/sorteo/draw/page.tsx` — realizar sorteo con doble confirmación
- `src/app/api/raffle/status/route.ts` — estado público
- `src/app/api/raffle/enter/route.ts` — inscripción con validación Zod
- `src/app/api/raffle/draw/route.ts` — sorteo + email automático

**Email:** Resend con dominio `the-new-spark.es` verificado en IONOS
**From:** `sorteo@the-new-spark.es`
**Requiere:** `RESEND_API_KEY` en Vercel ✅ configurado

---

## Seguridad implementada

| Medida | Archivo |
|--------|---------|
| Rate limiting reservas | `src/lib/rateLimit.ts` |
| Validación Zod server-side | `src/lib/validation.ts` |
| Headers HTTP (CSP, HSTS, X-Frame) | `next.config.ts` |
| Brute force panel | `src/lib/admin/auth.ts` |
| Cookie httpOnly+secure+strict | `src/app/api/auth/login/route.ts` |
| RGPD checkbox | `src/components/booking/BookingForm.tsx` |
| Constraint UNIQUE slots | Supabase SQL |
| RLS en todas las tablas | Supabase |
| Redirección www | `next.config.ts` |
| Rate limiting sorteo | `src/app/api/raffle/enter/route.ts` |

---

## SEO

- **URL canónica:** `https://www.the-new-spark.es`
- **Redirección:** `the-new-spark.es` → `www.the-new-spark.es` (301)
- **Sitemap:** `/sitemap.xml` — incluye `/`, `/reservar`, `/promociones`, `/contacto`, `/privacidad`, `/sorteo`
- **Meta OG:** `src/app/layout.tsx`

---

## Menú de navegación

```
Inicio | Servicios | Productos | Promoción | Sorteo | Reservas | Contacto
```

Archivo: `src/components/layout/Header.tsx`

---

## Preferencias del proyecto

- **Diseño:** NO tocar — el cliente aprobó el diseño actual
- **Archivos:** siempre enviar archivos completos, no diffs parciales
- **Tags JSX** con links (`<a>`, `<Link>`): ponerlos en UNA SOLA LÍNEA para evitar corrupción al pegar
- **Deploy:** Vercel conectado a rama `main` — push = deploy automático
- **Build:** siempre ejecutar `npm run build` antes de hacer push

---

## Estructura de archivos clave

```
src/
├── app/
│   ├── api/
│   │   ├── appointments/route.ts
│   │   ├── auth/login/route.ts
│   │   ├── auth/logout/route.ts
│   │   ├── loyalty/route.ts
│   │   ├── loyalty/search/route.ts
│   │   ├── raffle/draw/route.ts
│   │   ├── raffle/enter/route.ts
│   │   └── raffle/status/route.ts
│   ├── login/page.tsx
│   ├── panel/
│   │   ├── page.tsx              (redirige a /panel/inicio)
│   │   ├── inicio/page.tsx       (dashboard 3 módulos)
│   │   ├── citas/page.tsx
│   │   ├── fidelidad/page.tsx
│   │   └── sorteo/
│   │       ├── page.tsx
│   │       └── draw/page.tsx
│   ├── sorteo/page.tsx
│   ├── reservar/page.tsx
│   ├── privacidad/page.tsx
│   ├── not-found.tsx
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── booking/BookingForm.tsx
│   ├── layout/Header.tsx
│   └── layout/Footer.tsx
├── lib/
│   ├── admin/
│   │   ├── auth.ts
│   │   ├── appointments.ts
│   │   ├── customers.ts
│   │   └── raffle.ts
│   ├── email/
│   │   └── raffle-winner.ts
│   ├── supabase/
│   │   ├── admin.ts
│   │   └── client.ts
│   ├── rateLimit.ts
│   └── validation.ts
├── data/
│   ├── catalog.ts
│   └── site.ts
└── middleware.ts
```

---

## Pendiente

- [ ] Confirmar modelo exacto de zapatillas para el sorteo real
- [ ] Limpiar datos de prueba en Supabase antes del sorteo real:
  ```sql
  DELETE FROM raffle_entries;
  DELETE FROM raffle_configs;
  ```
- [ ] Sentry para monitorización de errores en producción
- [ ] `npm audit fix` para vulnerabilidades moderadas restantes
- [ ] Verificar que Supabase no esté en pausa antes de julio

---

## Historial de trabajo realizado

### Seguridad
- Headers HTTP completos (CSP, HSTS, X-Frame-Options, etc.)
- Rate limiting en API de reservas y sorteo
- Validación Zod server-side en todas las APIs
- Protección brute force panel admin (5 intentos, bloqueo 15 min)
- Middleware de protección de rutas del panel
- Cookie segura httpOnly+secure+strict
- RGPD en formulario de reservas

### Limpieza de código
- Eliminados endpoints huérfanos
- Eliminados componentes duplicados
- Eliminadas librerías duplicadas
- Eliminadas páginas redireccionadoras innecesarias

### Funcionalidades añadidas
- Módulo de fidelidad completo con búsqueda por nombre/teléfono
- Sistema de sorteo completo con email automático via Resend ✅
- Página 404 personalizada
- Confirmación de cita por WhatsApp
- Sitemap completo
- Redirección www para SEO
- Panel admin con 3 módulos: citas, fidelidad, sorteo
- Dominio Resend verificado en IONOS
- Email de ganador funcional desde `sorteo@the-new-spark.es`