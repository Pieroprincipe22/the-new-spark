import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = ['/panel', '/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const session = request.cookies.get('admin_session')?.value;
  const expectedSession = process.env.ADMIN_SESSION_TOKEN;

  if (!expectedSession || session !== expectedSession) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/panel/:path*', '/admin/:path*'],
};