import { PrismaClient, Orientation, GameStatus, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORIES = [
  { slug: "action", name: "动作", icon: "⚔️", sort: 10 },
  { slug: "puzzle", name: "益智", icon: "🧩", sort: 20 },
  { slug: "casual", name: "休闲", icon: "🎈", sort: 30 },
  { slug: "arcade", name: "街机", icon: "🕹️", sort: 40 },
  { slug: "strategy", name: "策略", icon: "♟️", sort: 50 },
  { slug: "shooter", name: "射击", icon: "🎯", sort: 60 },
  { slug: "racing", name: "竞速", icon: "🏎️", sort: 70 },
  { slug: "sports", name: "体育", icon: "⚽", sort: 80 },
];

const TAGS = [
  { slug: "single-player", name: "单人" },
  { slug: "keyboard", name: "键盘操作" },
  { slug: "mouse", name: "鼠标操作" },
  { slug: "touch", name: "触屏" },
  { slug: "classic", name: "经典" },
  { slug: "logic", name: "逻辑" },
  { slug: "speed", name: "敏捷" },
  { slug: "memory", name: "记忆" },
  { slug: "ai-opponent", name: "人机对战" },
];

type SeedGame = {
  slug: string;
  title: string;
  titleEn: string;
  description: string;
  orientation: Orientation;
  width: number;
  height: number;
  controls: Prisma.InputJsonValue;
  categories: string[];
  tags: string[];
};

const GAMES: SeedGame[] = [
  {
    slug: "snake",
    title: "贪吃蛇",
    titleEn: "Snake",
    description:
      "经典贪吃蛇。用方向键 / WASD 控制蛇移动，吃到食物长身体，撞墙或撞自己就 Game Over。",
    orientation: Orientation.LANDSCAPE,
    width: 400,
    height: 480,
    controls: { keyboard: ["WASD", "方向键"], touch: true },
    categories: ["casual", "arcade"],
    tags: ["single-player", "keyboard", "touch", "classic", "speed"],
  },
  {
    slug: "2048",
    title: "2048",
    titleEn: "2048",
    description:
      "滑动数字方块合并相同数字，目标是拼出 2048。来自 Gabriele Cirulli 的经典作品的复刻。",
    orientation: Orientation.PORTRAIT,
    width: 380,
    height: 500,
    controls: { keyboard: ["WASD", "方向键"], touch: true },
    categories: ["puzzle", "casual"],
    tags: ["single-player", "keyboard", "touch", "classic", "logic"],
  },
  {
    slug: "tic-tac-toe",
    title: "井字棋",
    titleEn: "Tic-Tac-Toe",
    description:
      "三连成线获胜。你执 X 先手，AI 执 O 使用 Minimax 算法，理论上你最多打平。",
    orientation: Orientation.PORTRAIT,
    width: 320,
    height: 440,
    controls: { mouse: true, touch: true },
    categories: ["puzzle", "strategy"],
    tags: ["single-player", "mouse", "touch", "ai-opponent", "logic", "classic"],
  },
  {
    slug: "memory",
    title: "翻牌记忆",
    titleEn: "Memory Match",
    description:
      "翻开两张牌，相同则保留、不同则盖上。用最少的步数和最短时间找出所有 8 对水果。",
    orientation: Orientation.PORTRAIT,
    width: 360,
    height: 500,
    controls: { mouse: true, touch: true },
    categories: ["puzzle", "casual"],
    tags: ["single-player", "mouse", "touch", "memory"],
  },
  {
    slug: "breakout",
    title: "打砖块",
    titleEn: "Breakout",
    description:
      "经典 Atari 打砖块。用挡板把球弹回去打掉所有砖块，难度逐关递增。",
    orientation: Orientation.LANDSCAPE,
    width: 480,
    height: 440,
    controls: { keyboard: ["A/D", "方向键", "空格发射"], mouse: true, touch: true },
    categories: ["arcade", "action"],
    tags: ["single-player", "keyboard", "mouse", "touch", "classic", "speed"],
  },
  {
    slug: "tetris",
    title: "俄罗斯方块",
    titleEn: "Tetris",
    description:
      "经典俄罗斯方块。左右移动、旋转方块拼满一行即可消除，连消获得额外分数。速度随关卡逐步加快。",
    orientation: Orientation.PORTRAIT,
    width: 360,
    height: 560,
    controls: { keyboard: ["←→ 移动", "↑ 旋转", "↓ 软降", "空格硬降"], touch: true },
    categories: ["puzzle", "arcade"],
    tags: ["single-player", "keyboard", "touch", "classic", "logic"],
  },
  {
    slug: "flappy",
    title: "飞翔小鸟",
    titleEn: "Flappy",
    description:
      "经典 Flappy 风格小游戏。点击或空格让小鸟扇翅膀飞，穿过每一对水管缝隙得分，碰到任何东西都会坠落。",
    orientation: Orientation.PORTRAIT,
    width: 360,
    height: 540,
    controls: { keyboard: ["空格", "↑"], mouse: true, touch: true },
    categories: ["casual", "arcade"],
    tags: ["single-player", "mouse", "touch", "speed"],
  },
  {
    slug: "gomoku",
    title: "五子棋",
    titleEn: "Gomoku",
    description:
      "黑白棋子在 15×15 棋盘上对弈，先在横/竖/斜任一方向连成五子者获胜。你执黑先手，AI 评估常见棋型应战。",
    orientation: Orientation.LANDSCAPE,
    width: 450,
    height: 520,
    controls: { mouse: true, touch: true },
    categories: ["strategy", "puzzle"],
    tags: ["single-player", "mouse", "touch", "ai-opponent", "logic", "classic"],
  },
];

async function main() {
  console.log("→ Seeding categories...");
  for (const c of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, icon: c.icon, sort: c.sort },
      create: c,
    });
  }

  console.log("→ Seeding tags...");
  for (const t of TAGS) {
    await prisma.tag.upsert({
      where: { slug: t.slug },
      update: { name: t.name },
      create: t,
    });
  }

  console.log("→ Seeding games...");
  for (const g of GAMES) {
    const categoryIds = await prisma.category.findMany({
      where: { slug: { in: g.categories } },
      select: { id: true },
    });
    const tagIds = await prisma.tag.findMany({
      where: { slug: { in: g.tags } },
      select: { id: true },
    });

    await prisma.game.upsert({
      where: { slug: g.slug },
      update: {
        title: g.title,
        titleEn: g.titleEn,
        description: g.description,
        cover: `/play/${g.slug}/cover.svg`,
        screenshots: [],
        entryUrl: `/play/${g.slug}/index.html`,
        width: g.width,
        height: g.height,
        orientation: g.orientation,
        controls: g.controls,
        status: GameStatus.PUBLISHED,
        publishedAt: new Date(),
        categories: {
          deleteMany: {},
          create: categoryIds.map((c) => ({ categoryId: c.id })),
        },
        tags: {
          deleteMany: {},
          create: tagIds.map((t) => ({ tagId: t.id })),
        },
      },
      create: {
        slug: g.slug,
        title: g.title,
        titleEn: g.titleEn,
        description: g.description,
        cover: `/play/${g.slug}/cover.svg`,
        screenshots: [],
        entryUrl: `/play/${g.slug}/index.html`,
        width: g.width,
        height: g.height,
        orientation: g.orientation,
        controls: g.controls,
        status: GameStatus.PUBLISHED,
        publishedAt: new Date(),
        categories: { create: categoryIds.map((c) => ({ categoryId: c.id })) },
        tags: { create: tagIds.map((t) => ({ tagId: t.id })) },
      },
    });
  }

  const counts = {
    categories: await prisma.category.count(),
    tags: await prisma.tag.count(),
    games: await prisma.game.count(),
  };
  console.log("✓ Seed done:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
