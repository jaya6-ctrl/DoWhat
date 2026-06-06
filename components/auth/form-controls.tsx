"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-11 w-full items-center justify-center gap-2 bg-[color:var(--color-primary)] px-4 text-sm font-bold text-[#0f0f23] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      style={{ fontFamily: 'var(--font-pixel)', fontSize: '11px', boxShadow: '4px 4px 0 rgba(0,0,0,0.4)' }}
    >
      {pending ? (
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-2 w-2 animate-pulse bg-[#0f0f23]" />
          <span className="inline-block h-2 w-2 animate-pulse bg-[#0f0f23]" style={{ animationDelay: '0.2s' }} />
          <span className="inline-block h-2 w-2 animate-pulse bg-[#0f0f23]" style={{ animationDelay: '0.4s' }} />
          <span className="ml-1">PROCESSING</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div
      className="flex items-start gap-2 border-2 border-[#e53e3e] bg-[#e53e3e]/10 px-3 py-2"
      style={{ boxShadow: '2px 2px 0 rgba(229,62,62,0.2)' }}
    >
      <span className="mt-0.5 text-sm">⚠️</span>
      <p className="text-xs text-[#fc8181]" style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px' }}>
        {message}
      </p>
    </div>
  );
}

export function FormNotice({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div
      className="flex items-start gap-2 border-2 border-[#48bb78] bg-[#48bb78]/10 px-3 py-2"
      style={{ boxShadow: '2px 2px 0 rgba(72,187,120,0.2)' }}
    >
      <span className="mt-0.5 text-sm">✅</span>
      <p className="text-xs text-[#68d391]" style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px' }}>
        {message}
      </p>
    </div>
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
      <span
        className="flex items-center gap-1.5 text-[color:var(--color-fg)]"
        style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px' }}
      >
        <span className="inline-block h-1.5 w-1.5 bg-[color:var(--color-primary)]" />
        {label.toUpperCase()}
        {required && <span className="text-[#e53e3e]">*</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        placeholder={placeholder}
        accept={accept}
        className="h-10 border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-3 text-sm text-[color:var(--color-fg)] outline-none transition-colors placeholder:text-[color:var(--color-muted)]/50 focus:border-[color:var(--color-primary)]"
        style={{
          boxShadow: '2px 2px 0 rgba(0,0,0,0.2)',
          fontFamily: 'var(--font-pixel)',
          fontSize: '10px',
        }}
      />
      {error && (
        <span className="flex items-center gap-1 text-[#fc8181]" style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px' }}>
          <span>↳</span> {error}
        </span>
      )}
    </label>
  );
}
