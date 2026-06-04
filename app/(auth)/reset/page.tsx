import Link from "next/link";
import type { Metadata } from "next";
import { ResetForm } from "@/components/auth/reset-form";

export const metadata: Metadata = { title: "重置密码" };

type SearchParams = Promise<{ token?: string }>;

export default async function ResetPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { token } = await searchParams;
  if (!token) {
    return (
      <>
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">链接无效</h1>
          <p className="text-sm text-[color:var(--color-muted)]">
            缺少重置令牌，请重新发起找回密码流程。
          </p>
        </header>
        <Link
          href="/forgot"
          className="inline-flex h-10 items-center justify-center rounded-md bg-[color:var(--color-primary)] px-4 text-sm font-medium text-white"
        >
          重新申请重置邮件
        </Link>
      </>
    );
  }
  return (
    <>
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">设置新密码</h1>
        <p className="text-sm text-[color:var(--color-muted)]">
          重置后，所有设备上的登录态会被清除，需重新登录。
        </p>
      </header>
      <ResetForm token={token} />
    </>
  );
}
