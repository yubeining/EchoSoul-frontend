#!/bin/bash

app_env=${1:-development}

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目配置
PORT=3000
LOG_FILE="app-server.log"

echo -e "${BLUE}🚀 EchoSoul AI Platform 启动脚本${NC}"
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}📁 项目目录: $(pwd)${NC}"
echo -e "${BLUE}🌍 运行环境: $app_env${NC}"

# 清理现有进程（仅开发环境）
cleanup_processes() {
    if [ "$app_env" = "development" ] || [ "$app_env" = "dev" ]; then
        echo -e "${YELLOW}🧹 清理现有进程...${NC}"
        
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
    fi
}

# 检查端口占用（仅开发环境）
check_port() {
    if [ "$app_env" = "development" ] || [ "$app_env" = "dev" ]; then
        echo -e "${YELLOW}🔍 检查端口 $PORT 占用情况...${NC}"
        
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
    fi
    return 0
}

# 执行清理和检查
cleanup_processes

# 等待端口释放
if [ "$app_env" = "development" ] || [ "$app_env" = "dev" ]; then
    for i in {1..10}; do
        if check_port; then
            break
        fi
        echo -e "${YELLOW}⏳ 等待端口释放... ($i/10)${NC}"
        sleep 2
    done
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 安装项目依赖...${NC}"
    npm install
fi

# Development environment commands
dev_commands() {
    echo -e "${GREEN}🚀 启动React开发环境...${NC}"
    
    # 设置开发环境变量
    export BROWSER=none  # 防止自动打开浏览器
    export FAST_REFRESH=true  # 启用快速刷新
    export GENERATE_SOURCEMAP=false  # 禁用source map以提高性能
    export HOST=0.0.0.0  # 支持远程访问
    export PORT=$PORT  # 指定端口
    export ESLINT_NO_DEV_ERRORS=true  # 禁用ESLint错误覆盖
    export NODE_OPTIONS=--max-old-space-size=4096  # 增加内存限制
    
    echo -e "${BLUE}📝 日志文件: $LOG_FILE${NC}"
    echo -e "${BLUE}🌐 访问地址: http://localhost:$PORT${NC}"
    
    # 启动开发服务器并记录日志
    npm run start 2>&1 | tee "$LOG_FILE"
}

# Production environment commands
prod_commands() {
    echo -e "${GREEN}🏭 启动React生产环境...${NC}"
    
    # Install serve if needed for production
    if ! command -v serve &> /dev/null; then
        echo -e "${YELLOW}📦 安装serve包...${NC}"
        npm install -g serve
    fi
    
    echo -e "${YELLOW}🔨 构建生产版本...${NC}"
    npm run build
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 构建成功${NC}"
        echo -e "${BLUE}🌐 启动生产服务器...${NC}"
        echo -e "${BLUE}📝 日志文件: $LOG_FILE${NC}"
        
        # 启动生产服务器并记录日志
        npx serve -s build -l $PORT 2>&1 | tee "$LOG_FILE"
    else
        echo -e "${RED}❌ 构建失败${NC}"
        exit 1
    fi
}

# Check environment variables to determine the running environment
if [ "$app_env" = "production" ] || [ "$app_env" = "prod" ] ; then
    echo -e "${GREEN}🏭 检测到生产环境${NC}"
    prod_commands
else
    echo -e "${GREEN}🛠️ 检测到开发环境${NC}"
    dev_commands
fi
