import Link from "next/link";
import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "注册" };

export default function RegisterPage() {
  return (
    <>
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">注册 DoWhat</h1>
        <p className="text-sm text-[color:var(--color-muted)]">
          注册完成后会向邮箱发送验证邮件，验证后即可登录。
        </p>
      </header>

      <RegisterForm />

      <footer className="text-sm text-[color:var(--color-muted)]">
        已经有账号？
        <Link href="/login" className="ml-1 text-[color:var(--color-fg)] hover:underline">
          去登录
        </Link>
      </footer>
    </>
  );
}
