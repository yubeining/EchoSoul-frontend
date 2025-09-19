#!/bin/bash

# EchoSoul AI Platform 开发服务器停止脚本
# 安全地停止开发服务器，避免tunnel-forwarding错误

set -e

echo "🛑 EchoSoul AI Platform 开发服务器停止脚本"
echo "=============================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_DIR="/home/devbox/project"
PID_FILE=".dev-server.pid"

# 进入项目目录
cd "$PROJECT_DIR" || {
    echo -e "${RED}❌ 无法进入项目目录: $PROJECT_DIR${NC}"
    exit 1
}

# 1. 从PID文件读取服务器PID
if [ -f "$PID_FILE" ]; then
    SERVER_PID=$(cat "$PID_FILE")
    echo -e "${BLUE}📄 从PID文件读取到服务器PID: $SERVER_PID${NC}"
    
    # 检查进程是否还在运行
    if kill -0 "$SERVER_PID" 2>/dev/null; then
        echo -e "${YELLOW}🛑 停止服务器进程: $SERVER_PID${NC}"
        kill -TERM "$SERVER_PID"
        
        # 等待进程优雅退出
        for i in {1..10}; do
            if ! kill -0 "$SERVER_PID" 2>/dev/null; then
                echo -e "${GREEN}✅ 服务器进程已停止${NC}"
                break
            fi
            echo -e "${YELLOW}⏳ 等待进程退出... ($i/10)${NC}"
            sleep 1
        done
        
        # 如果进程仍在运行，强制杀死
        if kill -0 "$SERVER_PID" 2>/dev/null; then
            echo -e "${YELLOW}⚡ 强制停止进程: $SERVER_PID${NC}"
            kill -KILL "$SERVER_PID"
        fi
    else
        echo -e "${YELLOW}⚠️ PID文件中的进程已不存在${NC}"
    fi
    
    # 删除PID文件
    rm -f "$PID_FILE"
    echo -e "${GREEN}🗑️ PID文件已删除${NC}"
else
    echo -e "${YELLOW}⚠️ 未找到PID文件: $PID_FILE${NC}"
fi

# 2. 清理所有相关进程
echo -e "${YELLOW}🧹 清理所有相关进程...${NC}"
cleanup_all_processes() {
    # 查找所有相关进程
    local pids=$(pgrep -f "npm start|react-scripts start|node.*start\.js" 2>/dev/null || true)
    
    if [ -n "$pids" ]; then
        echo -e "${YELLOW}🔍 发现相关进程: $pids${NC}"
        for pid in $pids; do
            echo -e "${YELLOW}🛑 停止进程: $pid${NC}"
            kill -TERM "$pid" 2>/dev/null || true
        done
        
        # 等待进程退出
        sleep 3
        
        # 强制杀死仍在运行的进程
        local remaining_pids=$(pgrep -f "npm start|react-scripts start|node.*start\.js" 2>/dev/null || true)
        if [ -n "$remaining_pids" ]; then
            echo -e "${YELLOW}⚡ 强制停止残留进程: $remaining_pids${NC}"
            for pid in $remaining_pids; do
                kill -KILL "$pid" 2>/dev/null || true
            done
        fi
    else
        echo -e "${GREEN}✅ 没有发现相关进程${NC}"
    fi
}

cleanup_all_processes

# 3. 检查端口释放
echo -e "${YELLOW}🔍 检查端口释放情况...${NC}"
PORT=3000
if command -v netstat >/dev/null 2>&1; then
    port_check=$(netstat -tuln | grep ":$PORT\b" || true)
elif command -v ss >/dev/null 2>&1; then
    port_check=$(ss -tuln | grep ":$PORT\b" || true)
else
    echo -e "${YELLOW}⚠️ 无法检查端口状态${NC}"
    port_check=""
fi

if [ -n "$port_check" ]; then
    echo -e "${YELLOW}⚠️ 端口 $PORT 仍被占用:${NC}"
    echo "$port_check"
else
    echo -e "${GREEN}✅ 端口 $PORT 已释放${NC}"
fi

# 4. 清理临时文件
echo -e "${YELLOW}🧹 清理临时文件...${NC}"
rm -f "dev-server.log"
rm -f ".dev-server.pid"

echo -e "${GREEN}🎯 服务器停止完成！${NC}"
