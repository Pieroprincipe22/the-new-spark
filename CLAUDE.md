# The New Spark — Guía técnica completa
*Última actualización: junio 2026*

## Stack técnico
- **Framework:** Next.js 16.2.6 (App Router, Turbopack)
- **Base de datos:** Supabase (PostgreSQL) — Project ID: `whkdfdwbeumczqhpfysh`
- **Hosting:** Vercel — dominio: `www.the-new-spark.es`
- **Estilos:** Tailwind CSS 4
- **Email:** Resend — dominio verificado `the-new-spark.es`
- **Validación:** Zod
- **Repo:** github.com/Pieroprincipe22/the-new-spark

---

## Variables de entorno requeridas en Vercel

```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
ADMIN_USER
ADMIN_PASSWORD
ADMIN_PASSWORD_HASH         (formato: salt:hash generado con scrypt)
ADMIN_SESSION_SECRET        (string hex aleatorio de 64 chars)
RESEND_API_KEY              (re_...)
```

**Importante:** `ADMIN_PASSWORD_HASH` usa scryptSync con salt:hash. El token de sesión se genera con HMAC SHA256 usando `ADMIN_SESSION_SECRET` + `ADMIN_USER`.

---

## Sistema de autenticación del panel

- **Login público:** `/login` → llama a `POST /api/auth/login`
- **Cookie:** `the_new_spark_panel_session` (httpOnly, secure=true, sameSite=strict, 8h)
- **Middleware:** `src/middleware.ts` — verifica formato de cookie (64 chars hex)
- **Verificación real:** `requireAdmin()` en cada Server Component del panel
- **Logout:** `POST /api/auth/logout` → borra la cookie
- **Brute force:** máx 5 intentos fallidos → bloqueo 15 min por IP (en memoria)
- **Flujo:** `/login` → `POST /api/auth/login` → cookie → `window.location.href = '/panel/inicio'`

**Archivos clave de auth:**
- `src/lib/admin/auth.ts` — lógica completa de auth
- `src/app/api/auth/login/route.ts` — escribe la cookie en la Response
- `src/app/login/page.tsx` — formulario de login (client component)
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
| `/sorteo` | Página pública del sorteo |
| `/robots.txt` | SEO |
| `/sitemap.xml` | SEO |

### Panel admin (protegidas por middleware)
| Ruta | Descripción |
|------|-------------|
| `/login` | Login del panel |
| `/panel/inicio` | Dashboard con acceso a los 3 módulos |
| `/panel/citas` | Gestión de citas reservadas |
| `/panel/fidelidad` | Módulo de sellos de fidelidad |
| `/panel/sorteo` | Gestión del sorteo |
| `/panel/sorteo/draw` | Página para realizar el sorteo |

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

### Tablas existentes
- `services` — servicios de la barbería
- `customers` — clientes con `loyalty_stamps` (sellos de fidelidad)
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
- `raffle_entries`: insert público, select solo ganadores
- `raffle_configs`: select público solo si status open/closed/finished

---

## Módulo de reservas

**Formulario:** `src/components/booking/BookingForm.tsx`
- Rate limiting: 5 POST / 10 min por IP, 60 GET / min por IP
- Validación Zod server-side en `src/lib/validation.ts`
- RGPD: checkbox obligatorio + enlace a `/privacidad`
- Botón WhatsApp post-reserva con mensaje pre-escrito
- Anti-doble reserva: constraint UNIQUE en Supabase

**API:** `src/app/api/appointments/route.ts`
- Rate limiting con `src/lib/rateLimit.ts` (en memoria)
- Validación Zod de todos los inputs
- Maneja doble reserva con error 409

---

## Módulo de fidelidad

**Reglas:** 9 sellos = 1 recompensa
**Búsqueda:** por nombre (ilike) o teléfono (normalizado sin espacios)
**Archivos:**
- `src/lib/admin/customers.ts` — funciones CRUD completas
- `src/app/panel/fidelidad/page.tsx` — UI del panel (client component)
- `src/app/api/loyalty/route.ts` — POST: add/redeem
- `src/app/api/loyalty/search/route.ts` — GET: buscar clientes

**Funciones disponibles:**
- `getAdminCustomers()` — lista todos los clientes
- `getAdminCustomerById(id)` — detalle con citas y eventos
- `addCustomerLoyaltyStamps({customerId, stamps, reason})`
- `redeemCustomerLoyaltyReward({customerId, stamps, reason})`

