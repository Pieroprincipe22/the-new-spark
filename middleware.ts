import { NextRequest, NextResponse } from 'next/server';

const ADMIN_COOKIE_NAME = 'the_new_spark_panel_session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected =
    pathname.startsWith('/panel') || pathname.startsWith('/admin');

  if (!isProtected) return NextResponse.next();

  const session = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  // Solo verificar que la cookie existe y tiene longitud correcta (64 chars hex)
  if (!session || session.length !== 64 || !/^[a-f0-9]+$/.test(session)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/panel/:path*', '/admin/:path*'],
};