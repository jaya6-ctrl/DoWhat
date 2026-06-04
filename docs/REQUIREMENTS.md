# DoWhat 游戏门户 · 功能需求文档

> 版本：v0.1（2026-06-03）
> 配套：`TECH_DESIGN.md`
> 阅读方式：按 **P0 → P1 → P2 → P3** 顺序执行；每个阶段独立交付、可上线/可演示。

---

## 0. 角色定义

| 角色 | 说明 |
| --- | --- |
| 游客 | 未登录用户，可浏览、试玩、搜索 |
| 用户 | 注册登录用户，可收藏、评分、评论、查看历史 |
| 版主（MOD） | 评论审核、举报处理 |
| 管理员（ADMIN） | 游戏 CRUD、分类管理、用户管理 |

---

## 阶段 P0 · MVP（首要目标：把站点跑起来，能玩）

**交付标准**：一台机器本地启动，能从首页找到游戏并玩起来；至少录入 20 款示例游戏；首页/分类/详情页 SEO 可被抓取。

### P0-1 项目基建

- [ ] 初始化 Next.js 15 + TS + Tailwind + shadcn/ui
- [ ] 接入 Prisma + Postgres + Redis（docker-compose）
- [ ] 配置 ESLint/Prettier/husky/lint-staged
- [ ] `.env.example` 与 README 启动指南
- [ ] 基础布局：顶部导航（Logo / 分类入口 / 搜索框 / 登录入口占位）、底部栏

### P0-2 游戏数据模型与种子数据

- [x] 完成 `Game / Category / Tag` 三张表 + 关联表迁移
- [x] `prisma/seed.ts` 灌入 5 款 MVP 示例游戏（自研：Snake / 2048 / Tic-Tac-Toe / Memory / Breakout）
- [x] 在 `public/play/<slug>/` 下放入实际游戏文件（路径与 `/games/*` 路由隔离）

> 范围调整说明：原计划"20 款"在 MVP 阶段不现实（抓取/授权成本高）。MVP 提供 5 款自研游戏覆盖动作/益智/休闲/街机/策略，后续游戏由 P2 后台手动录入。

### P0-3 首页

- 顶部 Banner（管理员配置，MVP 写死 3 张）
- "热门游戏" 横向滑动卡片（按 `playCount` 倒序，前 12）
- "最新上架" 网格（按 `publishedAt` 倒序，前 12）
- "分类入口" 8 个分类图标网格
- "全部分类" 折叠区块，每个分类展示前 6 款

**验收**：未登录直接访问 `/` 能渲染出上述区块，无水合错误，Lighthouse SEO ≥ 90。

### P0-4 分类与列表页

- 路由 `/games?category=action&tag=2d&sort=hot&page=2`
- 排序项：热门（playCount） / 最新（publishedAt） / 评分（ratingAvg）
- 左侧分类 + 标签筛选；右侧网格，每页 24
- 分页用 URL 参数，便于 SEO

### P0-5 游戏详情与试玩

- 路由 `/games/[slug]`
- 页面元素：标题 / 封面 / 简介 / 操作说明 / 截图 / 相同分类推荐 6 款
- "开始游戏" 按钮 → 进入沙箱 iframe（弹层全屏 + 可缩回）
- 横屏游戏在移动端提示"请横屏游玩"
- 进入时调用 `POST /api/plays`（匿名用 IP），关闭/离开时上报时长
- 评分平均分、收藏数、播放数展示（实时从 DB 读，详情页 ISR 5min）

**验收**：能完整玩完一款示例游戏，关闭后回到详情页，播放计数 +1。

### P0-6 搜索（基础版）

- 顶部搜索框 → `/search?q=xxx`
- Postgres `pg_trgm` 模糊匹配 `title / titleEn / tags.name`
- 结果页同列表页组件复用
- 无结果时展示热门推荐

### P0-7 榜单页（雏形）

- 路由 `/rank`
- Tab：今日热门 / 本周热门 / 总榜
- 数据源：Redis ZSET（日榜/周榜），总榜走 `Game.playCount`
- 每行：排名 / 封面 / 标题 / 分类 / 播放数

### P0-8 移动端适配

- 所有 P0 页面在 375px 宽下可用
- 详情页移动端默认竖向布局，"开始游戏" 触发全屏

---

## 阶段 P1 · 用户与社区

**交付标准**：用户可注册登录；能收藏、评分、评论；游戏热度真实反映用户行为。

### P1-1 鉴权系统

- 邮箱密码注册（含验证邮件，开发环境用 Mailpit）
- 登录 / 退出 / 修改密码 / 找回密码
- OAuth：GitHub、Google（可关）
- 用户中心 `/u/<name>`：头像、昵称、注册时间
- `/settings`：改昵称、改头像（上传到本地 `/public/avatars/`，预留 OSS）

### P1-2 收藏

- 详情页星标按钮，未登录引导登录
- `/u/<name>/favorites` 展示个人收藏
- 收藏数实时更新到 `Game.favoriteCount`

### P1-3 评分

- 详情页 5 星评分（一人一票，可修改）
- 重算 `ratingAvg` / `ratingCount`（事务）
- 评分变化广播：`revalidateTag('game:<id>')`

### P1-4 评论

- 一级评论 + 一层回复（不做无限树）
- 排序：最新 / 最热（按点赞）
- 点赞匿名按 IP 去重，登录按用户去重
- 长度 1~500 字，前后空白裁剪
- 限流：登录用户 5 条/分钟
- 关键词过滤兜底（敏感词表内置，黑名单可在 admin 增删，P2 接管）

