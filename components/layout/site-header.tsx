import Link from "next/link";
import { getCategories } from "@/lib/services/category";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { UserMenu } from "@/components/layout/user-menu";
import { currentUser } from "@/lib/auth/session";

export async function SiteHeader() {
  const [categories, user] = await Promise.all([getCategories(), currentUser()]);

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)]/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:gap-4 sm:px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[color:var(--color-primary)] text-base font-bold text-white">
            D
          </span>
          <span className="text-lg font-semibold tracking-tight">DoWhat</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/games"
            className="rounded-md px-3 py-1.5 text-sm text-[color:var(--color-muted)] hover:bg-black/5 hover:text-[color:var(--color-fg)] dark:hover:bg-white/10"
          >
            全部游戏
          </Link>
          <Link
            href="/rank"
            className="rounded-md px-3 py-1.5 text-sm text-[color:var(--color-muted)] hover:bg-black/5 hover:text-[color:var(--color-fg)] dark:hover:bg-white/10"
          >
            榜单
          </Link>
          <div className="group relative">
            <button
              type="button"
              className="rounded-md px-3 py-1.5 text-sm text-[color:var(--color-muted)] hover:bg-black/5 hover:text-[color:var(--color-fg)] dark:hover:bg-white/10"
            >
              分类
            </button>
            <div className="invisible absolute left-0 top-full grid w-72 grid-cols-4 gap-1 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-2 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/games?category=${c.slug}`}
                  className="flex flex-col items-center gap-1 rounded-md px-2 py-2 text-xs hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <span className="text-xl">{c.icon ?? "🎮"}</span>
                  <span>{c.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <form action="/search" className="ml-auto max-w-md flex-1">
          <input
            name="q"
            type="search"
            placeholder="搜索游戏..."
            className="h-9 w-full rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-4 text-sm outline-none focus:border-[color:var(--color-primary)]"
          />
        </form>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <UserMenu user={{ name: user.name, avatar: user.avatar }} />
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-1.5 text-sm text-[color:var(--color-muted)] hover:text-[color:var(--color-fg)]"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-[color:var(--color-primary)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[color:var(--color-primary-hover)]"
              >
                注册
              </Link>
            </>
          )}
        </div>

        <MobileMenu categories={categories} user={user ? { name: user.name, avatar: user.avatar } : null} />
      </div>
    </header>
  );
}
