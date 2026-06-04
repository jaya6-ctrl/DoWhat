import Link from "next/link";
import type { Metadata } from "next";
import {
  getRanking,
  parseRankPeriod,
  RANK_LABELS,
  RANK_PERIODS,
  type RankItem,
  type RankPeriod,
} from "@/lib/services/ranking";

export const revalidate = 60;

type SearchParams = Promise<{ period?: string }>;

const RANK_LIMIT = 50;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const sp = await searchParams;
  const period = parseRankPeriod(sp.period);
  return {
    title: `${RANK_LABELS[period]}榜单`,
    description: `DoWhat ${RANK_LABELS[period]}小游戏排行 Top ${RANK_LIMIT}。`,
  };
}

export default async function RankPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const period = parseRankPeriod(sp.period);
  const items = await getRanking(period, RANK_LIMIT);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <nav className="mb-4 text-sm text-[color:var(--color-muted)]">
        <Link href="/" className="hover:text-[color:var(--color-fg)]">
          首页
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-[color:var(--color-fg)]">榜单</span>
      </nav>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">🏆 {RANK_LABELS[period]}</h1>
          <p className="mt-1 text-sm text-[color:var(--color-muted)]">
            Top {RANK_LIMIT} ·{" "}
            {period === "day"
              ? "最近 24 小时游玩次数"
              : period === "week"
                ? "最近 7 天游玩次数"
                : period === "all"
                  ? "全时段累计游玩次数"
                  : `按平均评分（≥ 3 人评分）`}
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-[color:var(--color-surface)] p-1">
          {RANK_PERIODS.map((p) => (
            <Link
              key={p}
              href={p === "week" ? "/rank" : `/rank?period=${p}`}
              className={
                "rounded-md px-3 py-1 text-sm transition " +
                (period === p
                  ? "bg-[color:var(--color-primary)] text-white"
                  : "text-[color:var(--color-muted)] hover:text-[color:var(--color-fg)]")
              }
            >
              {RANK_LABELS[p]}
            </Link>
          ))}
        </div>
      </div>

      {items.length > 0 ? (
        <ol className="space-y-2">
          {items.map((g, i) => (
            <RankRow key={g.id} game={g} rank={i + 1} period={period} />
          ))}
        </ol>
      ) : (
        <div className="rounded-xl border border-dashed border-[color:var(--color-border)] p-12 text-center text-sm text-[color:var(--color-muted)]">
          暂无榜单数据
        </div>
      )}
    </div>
  );
}

function RankRow({ game, rank, period }: { game: RankItem; rank: number; period: RankPeriod }) {
  const primary = game.categories[0]?.category;
  const scoreLabel = period === "rating" ? `★ ${game.rankScore.toFixed(1)}` : `▶ ${formatCount(game.rankScore)}`;

  return (
    <li>
      <Link
        href={`/games/${game.slug}`}
        className="flex items-center gap-3 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3 transition hover:border-[color:var(--color-primary)] hover:shadow-sm"
      >
        <RankBadge rank={rank} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={game.cover}
          alt={game.title}
          loading="lazy"
          className="h-14 w-20 rounded-md object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="line-clamp-1 text-sm font-medium">{game.title}</div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-[color:var(--color-muted)]">
            {primary && (
              <span>
                {primary.icon ?? ""} {primary.name}
              </span>
            )}
            {game.titleEn && <span className="truncate">{game.titleEn}</span>}
          </div>
        </div>
        <div className="text-sm tabular-nums text-[color:var(--color-muted)]">{scoreLabel}</div>
      </Link>
    </li>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const base = "grid h-9 w-9 shrink-0 place-items-center rounded-md text-sm font-bold tabular-nums";
  if (rank === 1) return <span className={`${base} bg-amber-400 text-white`}>1</span>;
  if (rank === 2) return <span className={`${base} bg-slate-400 text-white`}>2</span>;
  if (rank === 3) return <span className={`${base} bg-orange-500 text-white`}>3</span>;
  return (
    <span className={`${base} bg-black/5 text-[color:var(--color-muted)] dark:bg-white/10`}>
      {rank}
    </span>
  );
}

function formatCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 10000) return `${(n / 1000).toFixed(1)}k`;
  return `${Math.round(n / 1000)}k`;
}
