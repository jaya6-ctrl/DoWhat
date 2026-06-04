import "server-only";
import { prisma } from "@/lib/db";
import { getGamesByCategory, type GameCardData } from "@/lib/services/game";

export type CategoryListItem = {
  slug: string;
  name: string;
  icon: string | null;
  gameCount: number;
};

export async function getCategories(): Promise<CategoryListItem[]> {
  const rows = await prisma.category.findMany({
    orderBy: { sort: "asc" },
    select: {
      slug: true,
      name: true,
      icon: true,
      _count: { select: { games: true } },
    },
  });
  return rows.map((c) => ({
    slug: c.slug,
    name: c.name,
    icon: c.icon,
    gameCount: c._count.games,
  }));
}

export type CategoryWithGames = CategoryListItem & {
  games: GameCardData[];
};

export async function getCategoriesWithTopGames(
  perCategory = 6,
): Promise<CategoryWithGames[]> {
  const cats = await getCategories();
  const populated = await Promise.all(
    cats.map(async (c) => ({
      ...c,
      games: await getGamesByCategory(c.slug, perCategory),
    })),
  );
  return populated.filter((c) => c.games.length > 0);
}

export async function getCategoryBySlug(slug: string): Promise<CategoryListItem | null> {
  const row = await prisma.category.findUnique({
    where: { slug },
    select: {
      slug: true,
      name: true,
      icon: true,
      _count: { select: { games: true } },
    },
  });
  if (!row) return null;
  return { slug: row.slug, name: row.name, icon: row.icon, gameCount: row._count.games };
}
