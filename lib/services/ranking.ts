import "server-only";
import { prisma } from "@/lib/db";
import { GameStatus, Prisma } from "@prisma/client";
import type { GameCardData } from "@/lib/services/game";

export const RANK_PERIODS = ["day", "week", "all", "rating"] as const;
export type RankPeriod = (typeof RANK_PERIODS)[number];

export const RANK_LABELS: Record<RankPeriod, string> = {
  day: "今日热门",
  week: "本周热门",
  all: "全部时间",
  rating: "高分榜",
};

export function parseRankPeriod(value: string | undefined): RankPeriod {
  return (RANK_PERIODS as readonly string[]).includes(value ?? "")
    ? (value as RankPeriod)
    : "week";
}

export type RankItem = GameCardData & { rankScore: number };

const cardInclude = {
  categories: {
    include: { category: { select: { slug: true, name: true, icon: true } } },
  },
} satisfies Prisma.GameInclude;

const publishedWhere = {
  status: GameStatus.PUBLISHED,
  publishedAt: { lte: new Date() },
} satisfies Prisma.GameWhereInput;

const RATING_MIN_COUNT = 3;

export async function getRanking(period: RankPeriod, limit = 50): Promise<RankItem[]> {
  if (period === "all") {
    const rows = await prisma.game.findMany({
      where: publishedWhere,
      orderBy: [{ playCount: "desc" }, { publishedAt: "desc" }],
      take: limit,
      include: cardInclude,
    });
    return rows.map((g) => ({ ...g, rankScore: g.playCount }));
  }

  if (period === "rating") {
    const rows = await prisma.game.findMany({
      where: { ...publishedWhere, ratingCount: { gte: RATING_MIN_COUNT } },
      orderBy: [{ ratingAvg: "desc" }, { ratingCount: "desc" }],
      take: limit,
      include: cardInclude,
    });
    // 评分榜暂无足够样本时，回退到全时段热度榜
    if (rows.length === 0) return getRanking("all", limit);
    return rows.map((g) => ({ ...g, rankScore: Math.round(g.ratingAvg * 10) / 10 }));
  }

  // day / week: 基于 Play 表时间窗口统计
  const since = new Date(
    Date.now() - (period === "day" ? 24 * 3600 * 1000 : 7 * 24 * 3600 * 1000),
  );

  const grouped = await prisma.play.groupBy({
    by: ["gameId"],
    where: { startedAt: { gte: since } },
    _count: { gameId: true },
    orderBy: { _count: { gameId: "desc" } },
    take: limit,
  });

  // 窗口内还没有任何 Play 记录 → fallback 到全时段热度
  if (grouped.length === 0) return getRanking("all", limit);

  const games = await prisma.game.findMany({
    where: {
      id: { in: grouped.map((g) => g.gameId) },
      ...publishedWhere,
    },
    include: cardInclude,
  });
  const gameById = new Map(games.map((g) => [g.id, g]));

  return grouped
    .map((g) => {
      const game = gameById.get(g.gameId);
      if (!game) return null;
      return { ...game, rankScore: g._count.gameId };
    })
    .filter((x): x is RankItem => x !== null);
}