---

## Módulo de sorteo

**Flujo de estados:**
```
draft → open → closed → finished
```

- `draft`: creado pero no visible públicamente
- `open`: inscripciones abiertas, formulario visible en /sorteo
- `closed`: inscripciones cerradas, contador de anuncio visible
- `finished`: ganador anunciado, página muestra resultado

**Archivos:**
- `src/lib/admin/raffle.ts` — funciones CRUD
- `src/lib/email/raffle-winner.ts` — plantilla email con Resend
- `src/app/sorteo/page.tsx` — página pública con contador
- `src/app/panel/sorteo/page.tsx` — panel admin
- `src/app/panel/sorteo/draw/page.tsx` — realizar sorteo
- `src/app/api/raffle/status/route.ts` — estado público
- `src/app/api/raffle/enter/route.ts` — inscripción pública
- `src/app/api/raffle/draw/route.ts` — realizar sorteo (admin)

**Email:** Resend con dominio `the-new-spark.es` verificado en IONOS
**From:** `sorteo@the-new-spark.es` (o el que decida Nick)
**Requiere:** `RESEND_API_KEY` en Vercel

---

## Seguridad implementada

| Medida | Archivo |
|--------|---------|
| Rate limiting reservas | `src/lib/rateLimit.ts` |
| Validación Zod server-side | `src/lib/validation.ts` |
| Headers HTTP seguridad | `next.config.ts` |
| CSP | `next.config.ts` |
| HSTS | `next.config.ts` |
| Brute force panel | `src/lib/admin/auth.ts` |
| Cookie httpOnly+secure+strict | `src/app/api/auth/login/route.ts` |
| RGPD checkbox | `src/components/booking/BookingForm.tsx` |
| Constraint UNIQUE slots | Supabase SQL |
| RLS en todas las tablas | Supabase |
| Redirección www | `next.config.ts` |

---

## SEO

- **URL canónica:** `https://www.the-new-spark.es`
- **Redirección:** `the-new-spark.es` → `www.the-new-spark.es` (301)
- **Sitemap:** `/sitemap.xml` — incluye todas las rutas públicas
- **Robots:** `/robots.txt`
- **Meta OG:** configurado en `src/app/layout.tsx`

---

## Preferencias del cliente y del proyecto

- **Diseño:** NO tocar — el cliente aprobó el diseño actual
- **Archivos:** siempre enviar archivos completos, no diffs parciales
- **Correcciones JSX:** tags `<a>` y similares en una sola línea para evitar corrupción al pegar
- **Deploy:** Vercel conectado a rama `main` de GitHub — push = deploy automático

---

## Pendiente / Próximos pasos

- [ ] Añadir email real del cliente (`sorteo@the-new-spark.es`) en `src/lib/email/raffle-winner.ts`
- [ ] Confirmar modelo exacto de zapatillas para el sorteo
- [ ] Probar flujo completo del sorteo en producción
- [ ] Arreglar botón "Crear sorteo" (revisar Server Action)
- [ ] Sentry para monitorización de errores en producción
- [ ] `npm audit fix` para vulnerabilidades moderadas restantes
- [ ] Actualizar este CLAUDE.md cuando se completen los pendientes

---

## Historial de trabajo realizado

### Seguridad
- Headers HTTP (CSP, HSTS, X-Frame-Options, etc.)
- Rate limiting en API de reservas
- Validación Zod server-side
- Protección brute force panel admin
- Middleware de protección de rutas
- Cookie segura httpOnly+secure+strict
- RGPD en formulario de reservas

### Limpieza de código
- Eliminados endpoints huérfanos (`/api/reservas`, `/api/appointments/reservas`)
- Eliminados componentes duplicados (`HeroSection`, `ServicesSection`, `FormularioReserva`, `LoyaltySection`)
- Eliminadas librerías duplicadas (`src/lib/seguridad/`, `src/lib/validaciones/`)
- Eliminadas páginas redireccionadoras (`/acceso-privado`, `CerrarSesionButton`)

### Funcionalidades
- Módulo de fidelidad completo con búsqueda por nombre/teléfono
- Sistema de sorteo completo con email automático via Resend
- Página 404 personalizada
- Confirmación de cita por WhatsApp
- Sitemap completo con todas las rutas
- Redirección www para SEO
- Panel admin con 3 módulos: citas, fidelidad, sorteo