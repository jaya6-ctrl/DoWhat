# DoWhat · H5 小游戏聚合门户

参考 4399 模式的 H5 小游戏聚合站。技术方案与功能需求见 [`docs/TECH_DESIGN.md`](./docs/TECH_DESIGN.md) 与 [`docs/REQUIREMENTS.md`](./docs/REQUIREMENTS.md)。

## 当前阶段

**P0 八条主线已铺完，P1-1 鉴权已完成。** 后续按 P1-2 收藏起开干。

## 技术栈

Next.js 16（App Router）· React 19 · TypeScript · Tailwind v4 · Prisma 6 · PostgreSQL 16 · Redis 7 · NextAuth（P1）· Zod · TanStack Query · Zustand

## 本地启动

### 1. 准备工具

- Node.js ≥ 20（已用 v24 验证）
- pnpm ≥ 10
- Docker Desktop（用于 Postgres / Redis）

### 2. 起依赖容器

```bash
docker compose up -d
```

会拉起三个容器：

| 服务 | 端口 | 凭据 |
| --- | --- | --- |
| `dowhat-postgres` | 5432 | `dowhat / dowhat`，库名 `dowhat` |
| `dowhat-redis` | 6379 | 无密码 |
| `dowhat-mailpit` | 1025 (SMTP) / 8025 (Web UI) | 无 |

Mailpit 是 P1-1 鉴权用的本地 SMTP，注册 / 重置密码邮件会落进它的收件箱，浏览器开 <http://localhost:8025> 查收。

数据卷 `dowhat_pg_data` / `dowhat_redis_data` 会自动创建。

### 3. 安装依赖与初始化

```bash
pnpm install
cp .env.example .env       # Windows: copy .env.example .env
pnpm db:generate           # 生成 Prisma client
pnpm db:migrate            # 首次会问迁移名，填 init 即可
pnpm db:seed               # P0-2 填入示例游戏（目前是 no-op）
```

### 4. 启动开发服务器

```bash
pnpm dev
```

访问 <http://localhost:3000>。

## 常用脚本

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 启动 Next.js dev（Turbopack） |
| `pnpm build` | 生产构建 |
| `pnpm start` | 启动生产服务 |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm format` | Prettier 全量格式化 |
| `pnpm db:generate` | 生成 Prisma client |
| `pnpm db:migrate` | 应用并创建迁移（开发） |
| `pnpm db:deploy` | 应用已有迁移（生产用，不创建迁移） |
| `pnpm db:reset` | 清库 + 重跑迁移 + seed |
| `pnpm db:seed` | 仅跑 seed |
| `pnpm db:studio` | 打开 Prisma Studio |

## 目录结构

```
DoWhat/
├── app/                    # Next.js App Router 页面
│   ├── layout.tsx          # 全站布局（含 Header / Footer）
│   ├── page.tsx            # 首页
│   └── globals.css
├── components/
│   ├── layout/             # SiteHeader / SiteFooter
│   ├── ui/                 # shadcn 通用组件（P0-2 接入）
│   └── game/               # GameCard / GamePlayer 等（P0-2）
├── lib/
│   ├── db.ts               # Prisma client 单例
│   ├── redis.ts            # ioredis 单例
│   ├── categories.ts       # MVP 写死分类，后续切 DB
│   ├── services/           # 业务逻辑（拆后端的种子）
│   ├── validators/         # Zod schemas
│   └── utils/
├── prisma/
│   ├── schema.prisma       # 数据模型
│   └── seed.ts
├── public/
│   └── play/               # 本地游戏静态资源（与 /games/* 路由隔离，P3 切 OSS）
├── tests/{unit,e2e}/
├── docs/                   # 技术文档 + 需求文档
├── docker-compose.yml
├── .env.example
└── pnpm-workspace.yaml     # pnpm 11 的 allowBuilds 配置
```

## 已知坑（埋点提醒）

1. **package name 不能含大写**：项目目录是 `DoWhat`，但 `package.json` 里 name 用的是 `dowhat`，npm 命名规范要求。
2. **pnpm 11 `allowBuilds`**：`pnpm-workspace.yaml` 里显式批准 `prisma / @prisma/engines / esbuild / sharp` 的 postinstall 脚本，否则装完跑不起来。
3. **Prisma 版本**：用的是 Prisma 6.x，**不要**升到 7.x —— 7 移除了 schema 里的 `datasource.url`，需要改造 `prisma.config.ts` + 驱动适配器，MVP 阶段不值得折腾。
4. **TypeScript**：用 6.x，5.0.2 会被 Next.js 16 警告。

## 路线图

- ✅ P0-1：项目骨架
- ✅ P0-2 ~ P0-8：数据模型 / 首页 / 分类 / 详情 / 试玩 / 搜索 / 榜单（雏形）/ 移动端
- ✅ P1-1：邮箱密码鉴权（自管 cookie session，Mailpit 发邮件，不含 OAuth）
- ⏳ P1-2 ~ P1-7：收藏、评分、评论、历史、举报、Sentry/测试
- ⏳ P2：运营后台
- ⏳ P3：性能优化、CDN、搜索升级

详见 [`docs/REQUIREMENTS.md`](./docs/REQUIREMENTS.md)。

## 部署（云 VPS + HTTP）

首发场景：把项目搬到一台云 VPS 上，先用 `http://<server_ip>:3000` 调试，不上 HTTPS / 域名。整套用 Docker Compose 拉起 app + postgres + redis + mailpit。

