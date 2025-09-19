# EchoSoul AI Platform 开发服务器管理脚本

## 🚀 快速开始

### 启动开发服务器
```bash
npm run start:stable    # 推荐：稳定启动
npm run start:dev       # 开发环境
npm run start:prod      # 生产环境
```

### 服务器管理
```bash
npm run stop           # 停止服务器
npm run restart        # 重启服务器
npm run status         # 检查状态
```

## 📋 脚本说明

- **entrypoint.sh** - 主启动脚本，支持开发/生产环境
- **stop-server.sh** - 安全停止服务器
- **restart-server.sh** - 重启服务器
- **status-server.sh** - 检查服务器状态

## 🔧 环境优化

开发环境自动配置：
- 禁用自动打开浏览器
- 启用快速刷新
- 支持远程访问
- 优化内存使用

## 🐛 常见问题

### tunnel-forwarding错误
```bash
npm run restart  # 重启解决
```

### 端口被占用
```bash
npm run stop     # 停止所有进程
```

## 📊 监控

```bash
tail -f app-server.log    # 查看日志
npm run status           # 检查状态
```

## 🎯 最佳实践

1. 使用 `npm run start:stable` 启动
2. 遇到问题先 `npm run restart`
3. 定期检查 `npm run status`
4. 开发结束记得 `npm run stop`