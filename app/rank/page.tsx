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
  const top3 = items.slice(0, 3);
  const rest = items.slice(3);
  const maxScore = items.length > 0 ? items[0].rankScore : 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      {/* 面包屑 */}
      <nav className="mb-4 text-xs text-[color:var(--color-muted)]" style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px' }}>
        <Link href="/" className="text-[color:var(--color-primary)] hover:underline">HOME</Link>
        <span className="mx-1.5 text-[color:var(--color-border)]">/</span>
        <span className="text-[color:var(--color-fg)]">RANK</span>
      </nav>

      {/* 标题区 */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 style={{ fontFamily: 'var(--font-pixel)', fontSize: '16px', color: 'var(--color-primary)' }} className="mb-1">
            🏆 {RANK_LABELS[period]}
          </h1>
          <p className="text-xs text-[color:var(--color-muted)]">
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

        {/* 时间切换 */}
        <div className="flex items-center gap-0 border-2 border-[color:var(--color-border)] bg-[color:var(--color-surface)]" style={{ boxShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}>
          {RANK_PERIODS.map((p) => (
            <Link
              key={p}
              href={p === "week" ? "/rank" : `/rank?period=${p}`}
              className={
                "px-3 py-1.5 text-xs transition-colors " +
                (period === p
                  ? "bg-[color:var(--color-primary)] text-[#0f0f23]"
                  : "text-[color:var(--color-muted)] hover:bg-[color:var(--color-primary)]/10 hover:text-[color:var(--color-fg)]")
              }
              style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px' }}
            >
              {RANK_LABELS[p]}
            </Link>
          ))}
        </div>
      </div>

      {items.length > 0 ? (
        <>
          {/* Top 3 领奖台 */}
          {top3.length >= 3 && (
            <div className="mb-8 flex items-end justify-center gap-3">
              {/* 第 2 名 */}
              <PodiumCard game={top3[1]} rank={2} period={period} height="h-28" />
              {/* 第 1 名 */}
              <PodiumCard game={top3[0]} rank={1} period={period} height="h-36" />
              {/* 第 3 名 */}
              <PodiumCard game={top3[2]} rank={3} period={period} height="h-24" />
            </div>
          )}

          {/* 剩余排名列表 */}
          {rest.length > 0 && (
            <ol className="space-y-1.5">
              {rest.map((g, i) => (
                <RankRow key={g.id} game={g} rank={i + 4} period={period} maxScore={maxScore} />
              ))}
            </ol>
          )}
        </>
      ) : (
        <div className="border-2 border-dashed border-[color:var(--color-border)] p-12 text-center">
          <p style={{ fontFamily: 'var(--font-pixel)', fontSize: '11px', color: 'var(--color-muted)' }}>
            NO DATA YET
          </p>
          <p className="mt-2 text-xs text-[color:var(--color-muted)]">暂无榜单数据</p>
        </div>
      )}
    </div>
  );
}

/* ── Top 3 领奖台卡片 ── */
function PodiumCard({ game, rank, period, height }: { game: RankItem; rank: number; period: RankPeriod; height: string }) {
  const scoreLabel = period === "rating" ? `★ ${game.rankScore.toFixed(1)}` : `▶ ${formatCount(game.rankScore)}`;
  const medals = ['🥇', '🥈', '🥉'];
  const colors = ['#f0c040', '#a0aec0', '#c07830'];
  const labels = ['1ST', '2ND', '3RD'];

  return (
    <div className="flex flex-col items-center gap-2">
      {/* 像素皇冠 - 仅第1名 */}
      {rank === 1 && (
        <div className="pixel-crown" style={{ animation: 'pixel-bounce 1s step-end infinite' }}>
          <svg width="24" height="18" viewBox="0 0 24 18" style={{ imageRendering: 'pixelated' }}>
            <rect x="0" y="8" width="4" height="10" fill="#f0c040" />
            <rect x="4" y="4" width="4" height="14" fill="#f0c040" />
            <rect x="8" y="0" width="8" height="18" fill="#f0c040" />
            <rect x="16" y="4" width="4" height="14" fill="#f0c040" />
            <rect x="20" y="8" width="4" height="10" fill="#f0c040" />
            <rect x="10" y="2" width="4" height="4" fill="#e53e3e" />
          </svg>
        </div>
      )}

      {/* 卡片 */}
      <Link
        href={`/games/${game.slug}`}
        className="group flex flex-col items-center gap-2 border-2 bg-[color:var(--color-surface)] p-3 transition-all hover:-translate-y-0.5"
        style={{
          borderColor: colors[rank - 1],
          boxShadow: `3px 3px 0 rgba(0,0,0,0.3)`,
          width: '120px',
        }}
      >
        {/* 奖牌 */}
        <span className="text-2xl">{medals[rank - 1]}</span>

        {/* 封面 */}
        <div className="relative h-16 w-24 overflow-hidden border-2 border-[color:var(--color-border)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={game.cover} alt={game.title} className="pixel-img h-full w-full object-cover" />
        </div>

        {/* 名次标签 */}
        <span
          className="px-2 py-0.5 text-[#0f0f23]"
          style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', background: colors[rank - 1], boxShadow: '1px 1px 0 rgba(0,0,0,0.3)' }}
        >
          {labels[rank - 1]}
        </span>

        {/* 游戏名 */}
        <span className="line-clamp-1 text-center text-xs font-medium">{game.title}</span>

        {/* 分数 */}
        <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: colors[rank - 1] }}>
          {scoreLabel}
        </span>
      </Link>

      {/* 底座 */}
      <div
        className="flex items-center justify-center border-2 border-t-4"
        style={{
          borderColor: colors[rank - 1],
          background: `linear-gradient(180deg, ${colors[rank - 1]}22, ${colors[rank - 1]}08)`,
          width: '120px',
          height: rank === 1 ? '40px' : rank === 2 ? '28px' : '20px',
          boxShadow: '2px 2px 0 rgba(0,0,0,0.2)',
        }}
      >
        <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: colors[rank - 1] }}>
          {labels[rank - 1]}
        </span>
      </div>
    </div>
  );
}

