import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { GameCard } from "@/components/game/game-card";
import { listGames, parsePage, parseSort, SORT_LABELS, type SortKey } from "@/lib/services/game";
import { getCategories, getCategoryBySlug } from "@/lib/services/category";
import { getTags, getTagBySlug } from "@/lib/services/tag";

export const revalidate = 60;

type SearchParams = Promise<{
  category?: string;
  tag?: string;
  sort?: string;
  page?: string;
}>;

const PAGE_SIZE = 24;

function makeHref(params: { category?: string; tag?: string; sort?: SortKey; page?: number }) {
  const q = new URLSearchParams();
  if (params.category) q.set("category", params.category);
  if (params.tag) q.set("tag", params.tag);
  if (params.sort && params.sort !== "hot") q.set("sort", params.sort);
  if (params.page && params.page > 1) q.set("page", String(params.page));
  const s = q.toString();
  return s ? `/games?${s}` : "/games";
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const sp = await searchParams;
  const [category, tag] = await Promise.all([
    sp.category ? getCategoryBySlug(sp.category) : Promise.resolve(null),
    sp.tag ? getTagBySlug(sp.tag) : Promise.resolve(null),
  ]);
  const sort = parseSort(sp.sort);
  const parts = [
    category ? `${category.icon ?? ""}${category.name}` : "全部游戏",
    tag ? `#${tag.name}` : null,
    SORT_LABELS[sort],
  ].filter(Boolean);
  return {
    title: parts.join(" · "),
    description: `在 DoWhat 浏览${category ? `「${category.name}」分类下的` : ""}小游戏，按${SORT_LABELS[sort]}排序，免下载即点即玩。`,
  };
}

