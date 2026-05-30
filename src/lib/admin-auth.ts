import crypto from "crypto";

export const ADMIN_SESSION_COOKIE = "the_new_spark_admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 8;

function getEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Falta configurar la variable de entorno: ${name}`);
  }

  return value;
}

function safeEqual(a: string, b: string) {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);

  if (bufferA.length !== bufferB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufferA, bufferB);
}

function firmar(payload: string) {
  return crypto
    .createHmac("sha256", getEnv("ADMIN_SESSION_SECRET"))
    .update(payload)
    .digest("base64url");
}

export function crearSesionAdmin() {
  const ahora = Math.floor(Date.now() / 1000);

  const payload = Buffer.from(
    JSON.stringify({
      iat: ahora,
      exp: ahora + SESSION_MAX_AGE,
    }),
  ).toString("base64url");

  const firma = firmar(payload);

  return `${payload}.${firma}`;
}

export function verificarSesionAdmin(token?: string) {
  if (!token) {
    return false;
  }

  const [payload, firma] = token.split(".");

  if (!payload || !firma) {
    return false;
  }

  const firmaEsperada = firmar(payload);

  if (!safeEqual(firma, firmaEsperada)) {
    return false;
  }

  try {
    const datos = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as {
      exp: number;
    };

    const ahora = Math.floor(Date.now() / 1000);

    return datos.exp > ahora;
  } catch {
    return false;
  }
}

function verificarPassword(password: string, passwordHash: string) {
  const [salt, hashGuardado] = passwordHash.split(":");

  if (!salt || !hashGuardado) {
    return false;
  }

  const hashCalculado = crypto
    .scryptSync(password, salt, 64)
    .toString("hex");

  return safeEqual(hashCalculado, hashGuardado);
}

export function verificarCredencialesAdmin(usuario: string, password: string) {
  const usuarioReal = getEnv("ADMIN_USER");
  const passwordHash = getEnv("ADMIN_PASSWORD_HASH");

  const usuarioCorrecto = safeEqual(usuario, usuarioReal);
  const passwordCorrecta = verificarPassword(password, passwordHash);

  return usuarioCorrecto && passwordCorrecta;
}