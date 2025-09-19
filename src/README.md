# EchoSoul AI Platform - 前端项目结构

## 项目概述

基于React + TypeScript的现代化聊天平台，采用模块化架构设计。

## 📁 目录结构

```
src/
├── components/          # 可复用组件
│   ├── common/         # 通用组件
│   │   ├── Avatar.tsx
│   │   ├── ChatDialog.tsx
│   │   ├── ChatHistory.tsx
│   │   └── UserSearchResult.tsx
│   └── layout/         # 布局组件
│       └── Navigation.tsx
├── contexts/           # React Context
│   ├── AuthContext.tsx
│   └── TranslationContext.tsx
├── hooks/              # 自定义Hooks
│   ├── useChat.ts
│   ├── useMemoizedCallback.ts
│   └── useUserSearch.ts
├── pages/              # 页面组件
│   ├── auth/          # 认证相关页面
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── ChatPage.tsx
│   │   └── ApiTestPage.tsx
│   └── docs/          # 文档页面
│       └── DocsPage.tsx
├── services/           # API服务
│   └── api.ts
├── styles/             # 样式文件
│   ├── components/     # 组件样式
│   ├── pages/         # 页面样式
│   ├── App.css
│   └── index.css
├── utils/              # 工具函数
│   ├── environment.ts
│   ├── passwordUtils.ts
│   ├── routing.ts
│   └── translation.ts
├── App.tsx             # 主应用组件
├── index.tsx           # 应用入口
└── reportWebVitals.ts  # 性能监控
```

## 🚀 核心功能

- ✅ 用户认证（登录/注册）
- ✅ 智能聊天系统
- ✅ 用户搜索与匹配
- ✅ 实时消息传递
- ✅ 多语言支持
- ✅ 响应式设计

## 🛠️ 技术栈

- **React 18** - 前端框架
- **TypeScript** - 类型安全
- **CSS3** - 样式设计
- **Context API** - 状态管理
- **Custom Hooks** - 逻辑复用

## 📝 开发规范

### 组件命名
- 组件文件使用PascalCase
- 样式文件与组件同名
- 目录名使用小写字母

### 导入路径
```typescript
// 页面组件
import LoginPage from './pages/auth/LoginPage'

// 共享组件
import Avatar from './components/common/Avatar'

// 样式文件
import './styles/pages/LoginPage.css'
```

### 状态管理
- 使用Context API管理全局状态
- 自定义Hooks封装业务逻辑
- 组件内部使用useState/useEffect

## 🔧 开发命令

```bash
npm start              # 启动开发服务器
npm run build          # 构建生产版本
npm test               # 运行测试
npm run start:stable   # 稳定启动（推荐）
```