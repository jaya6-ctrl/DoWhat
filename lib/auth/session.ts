import "server-only";
import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/db";
import {
  generateToken,
  SESSION_RENEW_THRESHOLD_MS,
  SESSION_TTL_MS,
} from "@/lib/auth/tokens";

export type SessionUser = {
  id: string;
  email: string | null;
  name: string;
  avatar: string | null;
  role: "USER" | "MOD" | "ADMIN";
  emailVerifiedAt: Date | null;
  createdAt: Date;
};

function cookieName(): string {
  return process.env.SESSION_COOKIE_NAME ?? "dowhat_session";
}

function cookieSecure(): boolean {
  const v = process.env.COOKIE_SECURE;
  if (v === "true") return true;
  if (v === "false") return false;
  return process.env.NODE_ENV === "production";
}

export async function setSessionCookie(sessionId: string, expiresAt: Date): Promise<void> {
  const jar = await cookies();
  jar.set({
    name: cookieName(),
    value: sessionId,
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSecure(),
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.set({
    name: cookieName(),
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSecure(),
    path: "/",
    maxAge: 0,
  });
}

export async function readSessionId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(cookieName())?.value ?? null;
}

export async function createSession(userId: string): Promise<{ id: string; expiresAt: Date }> {
  const h = await headers();
  const userAgent = h.get("user-agent")?.slice(0, 512) ?? null;
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null;

  const id = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.session.create({
    data: { id, userId, expiresAt, userAgent, ip },
  });
  await setSessionCookie(id, expiresAt);
  return { id, expiresAt };
}

export async function destroySession(sessionId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { id: sessionId } });
  await clearSessionCookie();
}

export async function destroyAllSessionsForUser(userId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { userId } });
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const sessionId = await readSessionId();
  if (!sessionId) return null;

  const row = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });
  if (!row) return null;

  if (row.expiresAt <= new Date()) {
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
    await clearSessionCookie();
    return null;
  }

  // Lazy renewal: if less than threshold remains, extend
  const remaining = row.expiresAt.getTime() - Date.now();
  if (remaining < SESSION_RENEW_THRESHOLD_MS) {
    const next = new Date(Date.now() + SESSION_TTL_MS);
    await prisma.session.update({
      where: { id: sessionId },
      data: { expiresAt: next },
    });
    await setSessionCookie(sessionId, next);
  }

  const { user } = row;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    role: user.role,
    emailVerifiedAt: user.emailVerifiedAt,
    createdAt: user.createdAt,
  };
}

export const currentUser = getSessionUser;