export default async function GamesPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const sort = parseSort(sp.sort);
  const page = parsePage(sp.page);
  const categorySlug = sp.category;
  const tagSlug = sp.tag;

  const [result, categories, tags, activeCategory, activeTag] = await Promise.all([
    listGames({ category: categorySlug, tag: tagSlug, sort, page, pageSize: PAGE_SIZE }),
    getCategories(),
    getTags({ onlyWithGames: true }),
    categorySlug ? getCategoryBySlug(categorySlug) : Promise.resolve(null),
    tagSlug ? getTagBySlug(tagSlug) : Promise.resolve(null),
  ]);

  if ((categorySlug && !activeCategory) || (tagSlug && !activeTag)) notFound();

  const title = activeCategory
    ? `${activeCategory.icon ?? ""} ${activeCategory.name}`
    : "全部游戏";

  const sortLabel = SORT_LABELS[sort];

  const filterContent = (
    <>
      {/* 分类 */}
      <FilterGroup title="TYPE">
        <FilterLink
          href={makeHref({ tag: tagSlug, sort })}
          active={!categorySlug}
          label="全部"
          icon="🎮"
        />
        {categories.map((c) => (
          <FilterLink
            key={c.slug}
            href={makeHref({ category: c.slug, tag: tagSlug, sort })}
            active={c.slug === categorySlug}
            label={c.name}
            icon={c.icon ?? "🎮"}
            count={c.gameCount}
          />
        ))}
      </FilterGroup>

      {/* 标签 */}
      {tags.length > 0 && (
        <FilterGroup title="TAG">
          <div className="flex flex-wrap gap-1.5">
            {activeTag && (
              <Link
                href={makeHref({ category: categorySlug, sort })}
                className="inline-flex items-center gap-1 bg-[color:var(--color-primary)] px-2 py-1 text-[#0f0f23]"
                style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', boxShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}
              >
                × {activeTag.name}
              </Link>
            )}
            {tags
              .filter((t) => t.slug !== tagSlug)
              .map((t) => (
                <Link
                  key={t.slug}
                  href={makeHref({ category: categorySlug, tag: t.slug, sort })}
                  className="inline-flex items-center gap-1 border-2 border-[color:var(--color-border)] px-2 py-1 text-[color:var(--color-muted)] transition-colors hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
                  style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', boxShadow: '1px 1px 0 rgba(0,0,0,0.2)' }}
                >
                  {t.name}
                  <span className="opacity-50">{t.gameCount}</span>
                </Link>
              ))}
          </div>
        </FilterGroup>
      )}
    </>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* 面包屑 */}
      <nav className="mb-4 text-xs text-[color:var(--color-muted)]" style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px' }}>
        <Link href="/" className="text-[color:var(--color-primary)] hover:underline">HOME</Link>
        <span className="mx-1.5 text-[color:var(--color-border)]">/</span>
        <Link href="/games" className="text-[color:var(--color-primary)] hover:underline">GAMES</Link>
        {activeCategory && (
          <>
            <span className="mx-1.5 text-[color:var(--color-border)]">/</span>
            <span className="text-[color:var(--color-fg)]">{activeCategory.name}</span>
          </>
        )}
        {activeTag && (
          <>
            <span className="mx-1.5 text-[color:var(--color-border)]">·</span>
            <span className="text-[color:var(--color-fg)]">#{activeTag.name}</span>
          </>
        )}
      </nav>

      {/* 移动端筛选 */}
      <details className="mb-4 border-2 border-[color:var(--color-border)] bg-[color:var(--color-surface)] lg:hidden" style={{ boxShadow: '3px 3px 0 rgba(0,0,0,0.2)' }}>
        <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm [&::-webkit-details-marker]:hidden">
          <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px' }}>🔍 FILTER</span>
          <span className="text-xs text-[color:var(--color-muted)]">
            {activeCategory ? activeCategory.name : "全部"}
            {activeTag && ` · #${activeTag.name}`}
          </span>
        </summary>
        <div className="space-y-5 border-t-2 border-[color:var(--color-border)] p-4">{filterContent}</div>
      </details>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* 桌面端左侧筛选 */}
        <aside className="hidden space-y-6 lg:sticky lg:top-20 lg:block lg:self-start">
          <div className="border-2 border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4" style={{ boxShadow: '3px 3px 0 rgba(0,0,0,0.2)' }}>
            {filterContent}
          </div>
        </aside>

        {/* 右侧 */}
        <main>
          {/* 标题 + 排序 */}
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <h1 style={{ fontFamily: 'var(--font-pixel)', fontSize: '14px', color: 'var(--color-primary)' }}>
                {title}
              </h1>
              <p className="mt-1 text-xs text-[color:var(--color-muted)]">
                共 <span className="font-bold text-[color:var(--color-fg)]">{result.total}</span> 款游戏
              </p>
            </div>
            <div className="flex items-center gap-0 border-2 border-[color:var(--color-border)] bg-[color:var(--color-surface)]" style={{ boxShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}>
              {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                <Link
                  key={k}
                  href={makeHref({ category: categorySlug, tag: tagSlug, sort: k })}
                  className={
                    "px-3 py-1.5 transition-colors " +
                    (sort === k
                      ? "bg-[color:var(--color-primary)] text-[#0f0f23]"
                      : "text-[color:var(--color-muted)] hover:bg-[color:var(--color-primary)]/10 hover:text-[color:var(--color-fg)]")
                  }
                  style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px' }}
                >
                  {SORT_LABELS[k]}
                </Link>
              ))}
            </div>
          </div>

          {/* 当前筛选标签 */}
          {(activeCategory || activeTag) && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-[color:var(--color-muted)]" style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px' }}>
                FILTER:
              </span>
              {activeCategory && (
                <span
                  className="inline-flex items-center gap-1 bg-[color:var(--color-primary)]/15 px-2 py-0.5 text-[color:var(--color-primary)]"
                  style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', border: '1px solid var(--color-primary)' }}
                >
                  {activeCategory.icon} {activeCategory.name}
                  <Link href={makeHref({ tag: tagSlug, sort })} className="ml-1 hover:opacity-70">×</Link>
                </span>
              )}
              {activeTag && (
                <span
                  className="inline-flex items-center gap-1 bg-[color:var(--color-primary)]/15 px-2 py-0.5 text-[color:var(--color-primary)]"
                  style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', border: '1px solid var(--color-primary)' }}
                >
                  #{activeTag.name}
                  <Link href={makeHref({ category: categorySlug, sort })} className="ml-1 hover:opacity-70">×</Link>
                </span>
              )}
            </div>
          )}

          {/* 网格 */}
          {result.items.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {result.items.map((g, i) => (
                <GameCard key={g.id} game={g} priority={i < 6} />
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-[color:var(--color-border)] p-12 text-center">
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '14px', color: 'var(--color-muted)' }} className="mb-3">
                NO GAMES FOUND
              </div>
              <p className="text-sm text-[color:var(--color-muted)]">没有符合条件的游戏，换个筛选试试？</p>
              <Link
                href="/games"
                className="mt-4 inline-block bg-[color:var(--color-primary)] px-4 py-2 text-[#0f0f23] transition-transform hover:brightness-110"
                style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', boxShadow: '3px 3px 0 rgba(0,0,0,0.3)' }}
              >
                VIEW ALL
              </Link>
            </div>
          )}

          {/* 分页 */}
          {result.totalPages > 1 && (
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              buildHref={(p) => makeHref({ category: categorySlug, tag: tagSlug, sort, page: p })}
            />
          )}
        </main>
      </div>
    </div>
  );
}

