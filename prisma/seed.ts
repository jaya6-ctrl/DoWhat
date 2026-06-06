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
    categories: ["arcade", "casual"],
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
  {
    slug: "minesweeper",
    title: "扫雷",
    titleEn: "Minesweeper",
    description:
      "经典扫雷。点击揭开格子，数字表示周围地雷数量，右键或长按标记地雷。揭开所有非雷格子即获胜，支持初/中/高三个难度。",
    orientation: Orientation.LANDSCAPE,
    width: 400,
    height: 500,
    controls: { mouse: true, touch: true },
    categories: ["puzzle", "casual"],
    tags: ["single-player", "mouse", "touch", "logic", "classic"],
  },
  {
    slug: "whack-a-mole",
    title: "打地鼠",
    titleEn: "Whack-a-Mole",
    description:
      "30 秒内疯狂点击冒出头的地鼠得分！简单模式地鼠停留更久，困难模式更快更密集。考验你的手速和反应力。",
    orientation: Orientation.PORTRAIT,
    width: 360,
    height: 480,
    controls: { mouse: true, touch: true },
    categories: ["casual", "arcade"],
    tags: ["single-player", "mouse", "touch", "speed"],
  },
  {
    slug: "tower-stack",
    title: "堆叠塔",
    titleEn: "Tower Stack",
    description:
      "方块左右来回移动，点击落下堆叠。重叠越多方块越大，完美对齐可获额外加分。堆得越高越快，看你能叠多少层！",
    orientation: Orientation.PORTRAIT,
    width: 300,
    height: 500,
    controls: { mouse: true, touch: true },
    categories: ["arcade", "casual"],
    tags: ["single-player", "mouse", "touch", "speed"],
  },
  {
    slug: "match3",
    title: "消消乐",
    titleEn: "Match-3",
    description:
      "经典三消玩法。交换相邻宝石使三个或更多相同宝石连成一线即可消除，消除后宝石下落可触发连锁反应。30 步内尽量拿高分！",
    orientation: Orientation.PORTRAIT,
    width: 400,
    height: 520,
    controls: { mouse: true, touch: true },
    categories: ["puzzle", "casual"],
    tags: ["single-player", "mouse", "touch", "logic"],
  },
  {
    slug: "shooting-range",
    title: "射击定位练习",
    titleEn: "Shooting Range",
    description:
      "移动瞄准镜精准射击靶心！越接近中心分数越高，连续命中触发连击加成。5 个关卡难度递增，靶子越来越小越来越快，有限弹药考验你的每一枪。命中率过 50% 才能过关！",
    orientation: Orientation.LANDSCAPE,
    width: 800,
    height: 500,
    controls: { mouse: true, touch: true },
    categories: ["shooter", "action"],
    tags: ["single-player", "mouse", "touch", "speed"],
  },
  {
    slug: "space-shooter",
    title: "太空射击",
    titleEn: "Space Shooter",
    description:
      "抵御外星入侵，保卫银河系！驾驶战舰在星空中穿梭射击，消灭 5 种不同类型的敌人，每 5 波迎战巨型 BOSS。收集能量升级武器（三连→五连→导弹），获取护盾和炸弹。连续击杀触发连击倍率，挑战你的最高分！",
    orientation: Orientation.PORTRAIT,
    width: 400,
    height: 700,
    controls: { keyboard: ["WASD", "方向键移动", "空格射击", "E炸弹", "P暂停"], mouse: true, touch: true },
    categories: ["shooter", "action"],
    tags: ["single-player", "keyboard", "mouse", "touch", "speed"],
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
