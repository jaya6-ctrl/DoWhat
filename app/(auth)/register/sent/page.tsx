import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "邮件已发送" };

type SearchParams = Promise<{ email?: string }>;

export default async function RegisterSentPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { email } = await searchParams;
  return (
    <>
      <header className="text-center">
        <div className="mb-3 flex justify-center">
          <span style={{ fontSize: '48px' }}>📧</span>
        </div>
        <h1 className="px text-[color:var(--color-primary)]">CHECK YOUR EMAIL</h1>
        <p className="mt-2 px-sm text-[color:var(--color-muted)]">
          我们已向 <strong className="text-[color:var(--color-fg)]">{email ?? "你的邮箱"}</strong> 发送了验证邮件
        </p>
      </header>

      <div className="border-2 border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4" style={{ boxShadow: '2px 2px 0 rgba(0,0,0,0.2)' }}>
        <p className="mb-2 px-sm text-[color:var(--color-primary)]">没收到邮件？</p>
        <ul className="space-y-1.5 px-xs text-[color:var(--color-muted)]">
          <li>→ 检查垃圾邮件 / 推广 / 订阅等文件夹</li>
          <li>→ 本地开发可打开 <a className="text-[color:var(--color-primary)] underline" href="http://localhost:8025" target="_blank" rel="noreferrer">Mailpit 收件箱</a></li>
          <li>→ 链接 24 小时内有效</li>
        </ul>
      </div>

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
