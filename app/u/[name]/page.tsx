import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getUserPublic } from "@/lib/services/auth";

export const revalidate = 60;

type Params = Promise<{ name: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { name } = await params;
  const decoded = decodeURIComponent(name);
  const user = await getUserPublic(decoded);
  if (!user) return { title: "用户不存在" };
  return {
    title: `${user.name} 的主页`,
    description: `${user.name} 在 DoWhat 的个人主页`,
  };
}

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function initial(name: string): string {
  return Array.from(name)[0]?.toUpperCase() ?? "?";
}

export default async function UserProfilePage({ params }: { params: Params }) {
  const { name } = await params;
  const user = await getUserPublic(decodeURIComponent(name));
  if (!user) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      {/* 面包屑 */}
      <nav className="mb-4 px-xs text-[color:var(--color-muted)]">
        <Link href="/" className="text-[color:var(--color-primary)] hover:underline">HOME</Link>
        <span className="mx-1.5 text-[color:var(--color-border)]">/</span>
        <span className="text-[color:var(--color-fg)]">USER</span>
      </nav>

      {/* 用户卡片 */}
      <div
        className="flex flex-col items-center gap-4 border-2 border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 text-center sm:flex-row sm:text-left"
        style={{ boxShadow: '4px 4px 0 rgba(0,0,0,0.3)' }}
      >
        {/* 头像 */}
        <div className="grid h-20 w-20 place-items-center overflow-hidden border-2 border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-2xl font-semibold text-[#0f0f23]">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            initial(user.name)
          )}
        </div>

        {/* 信息 */}
        <div className="flex flex-1 flex-col gap-1">
          <h1 className="px text-[color:var(--color-primary)]">{user.name}</h1>
          <p className="px-xs text-[color:var(--color-muted)]">
            注册于 {formatDate(user.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
