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
        <span className="text-sm">头像</span>
        {currentAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentAvatar}
            alt="当前头像"
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <p className="text-xs text-[color:var(--color-muted)]">尚未上传头像</p>
        )}
        <input
          type="file"
          name="avatar"
          accept="image/png,image/jpeg,image/webp"
          className="text-sm"
        />
        <p className="text-xs text-[color:var(--color-muted)]">PNG / JPEG / WebP，最大 2 MB</p>
      </div>
      <SubmitButton>保存资料</SubmitButton>
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
      <SubmitButton>更新密码</SubmitButton>
    </form>
  );
}
