import Link from "next/link";
import { GameCard } from "@/components/game/game-card";
import { getHotGames, getLatestGames } from "@/lib/services/game";
import { getCategories, getCategoriesWithTopGames } from "@/lib/services/category";

export const revalidate = 60;

export default async function HomePage() {
  const [hot, latest, categories, categoriesWithGames] = await Promise.all([
    getHotGames(12),
    getLatestGames(12),
    getCategories(),
    getCategoriesWithTopGames(6),
  ]);

  const totalGames = new Set([...hot, ...latest].map((g) => g.id)).size;

  return (
    <div className="min-h-screen">
      {/* ── 像素 Hero ── */}
      <section className="relative overflow-hidden border-b-2 border-[color:var(--color-border)] bg-[#0a0a1a] px-4 py-16 md:py-20">
        {/* 星空背景 */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="absolute bg-white"
              style={{
                width: (i % 3 === 0 ? 2 : 1) + 'px',
                height: (i % 3 === 0 ? 2 : 1) + 'px',
                left: ((i * 37 + 13) % 100) + '%',
                top: ((i * 23 + 7) % 80) + '%',
                opacity: 0.2 + (i % 5) * 0.15,
                animation: `star-twinkle ${2 + (i % 3)}s ${i * 0.3}s step-end infinite`,
              }}
            />
          ))}
        </div>

        {/* 像素地面 */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8" style={{ background: 'linear-gradient(0deg, #1a3a0a 0%, #2d5a18 50%, transparent 100%)' }} />
        {/* 像素草地 */}
        <div className="pointer-events-none absolute bottom-6 left-0 right-0 flex">
          {Array.from({ length: 60 }).map((_, i) => (
            <div key={i} className="shrink-0" style={{ width: '8px', height: (4 + (i % 3) * 2) + 'px', background: i % 2 === 0 ? '#3d7a2e' : '#2d6a1e' }} />
          ))}
        </div>

        {/* 像素小人走路 */}
        <div className="pixel-walker" style={{ animationDelay: '0s' }}>
          <PixelChar color="#f0c040" />
        </div>
        <div className="pixel-walker" style={{ animationDelay: '-10s', bottom: '8px' }}>
          <PixelChar color="#60a5fa" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          {/* 像素 Logo */}
          <div className="mb-4 flex justify-center">
            <div className="flex items-center gap-1">
              {['#e53e3e','#f0c040','#48bb78','#3182ce','#805ad5'].map((c, i) => (
                <div key={i} className="h-3 w-3" style={{ background: c, animation: `pixel-bounce 0.6s ${i * 0.1}s step-end infinite` }} />
              ))}
            </div>
          </div>

          <h1
            className="mb-2 text-2xl leading-relaxed text-[color:var(--color-primary)] md:text-3xl"
            style={{ fontFamily: 'var(--font-pixel)', lineHeight: '1.8' }}
          >
            DOWHAT
          </h1>
          <p
            className="mb-1 text-sm text-[color:var(--color-muted)]"
            style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px' }}
          >
            FREE H5 GAMES - NO DOWNLOAD
          </p>
          <p className="mb-6 text-xs text-[color:var(--color-muted)]/60">
            免费 H5 小游戏 · 免下载 · 即点即玩
          </p>

          {/* 搜索栏 */}
          <form action="/search" className="mx-auto mb-8 max-w-lg">
            <div className="relative">
              <input
                name="q"
                type="search"
                placeholder="搜索游戏..."
                className="pixel-search h-10 w-full border-2 border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 text-sm text-[color:var(--color-fg)] placeholder-[color:var(--color-muted)] outline-none transition-colors focus:border-[color:var(--color-primary)]"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center bg-[color:var(--color-primary)] text-[#0f0f23] transition-transform hover:brightness-110"
                style={{ boxShadow: '2px 0 0 rgba(0,0,0,0.3)' }}
              >
                <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '12px' }}>GO</span>
              </button>
            </div>
          </form>

          {/* 统计 */}
          <div className="flex items-center justify-center gap-6" style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px' }}>
            <span className="text-[color:var(--color-primary)]">{totalGames} GAMES</span>
            <span className="text-[color:var(--color-muted)]">|</span>
            <span className="text-[color:var(--color-fg)]">{categories.length} TYPES</span>
            <span className="text-[color:var(--color-muted)]">|</span>
            <span className="text-green-400">FREE</span>
          </div>

          {/* PRESS START 闪烁 */}
          <div
            className="pixel-blink mt-8 text-[color:var(--color-primary)]"
            style={{ fontFamily: 'var(--font-pixel)', fontSize: '11px' }}
          >
            ▼ SCROLL DOWN ▼
          </div>
        </div>
      </section>

      {/* ── 分类横向滑动栏 ── */}
      <section className="relative z-10 -mt-4 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-2">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/games?category=${c.slug}`}
                className="flex shrink-0 items-center gap-2 border-2 border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-2 transition-all hover:border-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/10"
                style={{ boxShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}
              >
                <span className="text-base">{c.icon ?? "🎮"}</span>
                <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px' }}>{c.name}</span>
                <span
                  className="bg-[color:var(--color-primary)]/20 px-1.5 py-0.5 text-[color:var(--color-primary)]"
                  style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px' }}
                >
                  {c.gameCount}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 游戏列表 ── */}
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-8">
        {hot.length > 0 && (
          <Section title="HOT" titleCn="热门游戏" href="/rank">
            <GameGrid games={hot} priorityCount={6} />
          </Section>
        )}

        {latest.length > 0 && (
          <Section title="NEW" titleCn="最新上架" href="/games?sort=new">
            <GameGrid games={latest} />
          </Section>
        )}

        {categoriesWithGames.map((c) => (
          <Section key={c.slug} title={`${c.icon ?? ""} ${c.name}`} href={`/games?category=${c.slug}`}>
            <GameGrid games={c.games} />
          </Section>
        ))}
      </div>
    </div>
  );
}

/* ── 像素小人 SVG ── */
function PixelChar({ color }: { color: string }) {
  return (
    <svg width="16" height="20" viewBox="0 0 16 20" style={{ imageRendering: 'pixelated' }}>
      {/* 头 */}
      <rect x="4" y="0" width="8" height="8" fill={color} />
      {/* 眼睛 */}
      <rect x="5" y="2" width="2" height="2" fill="#0f0f23" />
      <rect x="9" y="2" width="2" height="2" fill="#0f0f23" />
      {/* 身体 */}
      <rect x="4" y="8" width="8" height="6" fill={color} opacity="0.8" />
      {/* 腿 - 交替动画用两组 */}
      <rect x="4" y="14" width="3" height="4" fill={color} opacity="0.7" />
      <rect x="9" y="14" width="3" height="6" fill={color} opacity="0.7" />
      {/* 手臂 */}
      <rect x="1" y="9" width="3" height="2" fill={color} opacity="0.6" />
      <rect x="12" y="9" width="3" height="2" fill={color} opacity="0.6" />
    </svg>
  );
}

/* ── Section ── */
function Section({ title, titleCn, href, children }: { title: string; titleCn?: string; href?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between border-b-2 border-[color:var(--color-border)] pb-2">
        <div className="flex items-baseline gap-2">
          <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: '13px', color: 'var(--color-primary)' }}>{title}</h2>
          {titleCn && <span className="text-xs text-[color:var(--color-muted)]">{titleCn}</span>}
        </div>
        {href && (
          <Link
            href={href}
            className="flex items-center gap-1 text-[color:var(--color-primary)] transition-colors hover:text-[color:var(--color-primary-hover)]"
            style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px' }}
          >
            MORE →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

/* ── GameGrid ── */
function GameGrid({ games, priorityCount = 0 }: { games: Awaited<ReturnType<typeof getHotGames>>; priorityCount?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {games.map((g, i) => (
        <GameCard key={g.id} game={g} priority={i < priorityCount} />
      ))}
    </div>
  );
}
