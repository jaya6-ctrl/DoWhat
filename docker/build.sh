#!/bin/bash
# 镜像构建脚本 - 构建 app 镜像并打版本标签
#
# 用法:
#   bash docker/build.sh
#
# 流程:
#   1. 加载 .env 环境变量
#   2. 启动 postgres（构建时需要连接数据库）
#   3. 等待 postgres 就绪
#   4. 自检数据库连接
#   5. 构建 app 镜像（含 prisma migrate + seed + next build）
#   6. 打版本标签
#   7. 输出镜像名称
#
# 输出:
#   镜像名称，如 dowhat-app:v20240606123456
#
# 使用:
#   1. 运行此脚本获取镜像名称
#   2. 修改 docker-compose.prod.yml 中的 image 字段
#   3. 运行 docker compose -f docker-compose.prod.yml up -d

set -euo pipefail

COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env"
IMAGE_NAME="dowhat-app"

# 加载环境变量
if [[ ! -f "$ENV_FILE" ]]; then
  echo "[build] $ENV_FILE 不存在，请先 cp .env.prod.example .env 并改好密码" >&2
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
echo "[build] 1/4 启动 postgres..."
echo "==========================================="
docker compose -f "$COMPOSE_FILE" up -d postgres

echo "[build] 等待 postgres healthcheck 通过..."
for i in {1..60}; do
  if docker compose -f "$COMPOSE_FILE" exec -T postgres \
       pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; then
    echo "[build] postgres OK"
    break
  fi
  if [[ $i -eq 60 ]]; then
    echo "[build] postgres 等待超时(60s)" >&2
    exit 1
  fi
  sleep 1
done

echo "==========================================="
echo "[build] 2/4 自检:用 --network host 模拟 build 容器,试连 localhost:5432..."
echo "==========================================="
if ! docker run --rm --network host postgres:16-alpine \
       pg_isready -h 127.0.0.1 -p 5432 -U "$POSTGRES_USER" >/dev/null 2>&1; then
  echo "[build] 自检失败:host 网络下连不到 127.0.0.1:5432" >&2
  echo "[build] 排查:" >&2
  echo "  ss -tlnp | grep 5432                              # 宿主机 5432 是否在监听" >&2
  echo "  docker ps | grep postgres                          # postgres 端口映射是否正确" >&2
  echo "  docker inspect dowhat-postgres | grep -i ports     # 端口绑定详情" >&2
  exit 1
fi
echo "[build] 自检通过"

echo "==========================================="
echo "[build] 3/4 构建 app 镜像(build 期会 migrate + seed + next build)..."
echo "==========================================="
# 使用 docker build 直接构建（因为 docker-compose.prod.yml 中没有 build 配置）
# build 容器用 network:host,通过宿主机 loopback 连 postgres
BUILD_DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}?schema=public"
docker build \
  --network host \
  --build-arg DATABASE_URL="$BUILD_DATABASE_URL" \
  -t "${IMAGE_NAME}:latest" \
  -f Dockerfile \
  .

echo "==========================================="
echo "[build] 4/4 打版本标签..."
echo "==========================================="
VERSION=$(date +%Y%m%d%H%M%S)
TAG="${IMAGE_NAME}:v${VERSION}"
docker tag "${IMAGE_NAME}:latest" "$TAG"

echo ""
echo "==========================================="
echo "[build] ✅ 构建完成！"
echo "==========================================="
echo ""
echo "镜像名称: $TAG"
echo ""
echo "下一步:"
echo "  1. 修改 docker-compose.prod.yml 中的 image 字段:"
echo "     image: $TAG"
echo ""
echo "  2. 启动服务:"
echo "     docker compose -f docker-compose.prod.yml up -d"
echo ""
