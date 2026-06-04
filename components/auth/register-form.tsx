"use client";

import { useActionState } from "react";
import { registerAction, type FormState } from "@/app/(auth)/_actions";
import { Field, FormError, SubmitButton } from "./form-controls";

const initial: FormState = { ok: false };

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, initial);
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormError message={state.error} />
      <Field
        label="邮箱"
        name="email"
        type="email"
        required
        autoComplete="email"
        error={state.fieldErrors?.email}
      />
      <Field
        label="昵称"
        name="name"
        required
        autoComplete="nickname"
        placeholder="2-24 个字符，支持中英文/数字/_/-"
        error={state.fieldErrors?.name}
      />
      <Field
        label="密码"
        name="password"
        type="password"
        required
        autoComplete="new-password"
        placeholder="至少 8 位，包含字母和数字"
        error={state.fieldErrors?.password}
      />
      <SubmitButton>注册</SubmitButton>
    </form>
  );
}
