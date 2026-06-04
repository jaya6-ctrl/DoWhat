import Link from "next/link";
import { GameCard } from "@/components/game/game-card";
import { getHotGames, getLatestGames } from "@/lib/services/game";
import { getCategories, getCategoriesWithTopGames } from "@/lib/services/category";

export const revalidate = 60;

type Banner = {
  href: string;
  title: string;
  subtitle: string;
  gradient: string;
  decoration: "fire" | "puzzle" | "trophy";
};

const BANNERS: Banner[] = [
  {
    href: "/games?sort=hot",
    title: "热门小游戏",
    subtitle: "免下载，点开即玩",
    gradient: "from-orange-400 via-pink-400 to-purple-500",
    decoration: "fire",
  },
  {
    href: "/games?category=puzzle",
    title: "益智解谜推荐",
    subtitle: "动动脑子，停不下来",
    gradient: "from-sky-400 via-blue-500 to-indigo-600",
    decoration: "puzzle",
  },
  {
    href: "/rank",
    title: "本周榜单",
    subtitle: "看看大家都在玩什么",
    gradient: "from-emerald-400 via-teal-500 to-cyan-600",
    decoration: "trophy",
  },
];

export default async function HomePage() {
  const [hot, latest, categories, categoriesWithGames] = await Promise.all([
    getHotGames(12),
    getLatestGames(12),
    getCategories(),
    getCategoriesWithTopGames(6),
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-6">
      {/* Banner */}
      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {BANNERS.map((b, i) => (
          <Link
            key={b.href}
            href={b.href}
            className={`group relative flex aspect-[5/2] items-center overflow-hidden rounded-2xl bg-gradient-to-br ${b.gradient} p-6 text-white shadow-sm transition hover:shadow-xl md:aspect-[3/2] ${i === 0 ? "md:col-span-2 md:aspect-[5/2]" : ""}`}
          >
            <BannerDecoration kind={b.decoration} large={i === 0} />
            <div className="relative z-10">
              <div className="text-xl font-bold drop-shadow-sm md:text-2xl">{b.title}</div>
              <div className="mt-1 text-sm opacity-90">{b.subtitle}</div>
              <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm transition group-hover:bg-white/30">
                立即开玩
                <span className="transition group-hover:translate-x-0.5">→</span>
              </div>
            </div>
          </Link>
        ))}
      </section>

      {/* 分类入口 */}
      <Section title="游戏分类">
        <div className="grid grid-cols-4 gap-3 md:grid-cols-8">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/games?category=${c.slug}`}
              className="flex flex-col items-center gap-2 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] py-4 transition hover:border-[color:var(--color-primary)]"
            >
              <span className="text-3xl">{c.icon ?? "🎮"}</span>
              <span className="text-sm">{c.name}</span>
              <span className="text-xs text-[color:var(--color-muted)]">{c.gameCount} 款</span>
            </Link>
          ))}
        </div>
      </Section>

      {/* 热门游戏 */}
      {hot.length > 0 && (
        <Section title="热门游戏" href="/rank">
          <GameGrid games={hot} priorityCount={6} />
        </Section>
      )}

      {/* 最新上架 */}
      {latest.length > 0 && (
        <Section title="最新上架" href="/games?sort=new">
          <GameGrid games={latest} />
        </Section>
      )}

      {/* 全部分类 — 每个分类前 6 款 */}
      {categoriesWithGames.map((c) => (
        <Section
          key={c.slug}
          title={`${c.icon ?? ""} ${c.name}`}
          href={`/games?category=${c.slug}`}
        >
          <GameGrid games={c.games} />
        </Section>
      ))}
    </div>
  );
}

function Section({
  title,
  href,
  children,
}: {
  title: string;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {href && (
          <Link
            href={href}
            className="text-sm text-[color:var(--color-muted)] hover:text-[color:var(--color-primary)]"
          >
            查看全部 →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function GameGrid({
  games,
  priorityCount = 0,
}: {
  games: Awaited<ReturnType<typeof getHotGames>>;
  priorityCount?: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
      {games.map((g, i) => (
        <GameCard key={g.id} game={g} priority={i < priorityCount} />
      ))}
    </div>
  );
}

function BannerDecoration({ kind, large }: { kind: Banner["decoration"]; large: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* soft glow blobs */}
      <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
      <div className="absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-black/10 blur-2xl" />
      {/* dot pattern */}
      <svg
        className="absolute inset-0 h-full w-full opacity-30"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id={`dots-${kind}`} x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#dots-${kind})`} />
      </svg>
      {/* kind-specific motif on the right */}
      <div className={`absolute ${large ? "right-8 top-1/2 -translate-y-1/2" : "right-4 bottom-3"} text-white/85`}>
        {kind === "fire" && <FireMotif size={large ? 110 : 72} />}
        {kind === "puzzle" && <PuzzleMotif size={large ? 110 : 72} />}
        {kind === "trophy" && <TrophyMotif size={large ? 110 : 72} />}
      </div>
    </div>
  );
}

function FireMotif({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <path
        d="M50 90c18 0 30-12 30-28 0-12-7-22-15-30 0 8-6 14-12 14 4-12-4-26-13-32 2 16-8 22-14 32-4 7-6 14-6 20 0 14 12 24 30 24Z"
        fill="currentColor"
        opacity=".95"
      />
      <path
        d="M50 80c8 0 14-6 14-14 0-6-3-10-7-14-1 5-4 8-7 8 1-6-3-12-6-15 0 8-5 11-8 16-2 3-3 6-3 9 0 6 5 10 17 10Z"
        fill="#fff"
        opacity=".4"
      />
      {/* sparkles */}
      <circle cx="14" cy="20" r="2" fill="#fff" opacity=".7" />
      <circle cx="86" cy="30" r="1.5" fill="#fff" opacity=".7" />
      <circle cx="22" cy="60" r="1.2" fill="#fff" opacity=".5" />
    </svg>
  );
}

function PuzzleMotif({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <g fill="currentColor" opacity=".95">
        <path d="M10 20h22a6 6 0 0 0 12 0h22v22a6 6 0 0 1 0 12v22H44a6 6 0 0 0-12 0H10V54a6 6 0 0 0 0-12V20Z" />
      </g>
      <g fill="#fff" opacity=".35">
        <path d="M16 26h20v20H16zM52 26h20v20H52zM52 56h20v18H52zM16 56h20v18H16z" />
      </g>
      <circle cx="14" cy="14" r="2" fill="#fff" opacity=".7" />
      <circle cx="86" cy="84" r="1.6" fill="#fff" opacity=".6" />
    </svg>
  );
}

function TrophyMotif({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <path
        d="M30 18h40v18c0 14-9 24-20 24S30 50 30 36V18Z"
        fill="currentColor"
        opacity=".95"
      />
      <path d="M30 24H18c0 12 6 18 14 18M70 24h12c0 12-6 18-14 18" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <rect x="40" y="62" width="20" height="10" fill="currentColor" opacity=".95" />
      <rect x="32" y="72" width="36" height="8" rx="2" fill="currentColor" opacity=".95" />
      <path d="M44 30l4 8 8 1-6 5 2 8-8-4-8 4 2-8-6-5 8-1z" fill="#fff" opacity=".6" />
      <circle cx="12" cy="16" r="2" fill="#fff" opacity=".7" />
      <circle cx="88" cy="80" r="1.5" fill="#fff" opacity=".6" />
    </svg>
  );
}
