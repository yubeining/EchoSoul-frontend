# EchoSoul AI Platform

基于React + TypeScript的现代化智能聊天平台，提供多模态AI人格化交互体验。

## 🚀 项目特性

- ✅ **智能聊天系统** - 支持实时消息传递和会话管理
- ✅ **用户认证** - 完整的登录/注册系统
- ✅ **多语言支持** - 中文、英文、日文界面
- ✅ **响应式设计** - 适配各种设备尺寸
- ✅ **现代化UI** - 优雅的用户界面设计
- ✅ **类型安全** - 完整的TypeScript支持

## 🛠️ 技术栈

- **React 18** - 前端框架
- **TypeScript** - 类型安全
- **CSS3** - 样式设计
- **Context API** - 状态管理
- **Custom Hooks** - 逻辑复用

## 📦 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
# 推荐：稳定启动
npm run start:stable

# 开发环境
npm run start:dev

# 生产环境
npm run start:prod
```

### 服务器管理
```bash
npm run stop      # 停止服务器
npm run restart   # 重启服务器
npm run status    # 检查状态
```

## 🌐 访问地址

- **本地开发**: http://localhost:3000
- **网络访问**: http://10.108.60.123:3000

## 🔧 开发命令

```bash
npm start              # 启动开发服务器
npm run build          # 构建生产版本
npm test               # 运行测试
npm run start:stable   # 稳定启动（推荐）
```

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

---

**DevBox**: Code. Build. Deploy. We've Got the Rest.

专注于编写优秀代码，我们负责基础设施、扩展和部署。从开发到生产的无缝体验。