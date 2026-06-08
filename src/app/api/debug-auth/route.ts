import { NextResponse } from "next/server";
import { createHmac, scryptSync, timingSafeEqual } from "crypto";

export async function GET() {
  const adminUser = process.env.ADMIN_USER;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  const adminSessionSecret = process.env.ADMIN_SESSION_SECRET;

  return NextResponse.json({
    ADMIN_USER: adminUser ? `✅ definido (${adminUser.length} chars)` : "❌ falta",
    ADMIN_PASSWORD: adminPassword ? `✅ definido (${adminPassword.length} chars)` : "❌ falta",
    ADMIN_PASSWORD_HASH: adminPasswordHash ? `✅ definido (${adminPasswordHash.length} chars)` : "❌ falta",
    ADMIN_SESSION_SECRET: adminSessionSecret ? `✅ definido (${adminSessionSecret.length} chars)` : "❌ falta",
    hashFormat: adminPasswordHash?.includes(":") ? "✅ tiene : separador" : "❌ no tiene : separador",
    hashParts: adminPasswordHash?.split(":").length,
  });
}