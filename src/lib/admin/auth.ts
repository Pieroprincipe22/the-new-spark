import { createHmac } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE_NAME = "the_new_spark_panel_session";
const PANEL_LOGIN_PATH = "/panel";

// ── Protección brute force ─────────────────────────────────────────────────
// Máx 5 intentos fallidos → bloqueo de 15 minutos
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000;

type LoginAttemptEntry = {
  count: number;
  blockedUntil: number | null;
};

const loginAttempts = new Map<string, LoginAttemptEntry>();

function getAttemptEntry(ip: string): LoginAttemptEntry {
  return loginAttempts.get(ip) ?? { count: 0, blockedUntil: null };
}

export function isIpBlocked(ip: string): boolean {
  const entry = getAttemptEntry(ip);

  if (entry.blockedUntil === null) return false;

  // Si el bloqueo ya expiró → limpiar
  if (Date.now() > entry.blockedUntil) {
    loginAttempts.delete(ip);
    return false;
  }

  return true;
}

export function getRemainingBlockSeconds(ip: string): number {
  const entry = getAttemptEntry(ip);
  if (!entry.blockedUntil) return 0;
  return Math.ceil((entry.blockedUntil - Date.now()) / 1000);
}

function recordFailedAttempt(ip: string): void {
  const entry = getAttemptEntry(ip);
  const newCount = entry.count + 1;

  loginAttempts.set(ip, {
    count: newCount,
    blockedUntil: newCount >= MAX_ATTEMPTS
      ? Date.now() + BLOCK_DURATION_MS
      : null,
  });
}

function resetAttempts(ip: string): void {
  loginAttempts.delete(ip);
}
// ──────────────────────────────────────────────────────────────────────────

function getAdminPassword() {
  const password = process.env.ADMIN_PASSWORD;

  if (!password || !password.trim()) {
    throw new Error(
      "Falta ADMIN_PASSWORD en las variables de entorno. Añádela en .env.local."
    );
  }

  return password.trim();
}

function getAdminSessionToken() {
  return createHmac("sha256", getAdminPassword())
    .update("the-new-spark-panel-session")
    .digest("hex");
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);

  return sessionCookie?.value === getAdminSessionToken();
}

export async function requireAdmin() {
  const isAuthenticated = await isAdminAuthenticated();

  if (!isAuthenticated) {
    redirect(PANEL_LOGIN_PATH);
  }
}

// ip es obligatorio ahora — viene desde la Server Action del panel
export async function loginAdmin(password: string, ip: string) {
  // ── Comprobar bloqueo ────────────────────────────────────────────────────
  if (isIpBlocked(ip)) {
    return { success: false, blocked: true, remainingSeconds: getRemainingBlockSeconds(ip) };
  }
  // ────────────────────────────────────────────────────────────────────────

  const cleanPassword = password.trim();

  if (cleanPassword !== getAdminPassword()) {
    recordFailedAttempt(ip);

    const entry = getAttemptEntry(ip);
    const attemptsLeft = MAX_ATTEMPTS - entry.count;

    return {
      success: false,
      blocked: false,
      attemptsLeft: Math.max(0, attemptsLeft),
    };
  }

  // Login correcto → limpiar intentos fallidos
  resetAttempts(ip);

  const cookieStore = await cookies();

  cookieStore.set(ADMIN_COOKIE_NAME, getAdminSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return { success: true, blocked: false };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}