import { NextResponse } from "next/server";
import { logoutAdmin } from "@/lib/admin/auth";

export async function POST() {
  await logoutAdmin();

  const response = NextResponse.json({
    ok: true,
    message: "Sesión cerrada.",
  });

  // Limpieza defensiva de la cookie antigua por si quedó en algún navegador.
  response.cookies.set("admin_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}