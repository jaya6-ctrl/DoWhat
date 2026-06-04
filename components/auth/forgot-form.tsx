"use client";

import { useActionState } from "react";
import { forgotAction, type FormState } from "@/app/(auth)/_actions";
import { Field, FormError, FormNotice, SubmitButton } from "./form-controls";

const initial: FormState = { ok: false };

export function ForgotForm() {
  const [state, formAction] = useActionState(forgotAction, initial);
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormError message={state.error} />
      <FormNotice message={state.notice} />
      <Field
        label="账户邮箱"
        name="email"
        type="email"
        required
        autoComplete="email"
        error={state.fieldErrors?.email}
      />
      <SubmitButton>发送重置邮件</SubmitButton>
    </form>
  );
}