### 1. 准备产物文件（已随仓库提交）

| 文件 | 作用 |
| --- | --- |
| `Dockerfile` | 多阶段构建（deps → builder → runner），基于 `node:20-alpine` |
| `docker/entrypoint.sh` | 容器启动时跑 `prisma migrate deploy`，再 `exec node server.js` |
| `.dockerignore` | 排除 `node_modules` / `.next` / `.env` 等 |
| `docker-compose.prod.yml` | 生产 compose，新增 `app` 服务 + `dowhat_avatars` volume |
| `.env.prod.example` | 生产 env 模板（用 Docker 内网主机名 `postgres` / `redis` / `mailpit`） |

### 2. 服务器侧操作

> 假设 Ubuntu 22.04+，已装好 `docker` 和 `docker compose` plugin。

```sh
# 2.1 传代码（git clone 或 scp tar 包）
git clone <your-repo> dowhat && cd dowhat

# 2.2 写 .env（改 APP_URL、POSTGRES_PASSWORD、DATABASE_URL 里的密码）
cp .env.prod.example .env
vim .env

# 2.3 拉基础镜像（避免 build 时网络超时）
docker pull node:20-alpine
docker pull postgres:16-alpine
docker pull redis:7-alpine
docker pull axllent/mailpit:latest

# 2.4 构建并启动
docker compose -f docker-compose.prod.yml up -d --build

# 2.5 看启动日志
docker compose -f docker-compose.prod.yml logs -f app

# 2.6 开放防火墙 3000 端口（云厂商安全组 + 系统 ufw）
ufw allow 3000/tcp

# 2.7（可选）灌示例数据
docker compose -f docker-compose.prod.yml exec app \
  node ./node_modules/prisma/build/index.js db seed
```

浏览器开 `http://<server_ip>:3000`，注册 → 邮件落在 mailpit。

### 3. 查 mailpit 收件箱

mailpit Web UI（8025）只绑了服务器的 `127.0.0.1`，外网访问不到。本机 SSH 端口转发：

```sh
ssh -L 8025:127.0.0.1:8025 user@<server_ip>
```

保持 SSH 连接，本机浏览器开 <http://localhost:8025>，能看到验证邮件。

### 4. 关键约定 / 注意

- **COOKIE_SECURE=false**：走 HTTP 必须设；后续上 HTTPS 改 true 或删掉（自动按 NODE_ENV 推断）。
- **头像持久化**：`/app/public/avatars` 挂在 `dowhat_avatars` named volume 上，重建容器不丢。
- **postgres / redis 不暴露宿主端口**：app 走 Docker 内网，避免被全网扫描爆破。要本机连库调试时临时改 compose 加 ports。
- **数据库密码改两处**：`POSTGRES_PASSWORD` 和 `DATABASE_URL` 里的密码必须一致。

### 5. 还没做的（留给后续）

- HTTPS / 域名：等域名上来再接 Caddy / Nginx + Let's Encrypt
- CI/CD：先手动 `docker compose up`，跑通了再上 GitHub Actions
- 数据库备份：生产化前必须做
- 真实 SMTP：拿到 QQ / 阿里云授权码后直接改 `.env` 五个值（`SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `MAIL_FROM`），无需重构
