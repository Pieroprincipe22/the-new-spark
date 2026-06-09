import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = "the_new_spark_panel_session";

function isValidSession(cookieValue: string): boolean {
  // Verificación de formato: 64 chars hex
  // La verificación HMAC real la hace requireAdmin() en cada página protegida
  return (
    cookieValue.length === 64 &&
    /^[a-f0-9]+$/.test(cookieValue)
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected =
    pathname.startsWith("/panel") || pathname.startsWith("/admin");

  if (!isProtected) return NextResponse.next();

  const session = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (!session || !isValidSession(session)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/panel/:path*", "/admin/:path*"],
};