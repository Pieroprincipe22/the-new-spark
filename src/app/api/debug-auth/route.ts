import { NextResponse } from "next/server";
import { scryptSync, timingSafeEqual } from "crypto";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const testPassword = searchParams.get("p");
  const testUser = searchParams.get("u");

  const storedHash = process.env.ADMIN_PASSWORD_HASH ?? "";
  const adminUser = process.env.ADMIN_USER ?? "";
  const [salt, hash] = storedHash.split(":");

  // Verificar usuario
  let userMatch = false;
  if (testUser) {
    const a = Buffer.from(testUser.trim());
    const b = Buffer.from(adminUser.trim());
    userMatch = a.length === b.length && timingSafeEqual(a, b);
  }

  // Verificar contraseña
  let passwordMatch = false;
  if (testPassword && salt && hash) {
    try {
      const storedHashBuffer = Buffer.from(hash, "hex");
      const derivedHash = scryptSync(testPassword.trim(), salt, storedHashBuffer.length);
      passwordMatch = timingSafeEqual(derivedHash, storedHashBuffer);
    } catch {
      passwordMatch = false;
    }
  }

  return NextResponse.json({
    userMatch: userMatch ? "✅ usuario correcto" : "❌ usuario incorrecto",
    passwordMatch: passwordMatch ? "✅ contraseña correcta" : "❌ contraseña incorrecta",
    adminUserLength: adminUser.length,
    adminUserValue: adminUser, // lo borramos después
    testedUserLength: testUser?.length ?? 0,
    testedUser: testUser,
  });
}