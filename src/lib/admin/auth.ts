import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE_NAME = "the_new_spark_panel_session";
const PANEL_LOGIN_PATH = "/panel";
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000;

type LoginAttemptEntry = {
  count: number;
  blockedUntil: number | null;
};

export type LoginAdminResult =
  | { success: true; blocked: false; sessionToken: string }
  | { success: false; blocked: true; remainingSeconds: number }
  | { success: false; blocked: false; attemptsLeft: number };

const loginAttempts = new Map<string, LoginAttemptEntry>();

function safeCompare(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

function getAdminSessionToken(): string {
  const secret = process.env.ADMIN_SESSION_SECRET ?? "";
  const user = process.env.ADMIN_USER ?? "";
  // Fingerprint simple — solo user + secret, sin contraseña
  return createHmac("sha256", secret)
    .update(`${user}:the-new-spark-session`)
    .digest("hex");
}

function getAttemptEntry(ip: string): LoginAttemptEntry {
  const entry = loginAttempts.get(ip);
  if (!entry) return { count: 0, blockedUntil: null };
  if (entry.blockedUntil && Date.now() > entry.blockedUntil) {
    loginAttempts.delete(ip);
    return { count: 0, blockedUntil: null };
  }
  return entry;
}

export function isIpBlocked(ip: string): boolean {
  const entry = getAttemptEntry(ip);
  return Boolean(entry.blockedUntil && Date.now() <= entry.blockedUntil);
}

export function getRemainingBlockSeconds(ip: string): number {
  const entry = getAttemptEntry(ip);
  if (!entry.blockedUntil) return 0;
  return Math.max(0, Math.ceil((entry.blockedUntil - Date.now()) / 1000));
}

function recordFailedAttempt(ip: string): void {
  const entry = getAttemptEntry(ip);
  const newCount = entry.count + 1;
  loginAttempts.set(ip, {
    count: newCount,
    blockedUntil: newCount >= MAX_ATTEMPTS ? Date.now() + BLOCK_DURATION_MS : null,
  });
}

function resetAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const user = process.env.ADMIN_USER;
  if (!secret || !user) return false;

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);
  if (!sessionCookie?.value) return false;

  return safeCompare(sessionCookie.value, getAdminSessionToken());
}

export async function requireAdmin(): Promise<void> {
  const isAuthenticated = await isAdminAuthenticated();
  if (!isAuthenticated) redirect(PANEL_LOGIN_PATH);
}

export async function loginAdmin(
  username: string,
  password: string,
  ip: string
): Promise<LoginAdminResult> {
  const cleanIp = ip.trim() || "unknown";

  if (isIpBlocked(cleanIp)) {
    return {
      success: false,
      blocked: true,
      remainingSeconds: getRemainingBlockSeconds(cleanIp),
    };
  }

  const adminUser = process.env.ADMIN_USER ?? "";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";

  const validUser = safeCompare(username.trim(), adminUser);
  const validPass = safeCompare(password.trim(), adminPassword);

  if (!validUser || !validPass) {
    recordFailedAttempt(cleanIp);
    const entry = getAttemptEntry(cleanIp);
    return {
      success: false,
      blocked: false,
      attemptsLeft: Math.max(0, MAX_ATTEMPTS - entry.count),
    };
  }

  resetAttempts(cleanIp);

  return {
    success: true,
    blocked: false,
    sessionToken: getAdminSessionToken(),
  };
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}