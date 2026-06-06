"use client";

import { useActionState, useState } from "react";
import { registerAction, type FormState } from "@/app/(auth)/_actions";
import { Field, FormError, SubmitButton } from "./form-controls";

const initial: FormState = { ok: false };

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, initial);
  const [pw, setPw] = useState("");

  const strength = getPasswordStrength(pw);

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
        placeholder="2-24 个字符"
        error={state.fieldErrors?.name}
      />
      <div>
        <Field
          label="密码"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          placeholder="至少 8 位，包含字母和数字"
          error={state.fieldErrors?.password}
        />
        {/* 密码强度条 */}
        {pw.length > 0 && (
          <div className="mt-2">
            <div className="mb-1 flex items-center justify-between">
              <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--color-muted)' }}>
                PASSWORD STRENGTH
              </span>
              <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: strength.color }}>
                {strength.label}
              </span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-1.5 flex-1 transition-colors"
                  style={{
                    background: i <= strength.level ? strength.color : 'var(--color-border)',
                  }}
                />
              ))}
            </div>
          </div>
        )}
        {/* 隐藏的真实输入用于监听 */}
        <input
          type="text"
          className="pointer-events-none absolute h-0 w-0 opacity-0"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => {
            const real = e.target.form?.querySelector('input[name="password"]') as HTMLInputElement;
            if (real) setPw(real.value);
          }}
          onFocus={() => {
            const form = document.querySelector('form');
            const real = form?.querySelector('input[name="password"]') as HTMLInputElement;
            if (real) {
              const observer = new MutationObserver(() => setPw(real.value));
              observer.observe(real, { attributes: true });
              real.addEventListener('input', () => setPw(real.value), { once: false });
            }
          }}
        />
      </div>

      {/* 条款 */}
      <p className="text-xs text-[color:var(--color-muted)]" style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px' }}>
        注册即表示同意我们的
        <a href="/terms" className="text-[color:var(--color-primary)] hover:underline"> 服务条款 </a>
        和
        <a href="/privacy" className="text-[color:var(--color-primary)] hover:underline"> 隐私政策</a>
      </p>

      <SubmitButton>
        <span>★ REGISTER</span>
      </SubmitButton>
    </form>
  );
}

function getPasswordStrength(pw: string): { level: number; label: string; color: string } {
  if (pw.length === 0) return { level: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;

  if (score <= 1) return { level: 1, label: 'WEAK', color: '#e53e3e' };
  if (score <= 2) return { level: 2, label: 'FAIR', color: '#f0c040' };
  if (score <= 3) return { level: 3, label: 'GOOD', color: '#48bb78' };
  return { level: 4, label: 'STRONG', color: '#38b2ac' };
}