### P1-5 游戏历史

- 登录用户访问详情/试玩 → 写 `Play.userId`
- `/u/<name>/history` 倒序展示最近 50 条

### P1-6 举报

- 评论与游戏都可举报，原因下拉 + 备注
- MOD 角色看到 `/admin/reports` 列表（P2 后台的一部分前置）

### P1-7 工程化补强

- Sentry 接入（前端 + 服务端）
- 关键 E2E：注册 → 登录 → 收藏 → 评论 → 退出
- 单元测试覆盖 `lib/services/*` 主要分支

---

## 阶段 P2 · 运营后台

**交付标准**：管理员能在不接触代码的前提下完成游戏上下架、分类编辑、用户与评论管理。

### P2-1 后台框架

- 路由 `/admin`，仅 `ADMIN / MOD` 可进
- 侧边导航 + 顶部用户菜单
- 全局操作日志（谁、何时、对什么对象做了什么）

### P2-2 游戏管理

- 列表：搜索、状态筛选（草稿/审核/发布/下架）、批量操作
- 编辑器：基本信息、封面/截图上传、分类标签、操作说明、iframe 入口
- "本地导入"：上传 zip → 解压到 `public/play/<slug>/` → 自动建草稿
- 一键发布 / 下架 / 撤回审核

### P2-3 分类与标签管理

- 分类 CRUD + 排序拖拽 + 图标上传
- 标签合并工具（处理重复标签）

### P2-4 用户管理

- 列表：搜索、角色筛选
- 操作：封禁（带原因和期限）、解封、改角色

### P2-5 评论与举报

- 评论列表全局视角，可隐藏 / 删除
- 举报队列：处理 / 驳回 / 升级
- 敏感词词典管理

### P2-6 首页 Banner / 推荐位

- Banner CRUD（图、链接、起止时间、排序）
- "首页推荐位" 手动指定 N 款游戏（覆盖热度排序）

### P2-7 数据看板（简版）

- 今日 / 7 日 / 30 日：UV、PV、play 次数、注册数、Top 10 游戏
- 数据来源：DB 聚合 + Redis 计数；MVP 不接 BI

---

## 阶段 P3 · 性能与扩展

**触发条件**：日 PV > 10w 或 search/详情接口 P95 > 300ms。

### P3-1 搜索升级

- 引入 MeiliSearch，索引 `Game`
- 支持拼音 / 同义词 / 纠错建议
- 离线增量同步 worker

### P3-2 静态资源 CDN

- 游戏包、封面、截图、头像统一迁移到阿里云 OSS / 七牛 / Cloudflare R2
- `NEXT_PUBLIC_ASSET_BASE` 切换
- 后台上传走预签名 URL，不经过应用服务器

### P3-3 接口层拆分

- `lib/services/*` 抽到 `packages/services`，被独立 NestJS 服务复用
- 把"详情读"、"榜单读"、"play 上报" 三条最热路径迁出
- Next.js 端通过 HTTP/RPC 调用

### P3-4 数据库优化

- 读写分离（PG 流复制 + Prisma replica adapter）
- 关键表分区（`Play` 按月分区）
- 慢查询打点 + 索引复盘

### P3-5 缓存增强

- 详情页改边缘渲染 + tag-based revalidate
- 榜单数据由 cron 预热到 Redis，避免冷启动

---

## 阶段 P4 · 多端与商业化（远期，仅占位）

- H5 独立站（移动优化版） / 微信小程序
- 广告位接入（Google AdSense / 联盟广告）
- 会员去广告
- 游戏发行方上传通道（自助提交 → 审核）
- 国际化（英文站、繁中站）

---

## 附录 A · 接口列表（P0+P1 范围）

| Method | Path | 说明 | 鉴权 |
| --- | --- | --- | --- |
| GET | `/api/games` | 列表（query: category/tag/sort/page） | 否 |
| GET | `/api/games/:slug` | 详情 | 否 |
| GET | `/api/search?q=` | 搜索 | 否 |
| GET | `/api/rank?type=day\|week\|all` | 榜单 | 否 |
| POST | `/api/plays` | 上报开始 | 否（带 IP 限频） |
| PATCH | `/api/plays/:id` | 上报结束/时长 | 否 |
| POST | `/api/favorites` | 收藏 | 是 |
| DELETE | `/api/favorites/:gameId` | 取消收藏 | 是 |
| POST | `/api/ratings` | 评分 | 是 |
| GET | `/api/comments?gameId=` | 评论列表 | 否 |
| POST | `/api/comments` | 发评论 | 是 |
| POST | `/api/comments/:id/like` | 点赞评论 | 否（带去重） |
| POST | `/api/reports` | 举报 | 是 |

后台接口统一前缀 `/api/admin/*`，鉴权要求 `MOD/ADMIN`。

---

## 附录 B · 验收 Checklist 模板

每个阶段结束前过一遍：

- [ ] 所有页面在 1440 / 375 两个分辨率下无样式破溃
- [ ] Lighthouse Performance ≥ 80，SEO ≥ 90
- [ ] 关键路径 E2E 全绿
- [ ] `.env.example` 与 README 已同步
- [ ] 数据库迁移在干净环境可重放（`pnpm prisma migrate reset`）
- [ ] 没有未处理的 TODO/FIXME 高优先级项
