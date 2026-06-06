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

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="打开菜单"
        className="grid h-9 w-9 place-items-center text-[color:var(--color-fg)] hover:bg-[color:var(--color-primary)]/10 md:hidden"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <button type="button" aria-label="关闭菜单" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <aside className="absolute right-0 top-0 flex h-full w-72 max-w-[80vw] flex-col overflow-y-auto border-l-2 border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
            {/* 标题栏 */}
            <div className="flex items-center justify-between border-b-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-4 py-3">
              <span className="px-sm text-[color:var(--color-primary)]">MENU</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="关闭" className="px text-[color:var(--color-muted)] hover:text-[color:var(--color-fg)]">✕</button>
            </div>

            {/* 导航 */}
            <nav className="flex flex-col gap-0 p-2">
              <NavItem href="/games" label="GAMES" icon="🎮" />
              <NavItem href="/rank" label="RANK" icon="🏆" />
            </nav>

            {/* 分类 */}
            <div className="mt-2 border-t-2 border-[color:var(--color-border)] px-4 py-3">
              <div className="px-xs mb-2 text-[color:var(--color-primary)]">TYPE</div>
              <div className="grid grid-cols-4 gap-1">
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/games?category=${c.slug}`}
                    className="flex flex-col items-center gap-1 border-2 border-transparent px-1 py-2 transition-colors hover:border-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/10"
                  >
                    <span className="text-base">{c.icon ?? "🎮"}</span>
                    <span className="px-xs text-[color:var(--color-fg)]">{c.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* 用户区 */}
            <div className="mt-auto border-t-2 border-[color:var(--color-border)] p-4">
              {user ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center overflow-hidden border-2 border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-sm font-semibold text-[#0f0f23]">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                      ) : (
                        initial(user.name)
                      )}
                    </div>
                    <div className="px-sm truncate text-[color:var(--color-fg)]">{user.name}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link href={`/u/${encodeURIComponent(user.name)}`} className="border-2 border-[color:var(--color-border)] py-2 text-center px-sm text-[color:var(--color-fg)]">
                      HOME
                    </Link>
                    <Link href="/settings" className="border-2 border-[color:var(--color-border)] py-2 text-center px-sm text-[color:var(--color-fg)]">
                      SETTING
                    </Link>
                  </div>
                  <form action={logoutAction}>
                    <button type="submit" className="w-full border-2 border-[color:var(--color-border)] py-2 text-center px-sm text-[color:var(--color-muted)]">
                      LOGOUT
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link href="/login" className="flex-1 border-2 border-[color:var(--color-border)] py-2 text-center px-sm text-[color:var(--color-fg)]">
                    LOGIN
                  </Link>
                  <Link href="/register" className="flex-1 bg-[color:var(--color-primary)] py-2 text-center px-sm text-[#0f0f23]" style={{ boxShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}>
                    SIGN UP
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
      className="flex items-center gap-3 border-2 border-transparent px-3 py-2.5 transition-colors hover:border-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/10"
    >
      <span className="text-lg">{icon}</span>
      <span className="px-sm text-[color:var(--color-fg)]">{label}</span>
    </Link>
  );
}
