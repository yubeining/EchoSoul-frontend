#!/bin/bash

# EchoSoul AI Platform 开发服务器启动脚本
# 解决tunnel-forwarding错误和端口冲突问题

set -e  # 遇到错误立即退出

echo "🚀 EchoSoul AI Platform 开发服务器启动脚本"
echo "=============================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目配置
PROJECT_DIR="/home/devbox/project"
PORT=3000
LOG_FILE="dev-server.log"

# 进入项目目录
cd "$PROJECT_DIR" || {
    echo -e "${RED}❌ 无法进入项目目录: $PROJECT_DIR${NC}"
    exit 1
}

echo -e "${BLUE}📁 项目目录: $PROJECT_DIR${NC}"

# 1. 彻底清理现有进程
echo -e "${YELLOW}🧹 清理现有进程...${NC}"
cleanup_processes() {
    # 查找所有相关进程
    local pids=$(pgrep -f "npm start|react-scripts start|node.*start\.js" 2>/dev/null || true)
    
    if [ -n "$pids" ]; then
        echo -e "${YELLOW}🔍 发现运行中的进程: $pids${NC}"
        for pid in $pids; do
            echo -e "${YELLOW}🛑 停止进程: $pid${NC}"
            kill -TERM "$pid" 2>/dev/null || true
        done
        
        # 等待进程优雅退出
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
        echo -e "${GREEN}✅ 没有发现运行中的进程${NC}"
    fi
}

cleanup_processes

# 2. 检查端口占用
echo -e "${YELLOW}🔍 检查端口 $PORT 占用情况...${NC}"
check_port() {
    if command -v netstat >/dev/null 2>&1; then
        local port_check=$(netstat -tuln | grep ":$PORT\b" || true)
    elif command -v ss >/dev/null 2>&1; then
        local port_check=$(ss -tuln | grep ":$PORT\b" || true)
    else
        echo -e "${YELLOW}⚠️ 无法检查端口状态 (需要 netstat 或 ss 命令)${NC}"
        return 0
    fi
    
    if [ -n "$port_check" ]; then
        echo -e "${RED}❌ 端口 $PORT 仍被占用:${NC}"
        echo "$port_check"
        return 1
    else
        echo -e "${GREEN}✅ 端口 $PORT 可用${NC}"
        return 0
    fi
}

# 等待端口释放
for i in {1..10}; do
    if check_port; then
        break
    fi
    echo -e "${YELLOW}⏳ 等待端口释放... ($i/10)${NC}"
    sleep 2
done

# 3. 检查依赖
echo -e "${YELLOW}📦 检查项目依赖...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📥 安装项目依赖...${NC}"
    npm install
fi

# 4. 设置环境变量
export BROWSER=none  # 防止自动打开浏览器
export FAST_REFRESH=true  # 启用快速刷新
export GENERATE_SOURCEMAP=false  # 禁用source map以提高性能

# 5. 启动开发服务器
echo -e "${GREEN}🚀 启动开发服务器...${NC}"
echo -e "${BLUE}📝 日志文件: $LOG_FILE${NC}"
echo -e "${BLUE}🌐 访问地址: http://localhost:$PORT${NC}"

# 使用nohup在后台运行，并重定向输出
nohup npm start > "$LOG_FILE" 2>&1 &
SERVER_PID=$!

echo -e "${GREEN}✅ 开发服务器已启动，PID: $SERVER_PID${NC}"

# 6. 等待服务器启动
echo -e "${YELLOW}⏳ 等待服务器启动...${NC}"
for i in {1..30}; do
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT | grep -q "200"; then
        echo -e "${GREEN}🎉 服务器启动成功！${NC}"
        echo -e "${GREEN}🌐 访问地址: http://localhost:$PORT${NC}"
        echo -e "${BLUE}📝 查看日志: tail -f $LOG_FILE${NC}"
        echo -e "${BLUE}🛑 停止服务器: kill $SERVER_PID${NC}"
        break
    fi
    echo -e "${YELLOW}⏳ 等待中... ($i/30)${NC}"
    sleep 2
done

# 7. 保存PID到文件
echo "$SERVER_PID" > .dev-server.pid
echo -e "${GREEN}💾 服务器PID已保存到 .dev-server.pid${NC}"

# 8. 显示状态
echo -e "${BLUE}📊 服务器状态:${NC}"
echo -e "   PID: $SERVER_PID"
echo -e "   端口: $PORT"
echo -e "   日志: $LOG_FILE"
echo -e "   状态: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT)"

echo -e "${GREEN}🎯 开发服务器启动完成！${NC}"



