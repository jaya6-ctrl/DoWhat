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

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <main className="min-w-0">
          <GamePlayer
            slug={game.slug}
            entryUrl={game.entryUrl}
            width={game.width}
            height={game.height}
            orientation={game.orientation}
            title={game.title}
          />

          <div className="mt-6">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h1 className="text-2xl font-bold tracking-tight">{game.title}</h1>
              {game.titleEn && (
                <span className="text-base text-[color:var(--color-muted)]">{game.titleEn}</span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[color:var(--color-muted)]">
              <span>▶ {game.playCount.toLocaleString()} 次游玩</span>
              {game.ratingCount > 0 && (
                <span>
                  ★ {game.ratingAvg.toFixed(1)} ({game.ratingCount})
                </span>
              )}
              <span>· {game.orientation === "PORTRAIT" ? "竖屏" : "横屏"}</span>
              <span>
                · {game.width} × {game.height}
              </span>
            </div>

            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-[color:var(--color-fg)]">
              {game.description}
            </p>

            <ControlsBlock controls={controls} />
          </div>
        </main>

        <aside className="space-y-5">
          <MetaCard game={game} />
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-10">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">相关推荐</h2>
            <Link
              href="/games"
              className="text-sm text-[color:var(--color-muted)] hover:text-[color:var(--color-fg)]"
            >
              更多 →
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

function Breadcrumb({ game }: { game: GameDetailData }) {
  const primary = game.categories[0]?.category;
  return (
    <nav className="mb-4 text-sm text-[color:var(--color-muted)]">
      <Link href="/" className="hover:text-[color:var(--color-fg)]">
        首页
      </Link>
      <span className="mx-1.5">/</span>
      <Link href="/games" className="hover:text-[color:var(--color-fg)]">
        全部游戏
      </Link>
      {primary && (
        <>
          <span className="mx-1.5">/</span>
          <Link
            href={`/games?category=${primary.slug}`}
            className="hover:text-[color:var(--color-fg)]"
          >
            {primary.icon ?? ""} {primary.name}
          </Link>
        </>
      )}
      <span className="mx-1.5">/</span>
      <span className="text-[color:var(--color-fg)]">{game.title}</span>
    </nav>
  );
}

function MetaCard({ game }: { game: GameDetailData }) {
  return (
    <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4">
      <h3 className="mb-3 text-sm font-semibold">游戏信息</h3>
      <dl className="space-y-3 text-sm">
        {game.categories.length > 0 && (
          <div>
            <dt className="mb-1 text-xs text-[color:var(--color-muted)]">分类</dt>
            <dd className="flex flex-wrap gap-1.5">
              {game.categories.map((c) => (
                <Link
                  key={c.category.slug}
                  href={`/games?category=${c.category.slug}`}
                  className="rounded-md bg-black/5 px-2 py-0.5 text-xs hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  {c.category.icon ?? ""} {c.category.name}
                </Link>
              ))}
            </dd>
          </div>
        )}
        {game.tags.length > 0 && (
          <div>
            <dt className="mb-1 text-xs text-[color:var(--color-muted)]">标签</dt>
            <dd className="flex flex-wrap gap-1.5">
              {game.tags.map((t) => (
                <Link
                  key={t.tag.slug}
                  href={`/games?tag=${t.tag.slug}`}
                  className="rounded-full border border-[color:var(--color-border)] px-2 py-0.5 text-xs text-[color:var(--color-muted)] hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-fg)]"
                >
                  #{t.tag.name}
                </Link>
              ))}
            </dd>
          </div>
        )}
        <div>
          <dt className="mb-1 text-xs text-[color:var(--color-muted)]">发布时间</dt>
          <dd>
            {game.publishedAt
              ? new Date(game.publishedAt).toLocaleDateString("zh-CN")
              : "—"}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function ControlsBlock({ controls }: { controls: Controls }) {
  const hasAny =
    (controls.keyboard && controls.keyboard.length > 0) || controls.mouse || controls.touch;
  if (!hasAny) return null;
  return (
    <div className="mt-5 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3 text-sm">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[color:var(--color-muted)]">
        操作方式
      </h3>
      <ul className="space-y-1">
        {controls.keyboard && controls.keyboard.length > 0 && (
          <li>
            <span className="mr-2">⌨️</span>
            键盘：
            {controls.keyboard.map((k, i) => (
              <kbd
                key={i}
                className="mx-0.5 rounded border border-[color:var(--color-border)] bg-black/5 px-1.5 py-0.5 font-mono text-xs dark:bg-white/10"
              >
                {k}
              </kbd>
            ))}
          </li>
        )}
        {controls.mouse && (
          <li>
            <span className="mr-2">🖱️</span>支持鼠标操作
          </li>
        )}
        {controls.touch && (
          <li>
            <span className="mr-2">👆</span>支持触屏操作
          </li>
        )}
      </ul>
    </div>
  );
}
