import Link from "next/link";
import type { Metadata } from "next";
import { GameCard } from "@/components/game/game-card";
import { searchGames, normalizeQuery } from "@/lib/services/search";
import { parsePage } from "@/lib/services/game";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ q?: string; page?: string }>;

const PAGE_SIZE = 24;

function makeHref(q: string, page?: number) {
  const sp = new URLSearchParams();
  sp.set("q", q);
  if (page && page > 1) sp.set("page", String(page));
  return `/search?${sp.toString()}`;
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const sp = await searchParams;
  const q = normalizeQuery(sp.q);
  return {
    title: q ? `搜索：${q}` : "搜索游戏",
    description: q ? `DoWhat 上关于「${q}」的小游戏搜索结果。` : "在 DoWhat 搜索 H5 小游戏。",
    robots: { index: false },
  };
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = normalizeQuery(sp.q);
  const page = parsePage(sp.page);

  const result = q
    ? await searchGames({ q, page, pageSize: PAGE_SIZE })
    : { items: [], total: 0, page: 1, pageSize: PAGE_SIZE, totalPages: 0, q: "" };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* 面包屑 */}
      <nav className="mb-4 px-xs text-[color:var(--color-muted)]">
        <Link href="/" className="text-[color:var(--color-primary)] hover:underline">HOME</Link>
        <span className="mx-1.5 text-[color:var(--color-border)]">/</span>
        <span className="text-[color:var(--color-fg)]">SEARCH</span>
      </nav>

      {/* 搜索框 */}
      <form action="/search" className="mb-6">
        <div className="flex max-w-2xl gap-2">
          <input
            name="q"
            type="search"
            defaultValue={q}
            placeholder="搜索游戏名、玩法描述..."
            autoFocus
            className="pixel-search h-10 flex-1 border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-4 text-sm text-[color:var(--color-fg)] outline-none transition-colors focus:border-[color:var(--color-primary)]"
            style={{ boxShadow: '2px 2px 0 rgba(0,0,0,0.2)', fontFamily: 'var(--font-pixel)', fontSize: '10px' }}
          />
          <button
            type="submit"
            className="bg-[color:var(--color-primary)] px-5 text-[#0f0f23] transition-all hover:brightness-110"
            style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', boxShadow: '3px 3px 0 rgba(0,0,0,0.3)' }}
          >
            GO
          </button>
        </div>
      </form>

      {q ? (
        <>
          <p className="mb-4 px-sm text-[color:var(--color-muted)]">
            搜索「<span className="font-bold text-[color:var(--color-fg)]">{q}</span>」
            共找到 <span className="font-bold text-[color:var(--color-primary)]">{result.total}</span> 款游戏
          </p>

          {result.items.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                {result.items.map((g, i) => (
                  <GameCard key={g.id} game={g} priority={i < 6} />
                ))}
              </div>

              {result.totalPages > 1 && (
                <Pagination page={result.page} totalPages={result.totalPages} buildHref={(p) => makeHref(q, p)} />
              )}
            </>
          ) : (
            <EmptyState q={q} />
          )}
        </>
      ) : (
        <div className="border-2 border-dashed border-[color:var(--color-border)] p-12 text-center">
          <p className="px text-[color:var(--color-primary)]">INPUT KEYWORD</p>
          <p className="mt-2 text-xs text-[color:var(--color-muted)]">输入关键词开始搜索，例如「贪吃蛇」「2048」「益智」</p>
        </div>
      )}
    </div>
  );
}

function EmptyState({ q }: { q: string }) {
  return (
    <div className="border-2 border-dashed border-[color:var(--color-border)] p-12 text-center">
      <p className="px text-[color:var(--color-primary)]">NOT FOUND</p>
      <p className="mt-2 text-sm text-[color:var(--color-muted)]">
        没找到「{q}」相关的游戏，试试更短的关键词，或
        <Link href="/games" className="ml-1 text-[color:var(--color-primary)] hover:underline">浏览全部游戏</Link>
      </p>
    </div>
  );
}

function Pagination({ page, totalPages, buildHref }: { page: number; totalPages: number; buildHref: (p: number) => string }) {
  const pages = pageNumbers(page, totalPages);
  return (
    <nav className="mt-8 flex items-center justify-center gap-1" aria-label="分页">
      <PageLink href={buildHref(page - 1)} disabled={page <= 1}>◀</PageLink>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`gap-${i}`} className="px-2 px-xs text-[color:var(--color-muted)]">···</span>
        ) : (
          <PageLink key={p} href={buildHref(p)} active={p === page}>{p}</PageLink>
        ),
      )}
      <PageLink href={buildHref(page + 1)} disabled={page >= totalPages}>▶</PageLink>
    </nav>
  );
}

function PageLink({ href, children, active, disabled }: { href: string; children: React.ReactNode; active?: boolean; disabled?: boolean }) {
  const base = "flex h-9 min-w-[36px] items-center justify-center border-2 px-2 transition-colors";
  if (disabled) return <span className={`${base} cursor-not-allowed border-[color:var(--color-border)] text-[color:var(--color-muted)] opacity-40`} style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px' }} aria-disabled>{children}</span>;
  return (
    <Link
      href={href}
      className={active ? `${base} border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-[#0f0f23]` : `${base} border-[color:var(--color-border)] text-[color:var(--color-muted)] hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]`}
      style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', boxShadow: active ? '2px 2px 0 rgba(0,0,0,0.3)' : '1px 1px 0 rgba(0,0,0,0.15)' }}
    >
      {children}
    </Link>
  );
}

function pageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("...");
  pages.push(total);
  return pages;
}
