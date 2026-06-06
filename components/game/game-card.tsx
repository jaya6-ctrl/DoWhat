import Link from "next/link";
import type { GameCardData } from "@/lib/services/game";

type Props = {
  game: GameCardData;
  priority?: boolean;
};

export function GameCard({ game, priority }: Props) {
  const cats = game.categories.map((c) => c.category);

  return (
    <Link
      href={`/games/${game.slug}`}
      className="group block border-2 border-[color:var(--color-border)] bg-[color:var(--color-surface)] transition-all duration-100 hover:-translate-y-0.5 hover:border-[color:var(--color-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-primary)]"
      style={{ boxShadow: '3px 3px 0 rgba(0,0,0,0.35)' }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[color:var(--color-bg)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={game.cover}
          alt={game.title}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="pixel-img h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
        {/* 悬浮播放按钮 */}
        <div className="game-card-play absolute inset-0 flex items-center justify-center bg-black/40">
          <div
            className="flex h-12 w-12 items-center justify-center bg-[color:var(--color-primary)] text-lg text-[#0f0f23]"
            style={{ fontFamily: 'var(--font-pixel)', fontSize: '16px', boxShadow: '2px 2px 0 rgba(0,0,0,0.5)' }}
          >
            ▶
          </div>
        </div>
      </div>
      <div className="p-2.5">
        <div className="line-clamp-1 px-sm font-medium text-[color:var(--color-fg)]">{game.title}</div>
        <div className="mt-1 flex items-center gap-1 text-[color:var(--color-muted)]">
          {cats.length > 0 && (
            <span className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
              {cats.map((c) => (
                <span
                  key={c.slug}
                  className="inline-flex shrink-0 items-center gap-0.5 border border-[color:var(--color-border)] px-1 py-0.5"
                  style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px' }}
                >
                  <span>{c.icon ?? ""}</span>
                  <span>{c.name}</span>
                </span>
              ))}
            </span>
          )}
          {game.playCount > 0 && (
            <span className="shrink-0 tabular-nums" style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px' }}>
              ▶{formatCount(game.playCount)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function formatCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 10000) return `${(n / 1000).toFixed(1)}k`;
  return `${Math.round(n / 1000)}k`;
}
