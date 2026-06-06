# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable && corepack prepare pnpm@11.5.1 --activate
WORKDIR /app

# --- deps ---
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile

# --- builder ---
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# build 期需要连真实数据库:
#   1) prisma migrate deploy 推 schema
#   2) Next.js 在 generateStaticParams / ISR 预渲染时会查 DB
# DATABASE_URL 通过 docker-compose build args 传入(指向宿主机 loopback 上的 postgres)
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
RUN pnpm exec prisma generate
RUN pnpm exec prisma migrate deploy
# 写入初始数据(分类/标签/游戏)。seed 脚本使用 upsert,幂等,可重复执行。
RUN pnpm db:seed
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# --- runner ---
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# 说明:
# - migrate 已在 builder 阶段执行(Dockerfile 里的 prisma migrate deploy),
#   所以 runner 不再需要 prisma CLI 和 migrations 文件
# - 运行时所需的 @prisma/client 已被 Next.js standalone tracer 自动复制到
#   /app/.next/standalone/node_modules/ 下,不用单独 COPY
# - 注意:pnpm 的 node_modules 是嵌套布局(.pnpm/<hash>/...),
#   无法像 npm 那样直接 COPY /app/node_modules/.prisma 等扁平路径

COPY --chown=nextjs:nodejs docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "server.js"]
