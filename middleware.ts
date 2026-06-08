import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';

const ADMIN_COOKIE_NAME = 'the_new_spark_panel_session';

function getExpectedToken(): string {
  const secret = process.env.ADMIN_SESSION_SECRET ?? '';
  const user = process.env.ADMIN_USER ?? '';
  return createHmac('sha256', secret)
    .update(`${user}:the-new-spark-session`)
    .digest('hex');
}

function isValidSession(cookieValue: string): boolean {
  try {
    const expected = getExpectedToken();
    const a = Buffer.from(cookieValue);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected =
    pathname.startsWith('/panel') || pathname.startsWith('/admin');

  if (!isProtected) return NextResponse.next();

  const session = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (!session || !isValidSession(session)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/panel/:path*', '/admin/:path*'],
};