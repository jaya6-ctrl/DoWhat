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
        <header className="text-center">
          <div className="mb-3 flex justify-center">
            <span style={{ fontSize: '40px' }}>❌</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-pixel)', fontSize: '14px', color: '#e53e3e' }}>
            INVALID LINK
          </h1>
          <p className="mt-2 text-xs text-[color:var(--color-muted)]">
            缺少重置令牌，请重新发起找回密码流程
          </p>
        </header>
        <Link
          href="/forgot"
          className="flex h-11 items-center justify-center bg-[color:var(--color-primary)] px-4 text-[#0f0f23] transition-all hover:brightness-110"
          style={{ fontFamily: 'var(--font-pixel)', fontSize: '11px', boxShadow: '4px 4px 0 rgba(0,0,0,0.4)' }}
        >
          ▶ RESEND EMAIL
        </Link>
      </>
    );
  }
  return (
    <>
      <header className="text-center">
        <div className="mb-3 flex justify-center">
          <span style={{ fontSize: '40px' }}>🔒</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-pixel)', fontSize: '14px', color: 'var(--color-primary)' }}>
          NEW PASSWORD
        </h1>
        <p className="mt-2 text-xs text-[color:var(--color-muted)]">
          重置后所有设备需重新登录
        </p>
      </header>
      <ResetForm token={token} />
    </>
  );
}
