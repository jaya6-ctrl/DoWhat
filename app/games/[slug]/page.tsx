import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { GameCard } from "@/components/game/game-card";
import { GamePlayer } from "@/components/game/game-player";
import {
  getGameBySlug,
  getRelatedGames,
  getAllPublishedSlugs,
  type GameDetailData,
} from "@/lib/services/game";

export const revalidate = 60;

type Params = Promise<{ slug: string }>;

type Controls = {
  keyboard?: string[];
  mouse?: boolean;
  touch?: boolean;
};

function parseControls(value: unknown): Controls {
  if (!value || typeof value !== "object") return {};
  return value as Controls;
}

export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGameBySlug(slug);
  if (!game) return { title: "游戏未找到" };
  return {
    title: game.titleEn ? `${game.title} (${game.titleEn})` : game.title,
    description: game.description.slice(0, 140),
    openGraph: {
      title: game.title,
      description: game.description.slice(0, 140),
      images: [game.cover],
    },
  };
}

export default async function GameDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);
  if (!game) notFound();

  const categorySlugs = game.categories.map((c) => c.category.slug);
  const related = await getRelatedGames(slug, categorySlugs, 10);
  const controls = parseControls(game.controls);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Breadcrumb game={game} />

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <main className="min-w-0">
          {/* 游戏播放器 - 像素边框 */}
          <div className="border-2 border-[color:var(--color-border)] bg-[color:var(--color-surface)]" style={{ boxShadow: '4px 4px 0 rgba(0,0,0,0.3)' }}>
            {/* 标题栏 */}
            <div className="flex items-center gap-2 border-b-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-3 py-1.5">
              <span className="inline-block h-2.5 w-2.5 bg-[#e53e3e]" />
              <span className="inline-block h-2.5 w-2.5 bg-[#f0c040]" />
              <span className="inline-block h-2.5 w-2.5 bg-[#48bb78]" />
              <span className="ml-2" style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: 'var(--color-muted)' }}>
                {game.title}.exe
              </span>
            </div>
            {/* 播放器 */}
            <div className="p-1">
              <GamePlayer
                slug={game.slug}
                entryUrl={game.entryUrl}
                width={game.width}
                height={game.height}
                orientation={game.orientation}
                title={game.title}
              />
            </div>
          </div>

          {/* 游戏信息 */}
          <div className="mt-6">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h1 style={{ fontFamily: 'var(--font-pixel)', fontSize: '16px', color: 'var(--color-primary)' }}>
                {game.title}
              </h1>
              {game.titleEn && (
                <span className="text-sm text-[color:var(--color-muted)]">{game.titleEn}</span>
              )}
            </div>

            {/* 统计条 */}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <StatBadge icon="▶" value={game.playCount.toLocaleString()} label="次游玩" />
              {game.ratingCount > 0 && (
                <StatBadge icon="★" value={game.ratingAvg.toFixed(1)} label={`${game.ratingCount} 评`} />
              )}
              <StatBadge icon="📐" value={game.orientation === "PORTRAIT" ? "竖屏" : "横屏"} label={`${game.width}×${game.height}`} />
            </div>

            {/* 描述 */}
            <div className="mt-5 border-2 border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4" style={{ boxShadow: '2px 2px 0 rgba(0,0,0,0.2)' }}>
              <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: 'var(--color-primary)' }} className="mb-2">
                ■ DESCRIPTION
              </h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-[color:var(--color-fg)]">
                {game.description}
              </p>
            </div>

            {/* 操作方式 */}
            <ControlsBlock controls={controls} />
          </div>
        </main>

        <aside className="space-y-4">
          <MetaCard game={game} />
        </aside>
      </div>

      {/* 相关推荐 */}
      {related.length > 0 && (
        <section className="mt-10">
          <div className="mb-3 flex items-baseline justify-between border-b-2 border-[color:var(--color-border)] pb-2">
            <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: '13px', color: 'var(--color-primary)' }}>
              RELATED
            </h2>
            <Link
              href="/games"
              className="text-[color:var(--color-muted)] transition-colors hover:text-[color:var(--color-primary)]"
              style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px' }}
            >
              MORE →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {related.map((g) => (
              <GameCard key={g.id} game={g} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ── 统计徽章 ── */
function StatBadge({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 border-2 border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-2.5 py-1"
      style={{ boxShadow: '2px 2px 0 rgba(0,0,0,0.2)' }}
    >
      <span>{icon}</span>
      <span className="font-bold text-[color:var(--color-fg)]" style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px' }}>
        {value}
      </span>
      <span className="text-xs text-[color:var(--color-muted)]">{label}</span>
    </span>
  );
}

/* ── 面包屑 ── */
function Breadcrumb({ game }: { game: GameDetailData }) {
  const primary = game.categories[0]?.category;
  return (
    <nav className="mb-4 text-xs text-[color:var(--color-muted)]" style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px' }}>
      <Link href="/" className="text-[color:var(--color-primary)] hover:underline">HOME</Link>
      <span className="mx-1.5 text-[color:var(--color-border)]">/</span>
      <Link href="/games" className="text-[color:var(--color-primary)] hover:underline">GAMES</Link>
      {primary && (
        <>
          <span className="mx-1.5 text-[color:var(--color-border)]">/</span>
          <Link href={`/games?category=${primary.slug}`} className="text-[color:var(--color-primary)] hover:underline">
            {primary.icon ?? ""} {primary.name}
          </Link>
        </>
      )}
      <span className="mx-1.5 text-[color:var(--color-border)]">/</span>
      <span className="text-[color:var(--color-fg)]">{game.title}</span>
    </nav>
  );
}

/* ── 右侧信息卡 ── */
function MetaCard({ game }: { game: GameDetailData }) {
  return (
    <div className="border-2 border-[color:var(--color-border)] bg-[color:var(--color-surface)]" style={{ boxShadow: '3px 3px 0 rgba(0,0,0,0.3)' }}>
      {/* 标题 */}
      <div className="border-b-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-4 py-2">
        <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: 'var(--color-primary)' }}>
          ■ GAME INFO
        </h3>
      </div>

      <div className="space-y-4 p-4">
        {/* 封面 */}
        <div className="overflow-hidden border-2 border-[color:var(--color-border)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={game.cover} alt={game.title} className="pixel-img w-full object-cover" />
        </div>

        {/* 分类 */}
        {game.categories.length > 0 && (
          <div>
            <span className="mb-1.5 block text-xs text-[color:var(--color-muted)]" style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px' }}>
              TYPE
            </span>
            <div className="flex flex-wrap gap-1.5">
              {game.categories.map((c) => (
                <Link
                  key={c.category.slug}
                  href={`/games?category=${c.category.slug}`}
                  className="inline-flex items-center gap-1 border-2 border-[color:var(--color-border)] px-2 py-0.5 text-[color:var(--color-fg)] transition-colors hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
                  style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', boxShadow: '1px 1px 0 rgba(0,0,0,0.2)' }}
                >
                  {c.category.icon ?? ""} {c.category.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 标签 */}
        {game.tags.length > 0 && (
          <div>
            <span className="mb-1.5 block text-xs text-[color:var(--color-muted)]" style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px' }}>
              TAG
            </span>
            <div className="flex flex-wrap gap-1.5">
              {game.tags.map((t) => (
                <Link
                  key={t.tag.slug}
                  href={`/games?tag=${t.tag.slug}`}
                  className="inline-flex items-center gap-1 border-2 border-[color:var(--color-border)] px-2 py-0.5 text-[color:var(--color-muted)] transition-colors hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
                  style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', boxShadow: '1px 1px 0 rgba(0,0,0,0.15)' }}
                >
                  {t.tag.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 发布时间 */}
        <div>
          <span className="mb-1 block text-xs text-[color:var(--color-muted)]" style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px' }}>
            RELEASE
          </span>
          <span className="text-sm text-[color:var(--color-fg)]">
            {game.publishedAt
              ? new Date(game.publishedAt).toLocaleDateString("zh-CN")
              : "—"}
          </span>
        </div>

        {/* 快捷操作 */}
        <div className="border-t-2 border-[color:var(--color-border)] pt-3">
          <Link
            href="/games"
            className="flex w-full items-center justify-center gap-2 bg-[color:var(--color-primary)] px-3 py-2 text-[#0f0f23] transition-transform hover:brightness-110"
            style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', boxShadow: '3px 3px 0 rgba(0,0,0,0.3)' }}
          >
            ◀ BACK TO GAMES
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── 操作方式 ── */
function ControlsBlock({ controls }: { controls: Controls }) {
  const hasAny =
    (controls.keyboard && controls.keyboard.length > 0) || controls.mouse || controls.touch;
  if (!hasAny) return null;
  return (
    <div className="mt-5 border-2 border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4" style={{ boxShadow: '2px 2px 0 rgba(0,0,0,0.2)' }}>
      <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: 'var(--color-primary)' }} className="mb-3">
        ■ CONTROLS
      </h3>
      <ul className="space-y-2">
        {controls.keyboard && controls.keyboard.length > 0 && (
          <li className="flex items-start gap-2 text-sm">
            <span>⌨️</span>
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-xs text-[color:var(--color-muted)]">键盘：</span>
              {controls.keyboard.map((k, i) => (
                <kbd
                  key={i}
                  className="inline-block border-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-2 py-0.5 text-xs text-[color:var(--color-fg)]"
                  style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', boxShadow: '1px 1px 0 rgba(0,0,0,0.2)' }}
                >
                  {k}
                </kbd>
              ))}
            </div>
          </li>
        )}
        {controls.mouse && (
          <li className="flex items-center gap-2 text-sm">
            <span>🖱️</span>
            <span className="text-xs text-[color:var(--color-muted)]">支持鼠标操作</span>
          </li>
        )}
        {controls.touch && (
          <li className="flex items-center gap-2 text-sm">
            <span>👆</span>
            <span className="text-xs text-[color:var(--color-muted)]">支持触屏操作</span>
          </li>
        )}
      </ul>
    </div>
  );
}
