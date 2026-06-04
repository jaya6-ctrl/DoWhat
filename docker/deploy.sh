#!/usr/bin/env bash
# 生产部署脚本(必须在云服务器上用这个,不要直接 docker compose build)
#
# 用法:
#   bash docker/deploy.sh
#
# 流程:
#   1. 加载 .env
#   2. 先起 postgres,等它健康
#   3. 自检:确认宿主机 127.0.0.1:5432 真的能连上(否则 build 必定失败)
#   4. build app 镜像(build 容器通过 host.docker.internal 反连宿主机 postgres)
#      build 期间自动:prisma migrate deploy + next build(含 ISR 预渲染)
#   5. 起完整服务
set -euo pipefail

COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env"

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
echo "[deploy] 1/4 启动 postgres..."
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
echo "[deploy] 2/4 自检:验证宿主机 127.0.0.1:5432 是否真的可达..."
echo "==========================================="
# 用 postgres 容器本身的 pg_isready 通过宿主机 host-gateway 反连一次,确认端口映射真的工作
# (不依赖宿主机有没有装 psql / nc)
if ! docker run --rm \
       --add-host=host.docker.internal:host-gateway \
       postgres:16-alpine \
       pg_isready -h host.docker.internal -p 5432 -U "$POSTGRES_USER" >/dev/null 2>&1; then
  echo "[deploy] 自检失败:从容器内通过 host.docker.internal:5432 连不到 postgres" >&2
  echo "[deploy] 可能原因:" >&2
  echo "  - docker-compose.prod.yml 里 postgres 的 ports 没有正确暴露 127.0.0.1:5432:5432" >&2
  echo "  - 宿主机防火墙拦截了 5432" >&2
  echo "  - host-gateway 在该 Docker 版本上不支持(需 Docker 20.10+)" >&2
  exit 1
fi
echo "[deploy] 自检通过"

echo "==========================================="
echo "[deploy] 3/4 构建 app 镜像(build 期会 migrate + next build)..."
echo "==========================================="
export BUILD_DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@host.docker.internal:5432/${POSTGRES_DB}?schema=public"
docker compose -f "$COMPOSE_FILE" build app

echo "==========================================="
echo "[deploy] 4/4 启动全部服务..."
echo "==========================================="
docker compose -f "$COMPOSE_FILE" up -d

echo ""
echo "[deploy] 完成。当前容器状态:"
docker compose -f "$COMPOSE_FILE" ps