/* ── 筛选分组 ── */
function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h3
        className="mb-2 flex items-center gap-2 text-[color:var(--color-primary)]"
        style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px' }}
      >
        <span className="inline-block h-2 w-2 bg-[color:var(--color-primary)]" />
        {title}
      </h3>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

/* ── 筛选链接 ── */
function FilterLink({
  href,
  active,
  label,
  icon,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  icon: string;
  count?: number;
}) {
  return (
    <Link
      href={href}
      className={
        "flex items-center gap-2 px-2.5 py-1.5 text-sm transition-colors " +
        (active
          ? "bg-[color:var(--color-primary)]/15 text-[color:var(--color-primary)]"
          : "text-[color:var(--color-fg)] hover:bg-[color:var(--color-primary)]/5")
      }
      style={active ? { borderLeft: '3px solid var(--color-primary)' } : { borderLeft: '3px solid transparent' }}
    >
      <span className="text-base">{icon}</span>
      <span className="flex-1" style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px' }}>{label}</span>
      {count !== undefined && (
        <span
          className="text-[color:var(--color-muted)]"
          style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px' }}
        >
          {count}
        </span>
      )}
    </Link>
  );
}

/* ── 分页 ── */
function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (p: number) => string;
}) {
  const pages = pageNumbers(page, totalPages);
  return (
    <nav className="mt-8 flex items-center justify-center gap-1" aria-label="分页">
      <PageLink href={buildHref(page - 1)} disabled={page <= 1} ariaLabel="上一页">
        ◀
      </PageLink>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`gap-${i}`} className="px-2 text-[color:var(--color-muted)]" style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px' }}>
            ···
          </span>
        ) : (
          <PageLink key={p} href={buildHref(p)} active={p === page}>
            {p}
          </PageLink>
        ),
      )}
      <PageLink href={buildHref(page + 1)} disabled={page >= totalPages} ariaLabel="下一页">
        ▶
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  children,
  active,
  disabled,
  ariaLabel,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const base = "flex h-9 min-w-[36px] items-center justify-center border-2 px-2 transition-colors";
  if (disabled)
    return (
      <span
        className={`${base} cursor-not-allowed border-[color:var(--color-border)] text-[color:var(--color-muted)] opacity-40`}
        style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px' }}
        aria-disabled
      >
        {children}
      </span>
    );
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={
        active
          ? `${base} border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-[#0f0f23]`
          : `${base} border-[color:var(--color-border)] text-[color:var(--color-muted)] hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]`
      }
      style={{
        fontFamily: 'var(--font-pixel)',
        fontSize: '9px',
        boxShadow: active ? '2px 2px 0 rgba(0,0,0,0.3)' : '1px 1px 0 rgba(0,0,0,0.15)',
      }}
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
