import Link from "next/link";
import type { GameCardData } from "@/lib/services/game";

type Props = {
  game: GameCardData;
  priority?: boolean;
};

export function GameCard({ game, priority }: Props) {
  const primary = game.categories[0]?.category;

  return (
    <Link
      href={`/games/${game.slug}`}
      className="group block overflow-hidden rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-primary)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-black/5 dark:bg-white/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={game.cover}
          alt={game.title}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-3">
        <div className="line-clamp-1 text-sm font-medium">{game.title}</div>
        <div className="mt-0.5 flex items-center gap-1 text-xs text-[color:var(--color-muted)]">
          {primary && (
            <>
              <span>{primary.icon ?? ""}</span>
              <span>{primary.name}</span>
            </>
          )}
          {game.playCount > 0 && (
            <span className="ml-auto tabular-nums">▶ {formatCount(game.playCount)}</span>
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
