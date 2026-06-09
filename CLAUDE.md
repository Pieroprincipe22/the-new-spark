@AGENTS.md
# The New Spark — Guía técnica

## Autenticación del panel admin
- Login: `/login` → llama a `POST /api/auth/login`
- Panel: `/panel/citas` → protegido por `src/middleware.ts`
- Cookie: `the_new_spark_panel_session` (httpOnly, secure, 8h)
- Verificación: HMAC SHA256 con `ADMIN_SESSION_SECRET` + `ADMIN_USER`
- Variables necesarias en Vercel:
  - `ADMIN_USER`
  - `ADMIN_PASSWORD`
  - `ADMIN_SESSION_SECRET`

## Variables de entorno requeridas
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_USER`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

## Rutas protegidas
- `/panel/*` → requiere cookie válida (middleware)
- `/admin/*` → requiere cookie válida (middleware)

## No tocar sin entender
- `src/middleware.ts` — controla acceso a todo el panel
- `src/lib/admin/auth.ts` — genera y verifica tokens
- `src/app/api/auth/login/route.ts` — escribe la cookie