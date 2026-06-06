import Link from "next/link";
import type { Metadata } from "next";
import { ForgotForm } from "@/components/auth/forgot-form";

export const metadata: Metadata = { title: "找回密码" };

export default function ForgotPage() {
  return (
    <>
      <header className="text-center">
        <div className="mb-3 flex justify-center">
          <span style={{ fontSize: '40px' }}>🔑</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-pixel)', fontSize: '14px', color: 'var(--color-primary)' }}>
          FORGOT PASSWORD
        </h1>
        <p className="mt-2 text-xs text-[color:var(--color-muted)]">
          输入注册邮箱，我们会发送重置密码的邮件（1 小时内有效）
        </p>
      </header>

      <ForgotForm />

      <footer className="text-center">
        <Link
          href="/login"
          className="text-[color:var(--color-primary)] transition-colors hover:text-[color:var(--color-primary-hover)]"
          style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px' }}
        >
          ◀ BACK TO LOGIN
        </Link>
      </footer>
    </>
  );
}
