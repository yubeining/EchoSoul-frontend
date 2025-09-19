#!/bin/bash

# EchoSoul AI Platform 开发服务器重启脚本
# 安全地重启开发服务器，避免tunnel-forwarding错误

set -e

echo "🔄 EchoSoul AI Platform 开发服务器重启脚本"
echo "=============================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_DIR="/home/devbox/project"

# 进入项目目录
cd "$PROJECT_DIR" || {
    echo -e "${RED}❌ 无法进入项目目录: $PROJECT_DIR${NC}"
    exit 1
}

echo -e "${BLUE}📁 项目目录: $PROJECT_DIR${NC}"

# 1. 停止服务器
echo -e "${YELLOW}🛑 停止现有服务器...${NC}"
if [ -f "scripts/stop-server.sh" ]; then
    bash scripts/stop-server.sh
else
    echo -e "${YELLOW}⚠️ 停止脚本不存在，手动清理进程...${NC}"
    pkill -f "npm start|react-scripts start|node.*start\.js" 2>/dev/null || true
    sleep 3
fi

# 2. 等待端口完全释放
echo -e "${YELLOW}⏳ 等待端口释放...${NC}"
sleep 5

# 3. 启动服务器
echo -e "${YELLOW}🚀 启动新服务器...${NC}"
if [ -f "entrypoint.sh" ]; then
    bash entrypoint.sh development
else
    echo -e "${YELLOW}⚠️ entrypoint.sh不存在，使用npm start...${NC}"
    nohup npm start > dev-server.log 2>&1 &
    echo -e "${GREEN}✅ 服务器已启动${NC}"
fi

echo -e "${GREEN}🎯 服务器重启完成！${NC}"
