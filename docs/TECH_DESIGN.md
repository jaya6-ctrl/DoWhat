# DoWhat 游戏门户 · 技术设计文档

> 版本：v0.1（2026-06-03）
> 定位：参考 4399 的 H5 小游戏聚合门户站。本文聚焦**技术架构**与**演进路线**，功能需求详见 `REQUIREMENTS.md`。

---

## 1. 设计目标与约束

| 维度 | 目标 |
| --- | --- |
| 首屏 SEO | 游戏列表、详情、分类页必须服务端渲染，可被搜索引擎抓取 |
| 启动门槛 | MVP 阶段 1 人本地一条命令起服务（`pnpm dev` + `docker compose up`） |
| 演进性 | Next.js 全栈起步，热点接口可平滑拆出独立后端，不重写 |
| 资源承载 | 游戏静态资源（HTML/JS/资源包）走 `/public/play/`（与 `/games/*` 路由隔离），预留切 OSS+CDN 的开关 |
| 安全 | 第三方游戏一律 iframe 沙箱隔离，前台无任何特权接口直接暴露 |

非目标（明确不做）：

- 不做实时多人对战（PvP/PvE 联机），只做单机 H5 游戏。
- MVP 阶段不做 App / 小程序端，只做 Web。
- 不自研游戏引擎，只做承载与运营。

---

## 2. 技术栈总览

| 层 | 选型 | 备注 |
| --- | --- | --- |
| 前端框架 | Next.js 15（App Router）+ React 19 + TypeScript | RSC + Server Actions |
| 样式 / UI | Tailwind CSS + shadcn/ui + lucide-react | 主题色易替换 |
| 客户端状态 | TanStack Query + Zustand | Query 管远程数据，Zustand 管 UI/会话态 |
| 后端（前期） | Next.js Route Handlers + Server Actions | 与前端同仓 |
| ORM | Prisma | 类型安全 + 迁移工具 |
| 数据库 | PostgreSQL 16 | 启用 `pg_trgm` / `unaccent` 做模糊检索 |
| 缓存 / 计数 | Redis 7 | 榜单 ZSET、热度计数、限流、会话 |
| 鉴权 | NextAuth.js v5（Auth.js） | 邮箱 + OAuth（Google/GitHub，国内后期接微信） |
| 校验 | Zod | 接口入参 + 表单复用 |
| 日志 | Pino | JSON 结构化，便于后期接入 ELK |
| 错误监控 | Sentry（P1 接入） | MVP 先用 console + Pino |
| 测试 | Vitest（单测） + Playwright（E2E） | 关键路径覆盖 |
| 包管理 / 构建 | pnpm + Turborepo | 单包起步，预留 `packages/*` |
| 代码规范 | ESLint + Prettier + lint-staged + husky | 提交前自动修复 |
| 容器 | Docker Compose（本地：Postgres + Redis） | 生产部署后期再补 |

### 2.1 为什么这样选

- **Next.js 全栈 vs 拆后端**：MVP 阶段功能耦合度低，全栈一仓最快；当 QPS 上去或要给 App/小程序复用时，把 `app/api/*` 抽成独立 NestJS 服务即可，业务逻辑写在 `lib/services/` 里就是为了这一步。
- **PostgreSQL vs MySQL**：游戏标签/元数据用 JSONB 存灵活，`pg_trgm` 直接覆盖 MVP 阶段的模糊搜索，省一个 ES 依赖。
- **Prisma vs Drizzle**：Prisma 的 Studio + 迁移体验对单人开发极友好；性能瓶颈出现前不换。
- **iframe vs Web Component 加载游戏**：第三方游戏代码可信度未知，iframe `sandbox` 是唯一现实的隔离方案。

---

## 3. 系统架构

### 3.1 部署拓扑（MVP）

