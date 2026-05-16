import { createHmac } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE_NAME = "the_new_spark_admin_session";

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "NickAdmin2026";
}

function getAdminSessionToken() {
  return createHmac("sha256", getAdminPassword())
    .update("the-new-spark-admin-session")
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
    redirect("/admin");
  }
}

export async function loginAdmin(password: string) {
  const cleanPassword = password.trim();

  if (cleanPassword !== getAdminPassword()) {
    return false;
  }

  const cookieStore = await cookies();

  cookieStore.set(ADMIN_COOKIE_NAME, getAdminSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return true;
}

export async function logoutAdmin() {
  const cookieStore = await cookies();

  cookieStore.delete(ADMIN_COOKIE_NAME);
}