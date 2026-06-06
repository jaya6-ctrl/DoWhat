"use client";

import { useActionState } from "react";
import { loginAction, type FormState } from "@/app/(auth)/_actions";
import { Field, FormError, FormNotice, SubmitButton } from "./form-controls";

const initial: FormState = { ok: false };

export function LoginForm({ next, notice }: { next: string; notice?: string }) {
  const [state, formAction] = useActionState(loginAction, initial);
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormNotice message={notice} />
      <FormError message={state.error} />
      <input type="hidden" name="next" value={next} />
      <Field
        label="邮箱"
        name="email"
        type="email"
        required
        autoComplete="email"
        error={state.fieldErrors?.email}
      />
      <Field
        label="密码"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        error={state.fieldErrors?.password}
      />

      {/* 记住我 */}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="remember"
          className="h-4 w-4 border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] accent-[color:var(--color-primary)]"
        />
        <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--color-muted)' }}>
          REMEMBER ME
        </span>
      </label>

      <SubmitButton>
        <span>▶ LOGIN</span>
      </SubmitButton>
    </form>
  );
}
