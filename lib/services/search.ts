import "server-only";
import { prisma } from "@/lib/db";
import { Prisma, GameStatus } from "@prisma/client";
import type { GameCardData } from "@/lib/services/game";

export type SearchGamesParams = {
  q: string;
  page?: number;
  pageSize?: number;
};

export type SearchGamesResult = {
  items: GameCardData[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  q: string;
};

const MAX_PAGE_SIZE = 48;

const cardInclude = {
  categories: {
    include: { category: { select: { slug: true, name: true, icon: true } } },
  },
} satisfies Prisma.GameInclude;

export function normalizeQuery(raw: string | undefined | null): string {
  return (raw ?? "").trim().slice(0, 64);
}

export async function searchGames(params: SearchGamesParams): Promise<SearchGamesResult> {
  const q = normalizeQuery(params.q);
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, params.pageSize ?? 24));

  if (!q) {
    return { items: [], total: 0, page, pageSize, totalPages: 0, q };
  }

  // ILIKE 走的是 trgm GIN 索引（pg_trgm 对 LIKE/ILIKE 也有效），结合 similarity 综合打分排序。
  const ranked = await prisma.$queryRaw<{ id: string; rank: number }[]>`
    SELECT g.id,
      GREATEST(
        similarity(g.title, ${q}),
        COALESCE(similarity(g."titleEn", ${q}), 0),
        similarity(g.description, ${q}) * 0.5
      ) AS rank
    FROM "Game" g
    WHERE g.status = ${GameStatus.PUBLISHED}::"GameStatus"
      AND g."publishedAt" <= NOW()
      AND (
        g.title ILIKE '%' || ${q} || '%'
        OR g."titleEn" ILIKE '%' || ${q} || '%'
        OR g.description ILIKE '%' || ${q} || '%'
      )
    ORDER BY rank DESC, g."playCount" DESC
    LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}
  `;

  const totalRows = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*)::bigint AS count
    FROM "Game" g
    WHERE g.status = ${GameStatus.PUBLISHED}::"GameStatus"
      AND g."publishedAt" <= NOW()
      AND (
        g.title ILIKE '%' || ${q} || '%'
        OR g."titleEn" ILIKE '%' || ${q} || '%'
        OR g.description ILIKE '%' || ${q} || '%'
      )
  `;
  const total = Number(totalRows[0]?.count ?? BigInt(0));

  if (ranked.length === 0) {
    return { items: [], total, page, pageSize, totalPages: 0, q };
  }

  const rows = await prisma.game.findMany({
    where: { id: { in: ranked.map((r) => r.id) } },
    include: cardInclude,
  });

  // 按 rank 顺序重排（findMany 不保证顺序）
  const orderMap = new Map(ranked.map((r, i) => [r.id, i]));
  const items = rows.sort(
    (a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0),
  );

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    q,
  };
}