```
┌─────────────┐       ┌────────────────────────┐
│  浏览器     │ ────▶│  Next.js (Node Runtime) │
└─────────────┘       │  - RSC 页面渲染         │
                      │  - Route Handlers / SA  │
                      └──────────┬──────────────┘
                                 │
                  ┌──────────────┼──────────────┐
                  ▼              ▼              ▼
            ┌─────────┐   ┌──────────┐   ┌──────────────┐
            │ Postgres│   │  Redis   │   │ /public/play │
            └─────────┘   └──────────┘   │  (静态游戏)  │
                                          └──────────────┘
```

### 3.2 后期演进拓扑（P2+）

```
浏览器 ─▶ CDN ─▶ Next.js (边缘渲染)
                   │
                   ├─▶ Game API (NestJS, 热点读)
                   ├─▶ User API (NestJS, 鉴权/订单)
                   └─▶ Search (MeiliSearch)
                          │
                          ▼
                    Postgres / Redis
                    OSS（游戏包 + 封面）
```

抽离时机判断：单接口 P95 > 300ms 持续一周，或日 PV 超过 50w。

---

## 4. 目录结构（约定）

```
DoWhat/
├── app/                          # Next.js App Router
│   ├── (site)/                   # 前台布局组
│   │   ├── page.tsx              # 首页
│   │   ├── games/
│   │   │   ├── page.tsx          # 列表 / 分类
│   │   │   └── [slug]/page.tsx   # 详情 + 试玩
│   │   ├── rank/page.tsx         # 榜单
│   │   ├── search/page.tsx
│   │   └── u/[name]/page.tsx     # 个人主页
│   ├── (auth)/                   # 登录注册
│   ├── admin/                    # 后台（P1）
│   └── api/                      # Route Handlers
│       ├── games/
│       ├── plays/                # 上报开始/结束
│       ├── favorites/
│       └── comments/
├── components/
│   ├── ui/                       # shadcn 生成
│   ├── game/                     # GameCard / GamePlayer / GameGrid
│   └── layout/
├── lib/
│   ├── db.ts                     # Prisma client 单例
│   ├── redis.ts
│   ├── auth.ts                   # NextAuth 配置
│   ├── services/                 # 业务逻辑（拆服务的种子）
│   │   ├── game.ts
│   │   ├── ranking.ts
│   │   └── user.ts
│   ├── validators/               # Zod schemas
│   └── utils/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   └── play/                     # 本地游戏静态资源（与 /games/* 路由隔离）
│       └── <game-slug>/
│           ├── index.html
│           └── cover.svg
├── tests/
│   ├── unit/
│   └── e2e/
├── docs/
│   ├── TECH_DESIGN.md            # 本文件
│   └── REQUIREMENTS.md
├── docker-compose.yml            # postgres + redis
├── .env.example
└── package.json
```

**关键约定**

- 所有业务逻辑写在 `lib/services/*`，Route Handler 只做参数校验 + 调用 service + 序列化。拆后端时直接搬这层。
- 数据库访问只允许通过 service，禁止页面/组件直接 import prisma client（lint 规则约束）。
- 任何对外字段必须经 Zod schema 序列化，不直接吐 Prisma model。

---

## 5. 数据模型（Prisma schema 草案）