/* ── 排名行 ── */
function RankRow({ game, rank, period, maxScore }: { game: RankItem; rank: number; period: RankPeriod; maxScore: number }) {
  const primary = game.categories[0]?.category;
  const scoreLabel = period === "rating" ? `★ ${game.rankScore.toFixed(1)}` : `▶ ${formatCount(game.rankScore)}`;
  const barWidth = maxScore > 0 ? Math.max(5, (game.rankScore / maxScore) * 100) : 0;

  return (
    <li>
      <Link
        href={`/games/${game.slug}`}
        className="group flex items-center gap-3 border-2 border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-2.5 transition-all hover:border-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/5"
        style={{ boxShadow: '2px 2px 0 rgba(0,0,0,0.2)' }}
      >
        {/* 名次 */}
        <RankBadge rank={rank} />

        {/* 封面 */}
        <div className="relative h-12 w-16 shrink-0 overflow-hidden border-2 border-[color:var(--color-border)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={game.cover} alt={game.title} loading="lazy" className="pixel-img h-full w-full object-cover" />
        </div>

        {/* 信息 */}
        <div className="min-w-0 flex-1">
          <div className="line-clamp-1 text-sm font-medium group-hover:text-[color:var(--color-primary)]">{game.title}</div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-[color:var(--color-muted)]">
            {primary && (
              <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px' }}>
                {primary.icon ?? ""} {primary.name}
              </span>
            )}
          </div>
          {/* 进度条 */}
          <div className="mt-1.5 h-1.5 w-full bg-[color:var(--color-border)]">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: barWidth + '%',
                background: rank <= 3 ? 'var(--color-primary)' : 'var(--color-muted)',
              }}
            />
          </div>
        </div>

        {/* 分数 */}
        <div className="shrink-0 text-right">
          <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: rank <= 3 ? 'var(--color-primary)' : 'var(--color-muted)' }}>
            {scoreLabel}
          </span>
        </div>
      </Link>
    </li>
  );
}

/* ── 名次徽章 ── */
function RankBadge({ rank }: { rank: number }) {
  const base = "flex h-8 w-8 shrink-0 items-center justify-center border-2 text-xs font-bold tabular-nums";
  if (rank === 1) return <span className={base} style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', background: '#f0c040', color: '#0f0f23', borderColor: '#d4a830', boxShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}>{rank}</span>;
  if (rank === 2) return <span className={base} style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', background: '#a0aec0', color: '#0f0f23', borderColor: '#718096', boxShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}>{rank}</span>;
  if (rank === 3) return <span className={base} style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', background: '#c07830', color: '#0f0f23', borderColor: '#975a16', boxShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}>{rank}</span>;
  return (
    <span className={base} style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', background: 'var(--color-bg)', color: 'var(--color-muted)', borderColor: 'var(--color-border)', boxShadow: '2px 2px 0 rgba(0,0,0,0.2)' }}>
      {rank}
    </span>
  );
}

function formatCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 10000) return `${(n / 1000).toFixed(1)}k`;
  return `${Math.round(n / 1000)}k`;
}
