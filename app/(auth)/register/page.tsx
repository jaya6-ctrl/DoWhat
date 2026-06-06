import Link from "next/link";
import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "注册" };

export default function RegisterPage() {
  return (
    <>
      <header className="text-center">
        {/* 像素星星图标 */}
        <div className="mb-3 flex justify-center">
          <svg width="48" height="48" viewBox="0 0 48 48" style={{ imageRendering: 'pixelated' }}>
            {/* 星星 */}
            <rect x="20" y="0" width="8" height="8" fill="var(--color-primary)" />
            <rect x="16" y="8" width="16" height="4" fill="var(--color-primary)" />
            <rect x="4" y="12" width="40" height="8" fill="var(--color-primary)" />
            <rect x="8" y="20" width="32" height="4" fill="var(--color-primary)" />
            <rect x="12" y="24" width="24" height="4" fill="var(--color-primary)" />
            <rect x="8" y="28" width="12" height="4" fill="var(--color-primary)" />
            <rect x="28" y="28" width="12" height="4" fill="var(--color-primary)" />
            <rect x="4" y="32" width="8" height="4" fill="var(--color-primary)" />
            <rect x="36" y="32" width="8" height="4" fill="var(--color-primary)" />
            {/* 中心 */}
            <rect x="20" y="12" width="8" height="8" fill="#fbbf24" />
          </svg>
        </div>
        <h1 style={{ fontFamily: 'var(--font-pixel)', fontSize: '14px', color: 'var(--color-primary)' }}>
          REGISTER
        </h1>
        <p className="mt-2 text-xs text-[color:var(--color-muted)]">
          创建账户后会向邮箱发送验证邮件
        </p>
      </header>

      <RegisterForm />

      <footer className="text-center">
        <span className="text-xs text-[color:var(--color-muted)]">已有账号？</span>
        <Link
          href="/login"
          className="ml-1 text-[color:var(--color-primary)] transition-colors hover:text-[color:var(--color-primary-hover)]"
          style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px' }}
        >
          GO TO LOGIN →
        </Link>
      </footer>
    </>
  );
}
