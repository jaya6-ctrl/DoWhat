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
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">查收验证邮件</h1>
        <p className="text-sm text-[color:var(--color-muted)]">
          我们已经向 <strong>{email ?? "你的邮箱"}</strong> 发送了一封验证邮件。
          请点击邮件里的链接完成验证，链接 24 小时内有效。
        </p>
      </header>

      <div className="rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 text-sm text-[color:var(--color-muted)]">
        <p className="mb-1 font-medium text-[color:var(--color-fg)]">没收到邮件？</p>
        <ul className="list-inside list-disc space-y-1">
          <li>检查垃圾邮件 / 推广 / 订阅 等文件夹</li>
          <li>本地开发可以打开 <a className="underline" href="http://localhost:8025" target="_blank" rel="noreferrer">Mailpit 收件箱</a></li>
        </ul>
      </div>

      <footer className="text-sm text-[color:var(--color-muted)]">
        <Link href="/login" className="text-[color:var(--color-fg)] hover:underline">
          返回登录
        </Link>
      </footer>
    </>
  );
}
