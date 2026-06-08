import { NextRequest, NextResponse } from "next/server";
import { loginAdmin } from "@/lib/admin/auth";

function getClientIp(headerList: Headers) {
  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }
  return (
    headerList.get("x-real-ip") ||
    headerList.get("cf-connecting-ip") ||
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const usuario = typeof body?.usuario === "string" ? body.usuario : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!usuario.trim() || !password.trim()) {
      return NextResponse.json(
        { ok: false, message: "Usuario y contraseña son obligatorios." },
        { status: 400 }
      );
    }

    const result = await loginAdmin(
      usuario,
      password,
      getClientIp(request.headers)
    );

    if (result.success) {
      // ── Construir respuesta con la cookie incluida ─────────────────────
      const response = NextResponse.json({ ok: true, message: "Acceso concedido." });

      response.cookies.set("the_new_spark_panel_session", result.sessionToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 8,
      });

      return response;
      // ────────────────────────────────────────────────────────────────────
    }

    if (result.blocked) {
      return NextResponse.json(
        {
          ok: false,
          message: "Demasiados intentos fallidos. Inténtalo más tarde.",
          remainingSeconds: result.remainingSeconds,
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        message: "Usuario o contraseña incorrectos.",
        attemptsLeft: result.attemptsLeft,
      },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { ok: false, message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}