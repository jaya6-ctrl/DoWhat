#!/bin/bash
# 维护模式控制脚本
#
# 用法:
#   bash docker/maintenance.sh on   # 开启维护模式
#   bash docker/maintenance.sh off  # 关闭维护模式
#   bash docker/maintenance.sh status # 查看维护状态
#
# 原理:
#   在 Nginx 容器内创建/删除 /etc/nginx/maintenance.flag 文件
#   Nginx 检测到该文件时返回 503，显示维护页面

set -euo pipefail

CONTAINER="dowhat-nginx"
# Windows Git Bash 会把 /etc/nginx 转换成 C:/Program Files/Git/etc/nginx
# 使用 //etc/nginx 来避免这个问题
FLAG_FILE="//etc/nginx/maintenance.flag"

# 自动检测使用哪个 compose 文件
if docker compose -f docker-compose.yml ps --format '{{.Names}}' 2>/dev/null | grep -q "^${CONTAINER}$"; then
    COMPOSE_FILE="docker-compose.yml"
elif docker compose -f docker-compose.prod.yml ps --format '{{.Names}}' 2>/dev/null | grep -q "^${CONTAINER}$"; then
    COMPOSE_FILE="docker-compose.prod.yml"
else
    COMPOSE_FILE="docker-compose.prod.yml"
fi

# 检查容器是否运行
check_container() {
    if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
        echo "[maintenance] 错误: Nginx 容器未运行" >&2
        echo "[maintenance] 请先运行: docker compose -f $COMPOSE_FILE up -d nginx" >&2
        exit 1
    fi
}

# 开启维护模式
enable_maintenance() {
    check_container
    echo "[maintenance] 开启维护模式..."
    docker exec "$CONTAINER" touch "$FLAG_FILE"
    docker exec "$CONTAINER" nginx -s reload
    echo "[maintenance] ✅ 维护模式已开启"
    echo "[maintenance] 访问网站将显示维护页面"
}

# 关闭维护模式
disable_maintenance() {
    check_container
    echo "[maintenance] 关闭维护模式..."
    docker exec "$CONTAINER" rm -f "$FLAG_FILE"
    docker exec "$CONTAINER" nginx -s reload
    echo "[maintenance] ✅ 维护模式已关闭"
    echo "[maintenance] 网站已恢复正常"
}

# 查看维护状态
show_status() {
    check_container
    if docker exec "$CONTAINER" test -f "$FLAG_FILE" 2>/dev/null; then
        echo "[maintenance] 当前状态: 🔴 维护模式开启"
    else
        echo "[maintenance] 当前状态: 🟢 正常运行"
    fi
}

# 主逻辑
case "${1:-}" in
    on|enable|start)
        enable_maintenance
        ;;
    off|disable|stop)
        disable_maintenance
        ;;
    status)
        show_status
        ;;
    *)
        echo "用法: bash docker/maintenance.sh [on|off|status]"
        echo ""
        echo "命令:"
        echo "  on      开启维护模式"
        echo "  off     关闭维护模式"
        echo "  status  查看维护状态"
        exit 1
        ;;
esac
