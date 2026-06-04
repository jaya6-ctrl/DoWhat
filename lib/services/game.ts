import "server-only";
import { prisma } from "@/lib/db";
import { GameStatus, Prisma } from "@prisma/client";

const cardInclude = {
  categories: {
    include: { category: { select: { slug: true, name: true, icon: true } } },
  },
} satisfies Prisma.GameInclude;

export type GameCardData = Prisma.GameGetPayload<{ include: typeof cardInclude }>;

const detailInclude = {
  categories: {
    include: { category: { select: { slug: true, name: true, icon: true } } },
  },
  tags: {
    include: { tag: { select: { slug: true, name: true } } },
  },
} satisfies Prisma.GameInclude;

export type GameDetailData = Prisma.GameGetPayload<{ include: typeof detailInclude }>;

const publishedWhere = {
  status: GameStatus.PUBLISHED,
  publishedAt: { lte: new Date() },
} satisfies Prisma.GameWhereInput;

export async function getHotGames(limit = 12): Promise<GameCardData[]> {
  return prisma.game.findMany({
    where: publishedWhere,
    orderBy: [{ playCount: "desc" }, { publishedAt: "desc" }],
    take: limit,
    include: cardInclude,
  });
}

export async function getLatestGames(limit = 12): Promise<GameCardData[]> {
  return prisma.game.findMany({
    where: publishedWhere,
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: cardInclude,
  });
}

export async function getGamesByCategory(
  categorySlug: string,
  limit = 6,
): Promise<GameCardData[]> {
  return prisma.game.findMany({
    where: {
      ...publishedWhere,
      categories: { some: { category: { slug: categorySlug } } },
    },
    orderBy: [{ playCount: "desc" }, { publishedAt: "desc" }],
    take: limit,
    include: cardInclude,
  });
}

export const SORT_KEYS = ["hot", "new", "rating"] as const;
export type SortKey = (typeof SORT_KEYS)[number];

export const SORT_LABELS: Record<SortKey, string> = {
  hot: "热门",
  new: "最新",
  rating: "评分",
};

export type ListGamesParams = {
  category?: string;
  tag?: string;
  sort?: SortKey;
  page?: number;
  pageSize?: number;
};

export type ListGamesResult = {
  items: GameCardData[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const MAX_PAGE_SIZE = 48;

export async function listGames(params: ListGamesParams = {}): Promise<ListGamesResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, params.pageSize ?? 24));
  const sort: SortKey = params.sort ?? "hot";

  const where: Prisma.GameWhereInput = {
    ...publishedWhere,
    ...(params.category && {
      categories: { some: { category: { slug: params.category } } },
    }),
    ...(params.tag && {
      tags: { some: { tag: { slug: params.tag } } },
    }),
  };

  const orderBy: Prisma.GameOrderByWithRelationInput[] =
    sort === "new"
      ? [{ publishedAt: "desc" }, { createdAt: "desc" }]
      : sort === "rating"
        ? [{ ratingAvg: "desc" }, { ratingCount: "desc" }, { publishedAt: "desc" }]
        : [{ playCount: "desc" }, { publishedAt: "desc" }];

  const [items, total] = await Promise.all([
    prisma.game.findMany({
      where,
      orderBy,
      include: cardInclude,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.game.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export function parseSort(value: string | undefined): SortKey {
  return (SORT_KEYS as readonly string[]).includes(value ?? "") ? (value as SortKey) : "hot";
}

export function parsePage(value: string | undefined): number {
  const n = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export async function getGameBySlug(slug: string): Promise<GameDetailData | null> {
  return prisma.game.findFirst({
    where: { slug, ...publishedWhere },
    include: detailInclude,
  });
}

export async function getRelatedGames(
  slug: string,
  categorySlugs: string[],
  limit = 8,
): Promise<GameCardData[]> {
  if (categorySlugs.length === 0) return [];
  return prisma.game.findMany({
    where: {
      ...publishedWhere,
      slug: { not: slug },
      categories: { some: { category: { slug: { in: categorySlugs } } } },
    },
    orderBy: [{ playCount: "desc" }, { publishedAt: "desc" }],
    take: limit,
    include: cardInclude,
  });
}

export async function getAllPublishedSlugs(): Promise<string[]> {
  const rows = await prisma.game.findMany({
    where: publishedWhere,
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}

export type SitemapGame = { slug: string; updatedAt: Date };

export async function getPublishedGamesForSitemap(): Promise<SitemapGame[]> {
  return prisma.game.findMany({
    where: publishedWhere,
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function incrementPlayCount(slug: string): Promise<void> {
  const game = await prisma.game.findFirst({
    where: { slug, ...publishedWhere },
    select: { id: true },
  });
  if (!game) return;
  await prisma.$transaction([
    prisma.game.update({
      where: { id: game.id },
      data: { playCount: { increment: 1 } },
    }),
    prisma.play.create({
      data: { gameId: game.id },
    }),
  ]);
}
