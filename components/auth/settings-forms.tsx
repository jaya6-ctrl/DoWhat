"use client";

import { useActionState } from "react";
import {
  changePasswordAction,
  updateProfileAction,
  type FormState,
} from "@/app/settings/_actions";
import { Field, FormError, FormNotice, SubmitButton } from "./form-controls";

const initial: FormState = { ok: false };

export function ProfileForm({
  currentName,
  currentAvatar,
}: {
  currentName: string;
  currentAvatar: string | null;
}) {
  const [state, formAction] = useActionState(updateProfileAction, initial);
  return (
    <form action={formAction} encType="multipart/form-data" className="flex flex-col gap-4">
      <FormError message={state.error} />
      <FormNotice message={state.ok ? state.notice : undefined} />
      <Field
        label="昵称"
        name="name"
        required
        defaultValue={currentName}
        autoComplete="nickname"
        error={state.fieldErrors?.name}
      />
      <div className="flex flex-col gap-1.5">
        <span className="flex items-center gap-1.5 px-sm text-[color:var(--color-fg)]">
          <span className="inline-block h-1.5 w-1.5 bg-[color:var(--color-primary)]" />
          AVATAR
        </span>
        {currentAvatar ? (
          <img src={currentAvatar} alt="当前头像" className="h-16 w-16 border-2 border-[color:var(--color-primary)] object-cover" />
        ) : (
          <p className="px-xs text-[color:var(--color-muted)]">尚未上传头像</p>
        )}
        <input
          type="file"
          name="avatar"
          accept="image/png,image/jpeg,image/webp"
          className="px-xs text-[color:var(--color-muted)]"
        />
        <p className="px-xs text-[color:var(--color-muted)]">PNG / JPEG / WebP，最大 2 MB</p>
      </div>
      <SubmitButton>▶ SAVE PROFILE</SubmitButton>
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, formAction] = useActionState(changePasswordAction, initial);
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormError message={state.error} />
      <FormNotice message={state.ok ? state.notice : undefined} />
      <Field
        label="当前密码"
        name="oldPassword"
        type="password"
        required
        autoComplete="current-password"
        error={state.fieldErrors?.oldPassword}
      />
      <Field
        label="新密码"
        name="newPassword"
        type="password"
        required
        autoComplete="new-password"
        placeholder="至少 8 位，包含字母和数字"
        error={state.fieldErrors?.newPassword}
      />
      <SubmitButton>▶ UPDATE PASSWORD</SubmitButton>
    </form>
  );
}
