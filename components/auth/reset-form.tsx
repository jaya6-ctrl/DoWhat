"use client";

import { useActionState } from "react";
import { resetAction, type FormState } from "@/app/(auth)/_actions";
import { Field, FormError, SubmitButton } from "./form-controls";

const initial: FormState = { ok: false };

export function ResetForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(resetAction, initial);
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormError message={state.error} />
      <input type="hidden" name="token" value={token} />
      <Field
        label="新密码"
        name="password"
        type="password"
        required
        autoComplete="new-password"
        placeholder="至少 8 位，包含字母和数字"
        error={state.fieldErrors?.password}
      />
      <SubmitButton>重置密码</SubmitButton>
    </form>
  );
}
