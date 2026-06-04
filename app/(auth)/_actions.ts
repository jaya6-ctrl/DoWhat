"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  AuthError,
  RateLimitError,
  login,
  register,
  requestPasswordReset,
  resetPassword,
} from "@/lib/services/auth";
import {
  createSession,
  destroySession,
  readSessionId,
} from "@/lib/auth/session";

export type FormState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  notice?: string;
};

function asString(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v : "";
}

function fieldErrorsFromZod(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

async function clientIp(): Promise<string | null> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() ?? null;
  return h.get("x-real-ip");
}

function safeNext(raw: string): string {
  // Only allow same-origin paths
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

// ---------- register ----------

export async function registerAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await register(
      {
        email: asString(formData.get("email")),
        name: asString(formData.get("name")),
        password: asString(formData.get("password")),
      },
      { ip: await clientIp() },
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { ok: false, fieldErrors: fieldErrorsFromZod(err) };
    }
    if (err instanceof RateLimitError) {
      return { ok: false, error: err.message };
    }
    if (err instanceof AuthError) {
      return { ok: false, error: err.message };
    }
    throw err;
  }
  redirect(
    `/register/sent?email=${encodeURIComponent(asString(formData.get("email")).toLowerCase())}`,
  );
}

// ---------- login ----------

export async function loginAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  let userId: string;
  try {
    const result = await login(
      {
        email: asString(formData.get("email")),
        password: asString(formData.get("password")),
      },
      { ip: await clientIp() },
    );
    if (!result.ok) {
      return { ok: false, error: result.message };
    }
    userId = result.userId;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { ok: false, fieldErrors: fieldErrorsFromZod(err) };
    }
    if (err instanceof RateLimitError) {
      return { ok: false, error: err.message };
    }
    throw err;
  }

  await createSession(userId);
  const next = safeNext(asString(formData.get("next")) || "/");
  redirect(next);
}

// ---------- logout ----------

export async function logoutAction(): Promise<void> {
  const sid = await readSessionId();
  if (sid) await destroySession(sid);
  redirect("/");
}

// ---------- forgot ----------

export async function forgotAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await requestPasswordReset(
      { email: asString(formData.get("email")) },
      { ip: await clientIp() },
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { ok: false, fieldErrors: fieldErrorsFromZod(err) };
    }
    if (err instanceof RateLimitError) {
      return { ok: false, error: err.message };
    }
    throw err;
  }
  return {
    ok: true,
    notice: "如果该邮箱已注册，我们已发送一封重置邮件，请查收。",
  };
}

// ---------- reset ----------

export async function resetAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await resetPassword({
      token: asString(formData.get("token")),
      password: asString(formData.get("password")),
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { ok: false, fieldErrors: fieldErrorsFromZod(err) };
    }
    if (err instanceof AuthError) {
      return { ok: false, error: err.message };
    }
    throw err;
  }
  redirect("/login?reset=1");
}