```prisma
model Game {
  id           String    @id @default(cuid())
  slug         String    @unique
  title        String
  titleEn      String?
  description  String
  cover        String           // 封面 URL
  screenshots  String[]
  entryUrl     String           // iframe src，相对 /play/xxx/index.html
  width        Int       @default(800)
  height       Int       @default(600)
  orientation  Orientation @default(LANDSCAPE)  // 横屏/竖屏
  controls     Json             // { keyboard: ['WASD'], mouse: true, touch: true }
  status       GameStatus @default(DRAFT)
  publishedAt  DateTime?
  categories   CategoryOnGame[]
  tags         TagOnGame[]
  plays        Play[]
  favorites    Favorite[]
  comments     Comment[]
  ratings      Rating[]
  // 冗余计数字段（避免每次 count），由 service 维护
  playCount    Int       @default(0)
  favoriteCount Int      @default(0)
  ratingAvg    Float     @default(0)
  ratingCount  Int       @default(0)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([status, publishedAt])
  @@index([playCount])
}

enum Orientation { LANDSCAPE PORTRAIT }
enum GameStatus  { DRAFT REVIEW PUBLISHED OFFLINE }

model Category {
  id        String @id @default(cuid())
  slug      String @unique          // action / puzzle / casual ...
  name      String
  icon      String?
  sort      Int    @default(0)
  games     CategoryOnGame[]
}

model CategoryOnGame {
  game       Game     @relation(fields: [gameId], references: [id], onDelete: Cascade)
  gameId     String
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  categoryId String
  @@id([gameId, categoryId])
}

model Tag {
  id    String @id @default(cuid())
  slug  String @unique
  name  String
  games TagOnGame[]
}

model TagOnGame {
  game   Game @relation(fields: [gameId], references: [id], onDelete: Cascade)
  gameId String
  tag    Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)
  tagId  String
  @@id([gameId, tagId])
}

model User {
  id            String   @id @default(cuid())
  email         String?  @unique
  name          String   @unique
  avatar        String?
  passwordHash  String?            // 邮箱注册时存在
  role          Role     @default(USER)
  createdAt     DateTime @default(now())

  accounts      Account[]          // NextAuth
  sessions      Session[]
  plays         Play[]
  favorites     Favorite[]
  comments      Comment[]
  ratings       Rating[]
}

enum Role { USER MOD ADMIN }

model Play {
  id        String   @id @default(cuid())
  game      Game     @relation(fields: [gameId], references: [id])
  gameId    String
  user      User?    @relation(fields: [userId], references: [id])
  userId    String?
  ip        String?
  duration  Int?              // 秒，结束时上报
  startedAt DateTime @default(now())
  endedAt   DateTime?

  @@index([gameId, startedAt])
  @@index([userId, startedAt])
}

model Favorite {
  user    User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId  String
  game    Game   @relation(fields: [gameId], references: [id], onDelete: Cascade)
  gameId  String
  createdAt DateTime @default(now())
  @@id([userId, gameId])
}

model Comment {
  id        String   @id @default(cuid())
  game      Game     @relation(fields: [gameId], references: [id], onDelete: Cascade)
  gameId    String
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  parentId  String?
  content   String
  likes     Int      @default(0)
  status    CommentStatus @default(VISIBLE)
  createdAt DateTime @default(now())

  @@index([gameId, createdAt])
}

enum CommentStatus { VISIBLE HIDDEN DELETED }

model Rating {
  user   User @relation(fields: [userId], references: [id])
  userId String
  game   Game @relation(fields: [gameId], references: [id])
  gameId String
  score  Int          // 1-5
  createdAt DateTime @default(now())
  @@id([userId, gameId])
}

// NextAuth 标配三张表（Account/Session/VerificationToken）省略
```

**索引与冗余字段的取舍**

- `playCount` / `favoriteCount` / `ratingAvg` 全部冗余在 `Game` 表，写入时由 service 增减；榜单查询直接 `ORDER BY` 即可，不做实时 `COUNT(*)`。
- 真正的热度榜单（小时榜/日榜）走 Redis ZSET，每次 `play` 上报时 `ZINCRBY`，Postgres 只保留持久化数据。

---

## 6. 关键技术决策

### 6.1 游戏沙箱

```html
<iframe
  src="/play/<slug>/index.html"
  sandbox="allow-scripts allow-same-origin allow-pointer-lock"
  allow="autoplay; fullscreen; gamepad"
  referrerpolicy="no-referrer"
  loading="lazy"
/>
```

- 禁用 `allow-top-navigation`、`allow-popups`，防止劫持。
- 游戏目录禁止包含 `.html` 之外的入口文件被直接访问统计，统计走父页面 postMessage 上报。
- 父子页面用 `postMessage` 约定一套协议：`{type: 'game_start' | 'game_end' | 'score', payload}`，service 接到才入库。

### 6.2 榜单与热度

