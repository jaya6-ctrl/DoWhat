"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/(auth)/_actions";

type Category = { slug: string; name: string; icon: string | null; gameCount: number };
type UserSummary = { name: string; avatar: string | null };

function initial(name: string): string {
  return Array.from(name)[0]?.toUpperCase() ?? "?";
}

export function MobileMenu({
  categories,
  user,
}: {
  categories: Category[];
  user: UserSummary | null;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);

  // 路由切换后自动关闭（在 render 中根据 pathname 派生，避免 effect 内 setState）
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (open) setOpen(false);
  }

  // 抽屉打开时锁定 body 滚动
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="打开菜单"
        className="grid h-9 w-9 place-items-center rounded-md text-[color:var(--color-fg)] hover:bg-black/5 md:hidden dark:hover:bg-white/10"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M3 5h14M3 10h14M3 15h14"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="关闭菜单"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <aside className="absolute right-0 top-0 flex h-full w-72 max-w-[80vw] flex-col overflow-y-auto bg-[color:var(--color-surface)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[color:var(--color-border)] px-4 py-3">
              <span className="text-base font-semibold">菜单</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="关闭"
                className="grid h-8 w-8 place-items-center rounded-md hover:bg-black/5 dark:hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <nav className="flex flex-col gap-0.5 p-2">
              <NavItem href="/games" label="全部游戏" icon="🎮" />
              <NavItem href="/rank" label="榜单" icon="🏆" />
            </nav>

            <div className="mt-2 border-t border-[color:var(--color-border)] px-4 py-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[color:var(--color-muted)]">
                分类
              </div>
              <div className="grid grid-cols-4 gap-2">
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/games?category=${c.slug}`}
                    className="flex flex-col items-center gap-1 rounded-md px-1 py-2 text-xs hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <span className="text-xl">{c.icon ?? "🎮"}</span>
                    <span>{c.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-auto border-t border-[color:var(--color-border)] p-4">
              {user ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-[color:var(--color-primary)] text-sm font-semibold text-white">
                      {user.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                      ) : (
                        initial(user.name)
                      )}
                    </div>
                    <div className="truncate text-sm font-medium">{user.name}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/u/${encodeURIComponent(user.name)}`}
                      className="rounded-md border border-[color:var(--color-border)] py-2 text-center text-sm"
                    >
                      主页
                    </Link>
                    <Link
                      href="/settings"
                      className="rounded-md border border-[color:var(--color-border)] py-2 text-center text-sm"
                    >
                      设置
                    </Link>
                  </div>
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="w-full rounded-md border border-[color:var(--color-border)] py-2 text-center text-sm"
                    >
                      退出登录
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/login"
                    className="flex-1 rounded-md border border-[color:var(--color-border)] py-2 text-center text-sm"
                  >
                    登录
                  </Link>
                  <Link
                    href="/register"
                    className="flex-1 rounded-md bg-[color:var(--color-primary)] py-2 text-center text-sm font-medium text-white"
                  >
                    注册
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

function NavItem({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm hover:bg-black/5 dark:hover:bg-white/10"
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
