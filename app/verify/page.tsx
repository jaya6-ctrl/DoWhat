import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AuthError, verifyEmail } from "@/lib/services/auth";

export const metadata: Metadata = { title: "邮箱验证" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ token?: string }>;

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { token } = await searchParams;

  let errorMessage: string | null = null;
  if (!token) {
    errorMessage = "缺少验证令牌";
  } else {
    try {
      await verifyEmail(token);
      redirect("/login?verified=1");
    } catch (err) {
      if (err instanceof AuthError) {
        errorMessage = err.message;
      } else {
        throw err;
      }
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-10 sm:py-16">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">邮箱验证失败</h1>
        <p className="text-sm text-[color:var(--color-muted)]">{errorMessage}</p>
      </header>
      <Link
        href="/login"
        className="inline-flex h-10 items-center justify-center rounded-md border border-[color:var(--color-border)] px-4 text-sm"
      >
        返回登录
      </Link>
    </div>
  );
}
