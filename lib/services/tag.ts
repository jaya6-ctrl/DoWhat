import "server-only";
import { prisma } from "@/lib/db";
import { GameStatus } from "@prisma/client";

export type TagListItem = {
  slug: string;
  name: string;
  gameCount: number;
};

export async function getTags(opts: { onlyWithGames?: boolean } = {}): Promise<TagListItem[]> {
  const rows = await prisma.tag.findMany({
    select: {
      slug: true,
      name: true,
      _count: {
        select: {
          games: {
            where: { game: { status: GameStatus.PUBLISHED, publishedAt: { lte: new Date() } } },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });
  const mapped = rows.map((t) => ({
    slug: t.slug,
    name: t.name,
    gameCount: t._count.games,
  }));
  return opts.onlyWithGames ? mapped.filter((t) => t.gameCount > 0) : mapped;
}

export async function getTagBySlug(slug: string): Promise<TagListItem | null> {
  const tag = await prisma.tag.findUnique({
    where: { slug },
    select: { slug: true, name: true },
  });
  if (!tag) return null;
  const gameCount = await prisma.game.count({
    where: {
      status: GameStatus.PUBLISHED,
      publishedAt: { lte: new Date() },
      tags: { some: { tag: { slug } } },
    },
  });
  return { ...tag, gameCount };
}
