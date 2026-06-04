import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { redis } from "@/lib/redis";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  generateToken,
  RESET_TTL_MS,
  VERIFY_TTL_MS,
} from "@/lib/auth/tokens";
import { sendResetEmail, sendVerifyEmail } from "@/lib/auth/mail";
import { saveAvatar } from "@/lib/storage";
import {
  changePasswordSchema,
  forgotSchema,
  loginSchema,
  registerSchema,
  resetSchema,
  type ChangePasswordInput,
  type ForgotInput,
  type LoginInput,
  type RegisterInput,
  type ResetInput,
} from "@/lib/validators/auth";

export class AuthError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

export class RateLimitError extends AuthError {
  constructor() {
    super("RATE_LIMIT", "操作过于频繁，请稍后再试");
  }
}

const RATE_LIMIT_PER_MIN = 5;

async function rateLimit(scope: string, key: string): Promise<void> {
  if (!key) return;
  const redisKey = `ratelimit:${scope}:${key}`;
  try {
    const count = await redis.incr(redisKey);
    if (count === 1) {
      await redis.expire(redisKey, 60);
    }
    if (count > RATE_LIMIT_PER_MIN) {
      throw new RateLimitError();
    }
  } catch (err) {
    if (err instanceof RateLimitError) throw err;
    // Redis hiccup — don't block auth flow, but log
    console.warn("[auth] rate limit redis error:", err);
  }
}

export type PublicUser = {
  id: string;
  email: string | null;
  name: string;
  avatar: string | null;
  emailVerifiedAt: Date | null;
  createdAt: Date;
};

function toPublic(user: {
  id: string;
  email: string | null;
  name: string;
  avatar: string | null;
  emailVerifiedAt: Date | null;
  createdAt: Date;
}): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    emailVerifiedAt: user.emailVerifiedAt,
    createdAt: user.createdAt,
  };
}

// ---------- Register ----------

export async function register(
  raw: RegisterInput,
  meta: { ip: string | null } = { ip: null },
): Promise<{ userId: string }> {
  await rateLimit("register", meta.ip ?? "global");
  const input = registerSchema.parse(raw);
  const email = input.email.toLowerCase();

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    throw new AuthError("EMAIL_TAKEN", "该邮箱已注册");
  }
  const existingName = await prisma.user.findUnique({ where: { name: input.name } });
  if (existingName) {
    throw new AuthError("NAME_TAKEN", "该昵称已被占用");
  }

  const passwordHash = await hashPassword(input.password);
  const token = generateToken();
  const expiresAt = new Date(Date.now() + VERIFY_TTL_MS);

  const user = await prisma.user.create({
    data: {
      email,
      name: input.name,
      passwordHash,
      emailVerifyTokens: {
        create: { token, expiresAt },
      },
    },
  });

  await sendVerifyEmail(email, token);

  return { userId: user.id };
}

// ---------- Verify email ----------

export async function verifyEmail(token: string): Promise<{ email: string }> {
  const row = await prisma.emailVerifyToken.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!row) throw new AuthError("TOKEN_INVALID", "验证链接无效");
  if (row.consumedAt) throw new AuthError("TOKEN_USED", "验证链接已被使用");
  if (row.expiresAt <= new Date()) {
    throw new AuthError("TOKEN_EXPIRED", "验证链接已过期，请重新申请");
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.userId },
      data: { emailVerifiedAt: new Date() },
    }),
    prisma.emailVerifyToken.update({
      where: { token },
      data: { consumedAt: new Date() },
    }),
  ]);

  return { email: row.user.email ?? "" };
}

export async function resendVerifyEmail(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || user.emailVerifiedAt) return; // silent
  const token = generateToken();
  await prisma.emailVerifyToken.create({
    data: { token, userId: user.id, expiresAt: new Date(Date.now() + VERIFY_TTL_MS) },
  });
  await sendVerifyEmail(user.email!, token);
}

// ---------- Login ----------

export type LoginResult =
  | { ok: true; userId: string }
  | { ok: false; code: "INVALID" | "UNVERIFIED"; message: string };

export async function login(
  raw: LoginInput,
  meta: { ip: string | null } = { ip: null },
): Promise<LoginResult> {
  await rateLimit("login", meta.ip ?? "global");
  const input = loginSchema.parse(raw);
  const email = input.email.toLowerCase();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    return { ok: false, code: "INVALID", message: "邮箱或密码错误" };
  }
  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) {
    return { ok: false, code: "INVALID", message: "邮箱或密码错误" };
  }
  if (!user.emailVerifiedAt) {
    return {
      ok: false,
      code: "UNVERIFIED",
      message: "邮箱尚未验证，请先通过验证邮件激活账户",
    };
  }
  return { ok: true, userId: user.id };
}

// ---------- Password reset ----------

export async function requestPasswordReset(
  raw: ForgotInput,
  meta: { ip: string | null } = { ip: null },
): Promise<void> {
  await rateLimit("forgot", meta.ip ?? "global");
  const input = forgotSchema.parse(raw);
  const email = input.email.toLowerCase();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return; // silent — anti-enumeration

  const token = generateToken();
  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt: new Date(Date.now() + RESET_TTL_MS) },
  });
  await sendResetEmail(email, token);
}

export async function resetPassword(raw: ResetInput): Promise<void> {
  const input = resetSchema.parse(raw);
  const row = await prisma.passwordResetToken.findUnique({ where: { token: input.token } });
  if (!row) throw new AuthError("TOKEN_INVALID", "重置链接无效");
  if (row.consumedAt) throw new AuthError("TOKEN_USED", "重置链接已被使用");
  if (row.expiresAt <= new Date()) {
    throw new AuthError("TOKEN_EXPIRED", "重置链接已过期，请重新申请");
  }

  const passwordHash = await hashPassword(input.password);
  await prisma.$transaction([
    prisma.user.update({ where: { id: row.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({
      where: { token: input.token },
      data: { consumedAt: new Date() },
    }),
    // invalidate all sessions for this user (force re-login everywhere)
    prisma.session.deleteMany({ where: { userId: row.userId } }),
  ]);
}

// ---------- Change password (logged-in) ----------

export async function changePassword(
  userId: string,
  raw: ChangePasswordInput,
): Promise<void> {
  const input = changePasswordSchema.parse(raw);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.passwordHash) throw new AuthError("INVALID", "用户不存在");
  const ok = await verifyPassword(input.oldPassword, user.passwordHash);
  if (!ok) throw new AuthError("WRONG_OLD", "当前密码不正确");

  const passwordHash = await hashPassword(input.newPassword);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}

// ---------- Update profile ----------

export async function updateProfile(
  userId: string,
  patch: { name?: string; avatarFile?: File | null },
): Promise<PublicUser> {
  const data: Prisma.UserUpdateInput = {};

  if (patch.name) {
    const trimmed = patch.name.trim();
    const existing = await prisma.user.findFirst({
      where: { name: trimmed, NOT: { id: userId } },
      select: { id: true },
    });
    if (existing) throw new AuthError("NAME_TAKEN", "该昵称已被占用");
    data.name = trimmed;
  }

  if (patch.avatarFile && patch.avatarFile.size > 0) {
    data.avatar = await saveAvatar(userId, patch.avatarFile);
  }

  if (Object.keys(data).length === 0) {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return toPublic(user);
  }

  const user = await prisma.user.update({ where: { id: userId }, data });
  return toPublic(user);
}

// ---------- Public profile lookup ----------

export async function getUserPublic(name: string): Promise<PublicUser | null> {
  const user = await prisma.user.findUnique({ where: { name } });
  return user ? toPublic(user) : null;
}
