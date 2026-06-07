import "server-only";

import { createHmac, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE_NAME = "the_new_spark_panel_session";
const PANEL_LOGIN_PATH = "/panel";

const SESSION_DURATION_SECONDS = 60 * 60 * 8;

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000;

type LoginAttemptEntry = {
  count: number;
  blockedUntil: number | null;
};

export type LoginAdminResult =
  | {
      success: true;
      blocked: false;
    }
  | {
      success: false;
      blocked: true;
      remainingSeconds: number;
    }
  | {
      success: false;
      blocked: false;
      attemptsLeft: number;
    };

const loginAttempts = new Map<string, LoginAttemptEntry>();

function getOptionalEnv(name: string) {
  const value = process.env[name];

  if (!value || !value.trim()) {
    return null;
  }

  return value.trim();
}

function getRequiredEnv(name: string) {
  const value = getOptionalEnv(name);

  if (!value) {
    throw new Error(`Falta ${name} en las variables de entorno.`);
  }

  return value;
}

function getAdminUser() {
  return getRequiredEnv("ADMIN_USER");
}

function getAdminPasswordHash() {
  return getRequiredEnv("ADMIN_PASSWORD_HASH");
}

function getAdminSessionSecret() {
  return getRequiredEnv("ADMIN_SESSION_SECRET");
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function verifyPassword(password: string, storedPasswordHash: string) {
  const [salt, storedHash] = storedPasswordHash.split(":");

  if (!salt || !storedHash) {
    return false;
  }

  if (!/^[a-f0-9]+$/i.test(storedHash)) {
    return false;
  }

  const storedHashBuffer = Buffer.from(storedHash, "hex");
  const derivedHashBuffer = scryptSync(password, salt, storedHashBuffer.length);

  if (derivedHashBuffer.length !== storedHashBuffer.length) {
    return false;
  }

  return timingSafeEqual(derivedHashBuffer, storedHashBuffer);
}

function getAdminSessionToken({
  adminUser,
  passwordHash,
  sessionSecret,
}: {
  adminUser: string;
  passwordHash: string;
  sessionSecret: string;
}) {
  return createHmac("sha256", sessionSecret)
    .update(`${adminUser}:${passwordHash}:the-new-spark-panel-session`)
    .digest("hex");
}

function getAttemptEntry(ip: string): LoginAttemptEntry {
  const entry = loginAttempts.get(ip);

  if (!entry) {
    return {
      count: 0,
      blockedUntil: null,
    };
  }

  if (entry.blockedUntil && Date.now() > entry.blockedUntil) {
    loginAttempts.delete(ip);

    return {
      count: 0,
      blockedUntil: null,
    };
  }

  return entry;
}

export function isIpBlocked(ip: string) {
  const entry = getAttemptEntry(ip);

  return Boolean(entry.blockedUntil && Date.now() <= entry.blockedUntil);
}

export function getRemainingBlockSeconds(ip: string) {
  const entry = getAttemptEntry(ip);

  if (!entry.blockedUntil) {
    return 0;
  }

  return Math.max(0, Math.ceil((entry.blockedUntil - Date.now()) / 1000));
}

function recordFailedAttempt(ip: string) {
  const entry = getAttemptEntry(ip);
  const newCount = entry.count + 1;

  loginAttempts.set(ip, {
    count: newCount,
    blockedUntil:
      newCount >= MAX_ATTEMPTS ? Date.now() + BLOCK_DURATION_MS : null,
  });
}

function resetAttempts(ip: string) {
  loginAttempts.delete(ip);
}

export async function isAdminAuthenticated() {
  const adminUser = getOptionalEnv("ADMIN_USER");
  const passwordHash = getOptionalEnv("ADMIN_PASSWORD_HASH");
  const sessionSecret = getOptionalEnv("ADMIN_SESSION_SECRET");

  if (!adminUser || !passwordHash || !sessionSecret) {
    return false;
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);

  const expectedSessionToken = getAdminSessionToken({
    adminUser,
    passwordHash,
    sessionSecret,
  });

  return Boolean(
    sessionCookie?.value && safeCompare(sessionCookie.value, expectedSessionToken)
  );
}

export async function requireAdmin() {
  const isAuthenticated = await isAdminAuthenticated();

  if (!isAuthenticated) {
    redirect(PANEL_LOGIN_PATH);
  }
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

  const adminUser = getAdminUser();
  const passwordHash = getAdminPasswordHash();
  const sessionSecret = getAdminSessionSecret();

  const cleanUsername = username.trim();
  const cleanPassword = password.trim();

  const validUsername = safeCompare(cleanUsername, adminUser);
  const validPassword = verifyPassword(cleanPassword, passwordHash);

  if (!validUsername || !validPassword) {
    recordFailedAttempt(cleanIp);

    const entry = getAttemptEntry(cleanIp);
    const attemptsLeft = Math.max(0, MAX_ATTEMPTS - entry.count);

    return {
      success: false,
      blocked: false,
      attemptsLeft,
    };
  }

  resetAttempts(cleanIp);

  const cookieStore = await cookies();

  cookieStore.set(
    ADMIN_COOKIE_NAME,
    getAdminSessionToken({
      adminUser,
      passwordHash,
      sessionSecret,
    }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_DURATION_SECONDS,
    }
  );

  return {
    success: true,
    blocked: false,
  };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}