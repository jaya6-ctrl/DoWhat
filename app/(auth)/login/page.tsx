import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "登录" };

type SearchParams = Promise<{ next?: string; verified?: string; reset?: string }>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const next = sp.next ?? "/";
  const notice =
    sp.verified === "1"
      ? "邮箱已验证，请使用账户登录。"
      : sp.reset === "1"
        ? "密码已重置，请使用新密码登录。"
        : undefined;

  return (
    <>
      <header className="text-center">
        {/* 像素盾牌图标 */}
        <div className="mb-3 flex justify-center">
          <svg width="48" height="48" viewBox="0 0 48 48" style={{ imageRendering: 'pixelated' }}>
            <rect x="8" y="4" width="32" height="8" fill="var(--color-primary)" />
            <rect x="4" y="12" width="40" height="24" fill="var(--color-primary)" />
            <rect x="8" y="36" width="32" height="4" fill="var(--color-primary)" />
            <rect x="12" y="40" width="24" height="4" fill="var(--color-primary)" />
            <rect x="16" y="44" width="16" height="4" fill="var(--color-primary)" />
            {/* 锁孔 */}
            <rect x="20" y="18" width="8" height="8" fill="#0f0f23" />
            <rect x="22" y="26" width="4" height="8" fill="#0f0f23" />
            <rect x="20" y="26" width="8" height="2" fill="#0f0f23" />
          </svg>
        </div>
        <h1 style={{ fontFamily: 'var(--font-pixel)', fontSize: '14px', color: 'var(--color-primary)' }}>
          LOGIN
        </h1>
        <p className="mt-2 text-xs text-[color:var(--color-muted)]">
          欢迎回来，输入邮箱与密码继续
        </p>
      </header>

      <LoginForm next={next} notice={notice} />

      <footer className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/forgot"
          className="text-[color:var(--color-muted)] transition-colors hover:text-[color:var(--color-primary)]"
          style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px' }}
        >
          FORGOT PASSWORD?
        </Link>
        <Link
          href="/register"
          className="text-[color:var(--color-muted)] transition-colors hover:text-[color:var(--color-primary)]"
          style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px' }}
        >
          CREATE ACCOUNT →
        </Link>
      </footer>
    </>
  );
}
