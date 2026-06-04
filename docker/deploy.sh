#!/usr/bin/env bash
# 生产部署脚本(必须在云服务器上用这个,不要直接 docker compose build)
#
# 用法:
#   bash docker/deploy.sh
#
# 流程:
#   1. 加载 .env
#   2. 先起 postgres,等它健康(顺带创建 dowhat-net 网络)
#   3. 自检:确认从 dowhat-net 内部能通过服务名 postgres 连上 DB
#   4. build app 镜像(build 容器 join dowhat-net,直接用 postgres:5432 连)
#      build 期间自动:prisma migrate deploy + next build(含 ISR 预渲染)
#   5. 起完整服务
set -euo pipefail

COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env"
NETWORK_NAME="dowhat-net"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "[deploy] $ENV_FILE 不存在,请先 cp .env.prod.example .env 并改好密码" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

: "${POSTGRES_USER:?POSTGRES_USER 未设置}"
: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD 未设置}"
: "${POSTGRES_DB:?POSTGRES_DB 未设置}"

echo "==========================================="
echo "[deploy] 1/4 启动 postgres(同时创建 $NETWORK_NAME 网络)..."
echo "==========================================="
docker compose -f "$COMPOSE_FILE" up -d postgres

echo "[deploy] 等待 postgres healthcheck 通过..."
for i in {1..60}; do
  if docker compose -f "$COMPOSE_FILE" exec -T postgres \
       pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; then
    echo "[deploy] postgres OK"
    break
  fi
  if [[ $i -eq 60 ]]; then
    echo "[deploy] postgres 等待超时(60s)" >&2
    exit 1
  fi
  sleep 1
done

echo "==========================================="
echo "[deploy] 2/4 自检:从 $NETWORK_NAME 内部连 postgres:5432..."
echo "==========================================="
if ! docker run --rm --network "$NETWORK_NAME" postgres:16-alpine \
       pg_isready -h postgres -p 5432 -U "$POSTGRES_USER" >/dev/null 2>&1; then
  echo "[deploy] 自检失败:从 $NETWORK_NAME 网络里连不到 postgres:5432" >&2
  echo "[deploy] 排查:" >&2
  echo "  docker network ls | grep $NETWORK_NAME    # 网络是否存在" >&2
  echo "  docker network inspect $NETWORK_NAME      # postgres 是否在网络里" >&2
  echo "  docker logs dowhat-postgres                # postgres 自身是否正常" >&2
  exit 1
fi
echo "[deploy] 自检通过"

echo "==========================================="
echo "[deploy] 3/4 构建 app 镜像(build 期会 migrate + next build)..."
echo "==========================================="
# build 容器 join dowhat-net,直接用服务名 postgres 解析(和运行时一致)
export BUILD_DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=public"
docker compose -f "$COMPOSE_FILE" build app

echo "==========================================="
echo "[deploy] 4/4 启动全部服务..."
echo "==========================================="
docker compose -f "$COMPOSE_FILE" up -d

echo ""
echo "[deploy] 完成。当前容器状态:"
docker compose -f "$COMPOSE_FILE" ps
