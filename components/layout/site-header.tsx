import Link from "next/link";
import { getCategories } from "@/lib/services/category";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { UserMenu } from "@/components/layout/user-menu";
import { currentUser } from "@/lib/auth/session";

export async function SiteHeader() {
  const [categories, user] = await Promise.all([getCategories(), currentUser()]);

  return (
    <header className="sticky top-0 z-40 border-b-2 border-[color:var(--color-border)] bg-[color:var(--color-surface)]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-12 max-w-7xl items-center gap-2 px-3 sm:gap-4 sm:px-4">
        <Link href="/" className="flex items-center gap-2 group">
          <span
            className="flex h-8 w-8 items-center justify-center text-sm font-bold text-[#0f0f23]"
            style={{ fontFamily: 'var(--font-pixel)', background: 'var(--color-primary)', boxShadow: '2px 2px 0 rgba(0,0,0,0.4)' }}
          >
            D
          </span>
          <span
            className="text-sm tracking-wider text-[color:var(--color-primary)]"
            style={{ fontFamily: 'var(--font-pixel)', fontSize: '11px' }}
          >
            DoWhat
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          <Link
            href="/games"
            className="border-2 border-transparent px-3 py-1.5 text-xs text-[color:var(--color-muted)] transition-colors hover:border-[color:var(--color-border)] hover:text-[color:var(--color-fg)]"
            style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px' }}
          >
            GAMES
          </Link>
          <Link
            href="/rank"
            className="border-2 border-transparent px-3 py-1.5 text-xs text-[color:var(--color-muted)] transition-colors hover:border-[color:var(--color-border)] hover:text-[color:var(--color-fg)]"
            style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px' }}
          >
            RANK
          </Link>
          <div className="group relative">
            <button
              type="button"
              className="border-2 border-transparent px-3 py-1.5 text-xs text-[color:var(--color-muted)] transition-colors hover:border-[color:var(--color-border)] hover:text-[color:var(--color-fg)]"
              style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px' }}
            >
              TYPE
            </button>
            <div className="invisible absolute left-0 top-full mt-px grid w-72 grid-cols-4 gap-0 border-2 border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-2 opacity-0 shadow-[4px_4px_0_rgba(0,0,0,0.4)] transition group-hover:visible group-hover:opacity-100">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/games?category=${c.slug}`}
                  className="flex flex-col items-center gap-1 border-2 border-transparent px-2 py-2 text-xs transition-colors hover:border-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/10"
                >
                  <span className="text-lg">{c.icon ?? "🎮"}</span>
                  <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px' }}>{c.name}</span>
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
            className="pixel-search h-8 w-full border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-3 text-xs text-[color:var(--color-fg)] placeholder-[color:var(--color-muted)] outline-none transition-colors focus:border-[color:var(--color-primary)]"
          />
        </form>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <UserMenu user={{ name: user.name, avatar: user.avatar }} />
          ) : (
            <>
              <Link
                href="/login"
                className="border-2 border-transparent px-3 py-1 text-xs text-[color:var(--color-muted)] transition-colors hover:border-[color:var(--color-border)] hover:text-[color:var(--color-fg)]"
                style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px' }}
              >
                LOGIN
              </Link>
              <Link
                href="/register"
                className="px-3 py-1.5 text-xs font-bold text-[#0f0f23] transition-transform hover:brightness-110"
                style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', background: 'var(--color-primary)', boxShadow: '2px 2px 0 rgba(0,0,0,0.4)' }}
              >
                SIGN UP
              </Link>
            </>
          )}
        </div>

        <MobileMenu categories={categories} user={user ? { name: user.name, avatar: user.avatar } : null} />
      </div>
    </header>
  );
}
