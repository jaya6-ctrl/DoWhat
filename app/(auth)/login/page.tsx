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
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">登录 DoWhat</h1>
        <p className="text-sm text-[color:var(--color-muted)]">
          欢迎回来，输入邮箱与密码继续。
        </p>
      </header>

      <LoginForm next={next} notice={notice} />

      <footer className="flex flex-wrap items-center justify-between gap-2 text-sm text-[color:var(--color-muted)]">
        <Link href="/forgot" className="hover:text-[color:var(--color-fg)]">
          忘记密码？
        </Link>
        <Link href="/register" className="hover:text-[color:var(--color-fg)]">
          还没有账号？注册
        </Link>
      </footer>
    </>
  );
}
