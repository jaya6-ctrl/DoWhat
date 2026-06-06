#!/bin/bash
# 生产部署脚本 - 启动所有服务
#
# 用法:
#   bash docker/deploy.sh
#
# 前置条件:
#   1. 已配置 .env 文件
#   2. 已运行 bash docker/build.sh 构建镜像
#   3. 已修改 docker-compose.prod.yml 中的 image 字段
#
# 流程:
#   1. 加载 .env
#   2. 开启维护模式（如 nginx 已运行）
#   3. 启动所有服务
#   4. 关闭维护模式

set -euo pipefail

COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "[deploy] $ENV_FILE 不存在，请先 cp .env.prod.example .env 并改好密码" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

echo "==========================================="
echo "[deploy] 1/3 开启维护模式..."
echo "==========================================="
bash docker/maintenance.sh on || true  # 如果 nginx 未运行则跳过

echo "==========================================="
echo "[deploy] 2/3 启动全部服务..."
echo "==========================================="
docker compose -f "$COMPOSE_FILE" up -d

echo "==========================================="
echo "[deploy] 3/3 关闭维护模式..."
echo "==========================================="
sleep 5  # 等待 nginx 启动
bash docker/maintenance.sh off || true  # 如果 nginx 未就绪则跳过

echo ""
echo "[deploy] ✅ 部署完成。当前容器状态:"
docker compose -f "$COMPOSE_FILE" ps
