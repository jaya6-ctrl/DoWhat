"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-10 w-full rounded-md bg-[color:var(--color-primary)] px-4 text-sm font-medium text-white transition hover:bg-[color:var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "处理中..." : children}
    </button>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
      {message}
    </p>
  );
}

export function FormNotice({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200">
      {message}
    </p>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  autoComplete?: string;
  placeholder?: string;
  error?: string;
  accept?: string;
};

export function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  autoComplete,
  placeholder,
  error,
  accept,
}: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm text-[color:var(--color-fg)]">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        placeholder={placeholder}
        accept={accept}
        className="h-10 rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-3 text-sm outline-none focus:border-[color:var(--color-primary)]"
      />
      {error ? <span className="text-xs text-red-600 dark:text-red-300">{error}</span> : null}
    </label>
  );
}
