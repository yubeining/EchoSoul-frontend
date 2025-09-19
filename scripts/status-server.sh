#!/bin/bash

# EchoSoul AI Platform 开发服务器状态检查脚本

echo "📊 EchoSoul AI Platform 开发服务器状态检查"
echo "=============================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_DIR="/home/devbox/project"
PORT=3000
PID_FILE=".dev-server.pid"

# 进入项目目录
cd "$PROJECT_DIR" || {
    echo -e "${RED}❌ 无法进入项目目录: $PROJECT_DIR${NC}"
    exit 1
}

echo -e "${BLUE}📁 项目目录: $PROJECT_DIR${NC}"
echo ""

# 1. 检查PID文件
echo -e "${BLUE}📄 PID文件状态:${NC}"
if [ -f "$PID_FILE" ]; then
    SERVER_PID=$(cat "$PID_FILE")
    echo -e "   PID文件存在: $SERVER_PID"
    
    if kill -0 "$SERVER_PID" 2>/dev/null; then
        echo -e "   进程状态: ${GREEN}✅ 运行中${NC}"
    else
        echo -e "   进程状态: ${RED}❌ 进程不存在${NC}"
    fi
else
    echo -e "   PID文件: ${YELLOW}⚠️ 不存在${NC}"
fi

# 2. 检查相关进程
echo ""
echo -e "${BLUE}🔍 相关进程状态:${NC}"
PROCESSES=$(pgrep -f "npm start|react-scripts start|node.*start\.js" 2>/dev/null || true)
if [ -n "$PROCESSES" ]; then
    echo -e "   发现进程: ${GREEN}✅${NC}"
    for pid in $PROCESSES; do
        echo -e "     PID: $pid"
        # 获取进程详细信息
        if command -v ps >/dev/null 2>&1; then
            ps -p "$pid" -o pid,ppid,cmd --no-headers 2>/dev/null || true
        fi
    done
else
    echo -e "   相关进程: ${RED}❌ 未发现${NC}"
fi

# 3. 检查端口占用
echo ""
echo -e "${BLUE}🌐 端口状态 (端口 $PORT):${NC}"
if command -v netstat >/dev/null 2>&1; then
    PORT_INFO=$(netstat -tuln | grep ":$PORT\b" || true)
elif command -v ss >/dev/null 2>&1; then
    PORT_INFO=$(ss -tuln | grep ":$PORT\b" || true)
else
    PORT_INFO=""
fi

if [ -n "$PORT_INFO" ]; then
    echo -e "   端口状态: ${GREEN}✅ 被占用${NC}"
    echo "   详细信息:"
    echo "$PORT_INFO" | sed 's/^/     /'
else
    echo -e "   端口状态: ${RED}❌ 未被占用${NC}"
fi

# 4. 检查HTTP响应
echo ""
echo -e "${BLUE}🌍 HTTP响应测试:${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "   HTTP状态: ${GREEN}✅ 200 OK${NC}"
    echo -e "   服务器响应: ${GREEN}✅ 正常${NC}"
elif [ "$HTTP_CODE" = "000" ]; then
    echo -e "   HTTP状态: ${RED}❌ 连接失败${NC}"
    echo -e "   服务器响应: ${RED}❌ 无响应${NC}"
else
    echo -e "   HTTP状态: ${YELLOW}⚠️ $HTTP_CODE${NC}"
    echo -e "   服务器响应: ${YELLOW}⚠️ 异常${NC}"
fi

# 5. 检查日志文件
echo ""
echo -e "${BLUE}📝 日志文件状态:${NC}"
LOG_FILE="dev-server.log"
if [ -f "$LOG_FILE" ]; then
    echo -e "   日志文件: ${GREEN}✅ 存在${NC}"
    echo -e "   文件大小: $(du -h "$LOG_FILE" | cut -f1)"
    echo -e "   最后修改: $(stat -c %y "$LOG_FILE" 2>/dev/null || stat -f %Sm "$LOG_FILE" 2>/dev/null || echo "未知")"
    
    # 显示最后几行日志
    echo -e "   最近日志:"
    tail -5 "$LOG_FILE" | sed 's/^/     /'
else
    echo -e "   日志文件: ${YELLOW}⚠️ 不存在${NC}"
fi

# 6. 总结
echo ""
echo -e "${BLUE}📋 状态总结:${NC}"
if [ "$HTTP_CODE" = "200" ] && [ -n "$PROCESSES" ]; then
    echo -e "   总体状态: ${GREEN}✅ 服务器运行正常${NC}"
    echo -e "   建议操作: 可以正常开发"
elif [ -n "$PROCESSES" ] && [ "$HTTP_CODE" != "200" ]; then
    echo -e "   总体状态: ${YELLOW}⚠️ 进程存在但无响应${NC}"
    echo -e "   建议操作: 重启服务器 (./scripts/restart-server.sh)"
else
    echo -e "   总体状态: ${RED}❌ 服务器未运行${NC}"
    echo -e "   建议操作: 启动服务器 (./scripts/dev-server.sh)"
fi

echo ""
echo -e "${BLUE}🛠️ 可用命令:${NC}"
echo -e "   启动服务器: ${GREEN}./scripts/dev-server.sh${NC}"
echo -e "   停止服务器: ${GREEN}./scripts/stop-server.sh${NC}"
echo -e "   重启服务器: ${GREEN}./scripts/restart-server.sh${NC}"
echo -e "   查看日志: ${GREEN}tail -f dev-server.log${NC}"



