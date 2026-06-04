#!/usr/bin/env bash
# 生产部署脚本(部署在云服务器上执行)
#
# 用法:
#   bash docker/deploy.sh
#
# 流程:
#   1. 加载 .env
#   2. 先起 postgres,等它健康
#   3. build app 镜像(build 容器走宿主机网络,通过 127.0.0.1:5432 连 postgres)
#      - build 期间会自动 prisma migrate deploy + next build
#   4. 起完整服务
set -euo pipefail

COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "[deploy] $ENV_FILE 不存在,请先拷贝 .env.prod.example 并改好" >&2
  exit 1
fi

# 把 .env 里的变量加载进当前 shell,后面用来拼 BUILD_DATABASE_URL
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

: "${POSTGRES_USER:?POSTGRES_USER 未设置}"
: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD 未设置}"
: "${POSTGRES_DB:?POSTGRES_DB 未设置}"

echo "[deploy] 1/3 启动 postgres..."
docker compose -f "$COMPOSE_FILE" up -d postgres

echo "[deploy] 等待 postgres 健康..."
for i in {1..60}; do
  if docker compose -f "$COMPOSE_FILE" exec -T postgres \
       pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; then
    echo "[deploy] postgres 已就绪"
    break
  fi
  if [[ $i -eq 60 ]]; then
    echo "[deploy] postgres 等待超时(60s)" >&2
    exit 1
  fi
  sleep 1
done

echo "[deploy] 2/3 构建 app 镜像(build 容器使用 host 网络连 postgres)..."
export BUILD_DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}?schema=public"
docker compose -f "$COMPOSE_FILE" build app

echo "[deploy] 3/3 启动全部服务..."
docker compose -f "$COMPOSE_FILE" up -d

echo "[deploy] 完成。当前容器状态:"
docker compose -f "$COMPOSE_FILE" ps
