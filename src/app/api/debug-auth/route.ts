import { NextResponse } from "next/server";
import { scryptSync, timingSafeEqual } from "crypto";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const testPassword = searchParams.get("p");

  if (!testPassword) {
    return NextResponse.json({ error: "Añade ?p=tu_contraseña a la URL" });
  }

  const storedHash = process.env.ADMIN_PASSWORD_HASH ?? "";
  const [salt, hash] = storedHash.split(":");

  if (!salt || !hash) {
    return NextResponse.json({ error: "Hash mal formado" });
  }

  try {
    const storedHashBuffer = Buffer.from(hash, "hex");
    const derivedHash = scryptSync(testPassword, salt, storedHashBuffer.length);
    const match = timingSafeEqual(derivedHash, storedHashBuffer);

    return NextResponse.json({
      match: match ? "✅ contraseña correcta" : "❌ contraseña incorrecta",
      hashLength: hash.length,
      saltLength: salt.length,
      testedPasswordLength: testPassword.length,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) });
  }
}