import Link from "next/link";
import type { Metadata } from "next";
import { ForgotForm } from "@/components/auth/forgot-form";

export const metadata: Metadata = { title: "找回密码" };

export default function ForgotPage() {
  return (
    <>
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">找回密码</h1>
        <p className="text-sm text-[color:var(--color-muted)]">
          输入注册邮箱，我们会发送一封重置密码的邮件（1 小时内有效）。
        </p>
      </header>

      <ForgotForm />

      <footer className="text-sm text-[color:var(--color-muted)]">
        <Link href="/login" className="text-[color:var(--color-fg)] hover:underline">
          返回登录
        </Link>
      </footer>
    </>
  );
}