- 实时榜：Redis ZSET，key 形如 `rank:play:day:20260603`，过期 8 天。
- 离线榜：每日凌晨 cron 把 Redis 数据汇总写回 Postgres `RankSnapshot`（P1 加表）。
- 防刷：单用户/单 IP 对同一游戏每小时只计 1 次有效 play。

### 6.3 搜索

- MVP：Postgres `pg_trgm`，`title` + `titleEn` + `description` 拼接到 `tsvector` 列上 GIN 索引。
- 演进信号：搜索 P95 > 200ms 或需要拼音/纠错时，引入 MeiliSearch（首选，部署比 ES 轻）。

### 6.4 鉴权与会话

- NextAuth v5，session 策略走 `database`（保留撤销能力），表落在 Postgres。
- 评论、收藏、评分等接口统一用 `auth()` 守卫；Server Action 内做角色判断。
- 限流：Redis 滑窗，匿名按 IP，登录用户按 userId；评论/注册等接口默认 5 req/min。

### 6.5 缓存策略

| 内容 | 方案 | TTL |
| --- | --- | --- |
| 游戏详情页 | Next.js `revalidate` + tag-based revalidation | 5 min，发布/编辑时 `revalidateTag('game:<id>')` |
| 首页 / 分类页 | ISR | 1 min |
| 榜单接口 | Redis 缓存 + SWR | 30 s |
| 用户私有数据 | 不缓存 | - |

### 6.6 国际化预留

- MVP 只做中文，但所有文案走 `lib/i18n/zh.ts` 字典，便于后续 `next-intl` 接入。
- 数据库 `titleEn` 字段已经预留。

---

## 7. 环境与配置

`.env.example`：

```bash
DATABASE_URL=postgresql://dowhat:dowhat@localhost:5432/dowhat
REDIS_URL=redis://localhost:6379
NEXTAUTH_SECRET=change-me
NEXTAUTH_URL=http://localhost:3000
# OAuth（可选）
GITHUB_ID=
GITHUB_SECRET=
GOOGLE_ID=
GOOGLE_SECRET=
# 资源 CDN（P2 切换）
NEXT_PUBLIC_ASSET_BASE=
```

`docker-compose.yml` 只起 `postgres` 和 `redis`，Node 应用本地 `pnpm dev` 启动，避免热更绕一层。

---

## 8. 工程化与质量门禁

- 提交前：`lint-staged` 跑 ESLint + Prettier + `tsc --noEmit`（增量）。
- CI（GitHub Actions）：lint → typecheck → unit test → build；E2E 跑关键 3 条用例（首页可达、详情可进、登录可成功）。
- 数据库迁移：`prisma migrate dev` 本地用，CI 跑 `prisma migrate deploy`；禁止手改 SQL。
- 提交规范：Conventional Commits，`feat/fix/chore/...`。

---

## 9. 演进路线（与 REQUIREMENTS 阶段对齐）

| 阶段 | 主要技术动作 |
| --- | --- |
| P0 MVP | Next.js 全栈、本地资源、Postgres 全文检索、Redis 仅做热度 ZSET |
| P1 用户与社区 | 接 NextAuth、评论/收藏/评分、限流、Sentry、E2E 关键路径 |
| P2 运营后台 | `/admin` 子应用、游戏 CRUD、审核流、批量导入、操作日志 |
| P3 性能与扩展 | MeiliSearch、OSS+CDN、热点 API 拆 NestJS、读副本 |
| P4 多端 | 共享 `lib/services` 抽到独立后端 → H5/小程序复用 |

---

## 10. 风险与未决项

| 项 | 风险 | 缓解 |
| --- | --- | --- |
| 游戏版权 | 抓取来源不明确 | 后台必须填来源/授权字段，未授权一律 DRAFT |
| iframe 安全 | 第三方游戏可能尝试父页面通信 | postMessage 来源白名单 + sandbox 严格化 |
| 国内备案 | 上线需要 ICP/网安备案 | MVP 本地起，备案与 OSS 选型同步推进 |
| 数据合规 | 用户评论 UGC | P1 必须有举报 + 关键词过滤兜底 |
