import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  SESSION_MAX_AGE,
  crearSesionAdmin,
  verificarCredencialesAdmin,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const usuario = body.usuario;
    const password = body.password;

    if (typeof usuario !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { message: "Datos de acceso inválidos." },
        { status: 400 },
      );
    }

    const accesoPermitido = verificarCredencialesAdmin(
      usuario.trim(),
      password,
    );

    if (!accesoPermitido) {
      return NextResponse.json(
        { message: "Usuario o contraseña incorrectos." },
        { status: 401 },
      );
    }

    const response = NextResponse.json({ ok: true });

    response.cookies.set(ADMIN_SESSION_COOKIE, crearSesionAdmin(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    return response;
  } catch {
    return NextResponse.json(
      { message: "No se pudo iniciar sesión." },
      { status: 500 },
    );
  }
}