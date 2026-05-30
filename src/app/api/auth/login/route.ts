import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { usuario, password } = await request.json();

    const adminUser = process.env.ADMIN_USER;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const sessionToken = process.env.ADMIN_SESSION_TOKEN;

    if (!adminUser || !adminPassword || !sessionToken) {
      return NextResponse.json(
        { ok: false, message: 'Configuración de autenticación incompleta.' },
        { status: 500 }
      );
    }

    if (usuario !== adminUser || password !== adminPassword) {
      return NextResponse.json(
        { ok: false, message: 'Usuario o contraseña incorrectos.' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      ok: true,
      message: 'Acceso concedido.',
    });

    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch {
    return NextResponse.json(
      { ok: false, message: 'No se pudo iniciar sesión.' },
      { status: 500 }
    );
  }
}