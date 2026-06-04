"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { currentUser } from "@/lib/auth/session";
import { AuthError, changePassword, updateProfile } from "@/lib/services/auth";

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

export async function updateProfileAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await currentUser();
  if (!user) redirect("/login?next=/settings");

  const name = asString(formData.get("name")).trim();
  const avatarRaw = formData.get("avatar");
  const avatarFile =
    avatarRaw instanceof File && avatarRaw.size > 0 ? avatarRaw : null;

  if (!name && !avatarFile) {
    return { ok: false, error: "没有需要保存的修改" };
  }

  try {
    await updateProfile(user.id, {
      name: name && name !== user.name ? name : undefined,
      avatarFile,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { ok: false, fieldErrors: fieldErrorsFromZod(err) };
    }
    if (err instanceof AuthError) {
      return { ok: false, error: err.message };
    }
    if (err instanceof Error) {
      return { ok: false, error: err.message };
    }
    throw err;
  }
  revalidatePath("/settings");
  revalidatePath(`/u/${user.name}`);
  return { ok: true, notice: "资料已更新" };
}

export async function changePasswordAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await currentUser();
  if (!user) redirect("/login?next=/settings");

  try {
    await changePassword(user.id, {
      oldPassword: asString(formData.get("oldPassword")),
      newPassword: asString(formData.get("newPassword")),
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
  return { ok: true, notice: "密码已更新" };
}
