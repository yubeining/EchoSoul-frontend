# EchoSoul AI Platform - 前端项目结构

## 项目概述

这是一个基于React + TypeScript的现代化前端项目，采用模块化的文件组织结构，便于维护和扩展。

## 文件结构说明

### 📁 pages/ - 页面组件
存放所有页面级别的React组件，按功能模块分类：

- **auth/** - 认证相关页面
  - `LoginPage.tsx` - 用户登录页面
  - `RegisterPage.tsx` - 用户注册页面  
  - `DashboardPage.tsx` - 用户仪表板页面

- **docs/** - 文档相关页面
  - `DocsPage.tsx` - 文档中心页面

### 📁 components/ - 共享组件
存放可复用的React组件：

- **layout/** - 布局组件
  - `Navigation.tsx` - 导航栏组件（所有页面复用）

### 📁 styles/ - 样式文件
存放所有CSS样式文件，与组件结构对应：

- **pages/** - 页面样式
  - `LoginPage.css` - 登录页面样式
  - `RegisterPage.css` - 注册页面样式
  - `DashboardPage.css` - 仪表板页面样式
  - `DocsPage.css` - 文档页面样式

- **components/** - 组件样式
  - `Navigation.css` - 导航栏组件样式

- **全局样式**
  - `App.css` - 主应用样式
  - `index.css` - 全局基础样式

### 📁 utils/ - 工具函数
存放通用的工具函数和辅助方法（预留）

### 📁 types/ - 类型定义
存放TypeScript类型定义文件（预留）

## 设计原则

### 1. 模块化组织
- 按功能模块分类，相关文件放在同一目录
- 页面组件和样式文件保持对应关系
- 共享组件独立管理

### 2. 清晰的命名规范
- 组件文件使用PascalCase命名
- 样式文件与组件文件同名
- 目录名使用小写字母和连字符

### 3. 可扩展性
- 预留了utils和types目录
- 组件结构支持进一步细分
- 样式文件支持主题和变量管理

## 开发指南

### 添加新页面
1. 在`pages/`下创建对应的功能目录
2. 添加页面组件文件（.tsx）
3. 在`styles/pages/`下添加对应的样式文件（.css）
4. 更新`App.tsx`中的路由配置

### 添加新组件
1. 在`components/`下创建对应的分类目录
2. 添加组件文件（.tsx）
3. 在`styles/components/`下添加对应的样式文件（.css）

### 导入路径规范
- 页面组件：`import Component from './pages/category/Component'`
- 共享组件：`import Component from './components/category/Component'`
- 样式文件：`import './styles/pages/Component.css'`

## 技术栈

- **React 18** - 前端框架
- **TypeScript** - 类型安全
- **CSS3** - 样式设计
- **响应式设计** - 多设备适配

## 功能特性

- ✅ 用户认证（登录/注册）
- ✅ 游客登录
- ✅ 仪表板界面
- ✅ 文档中心
- ✅ 多语言支持
- ✅ 响应式设计
- ✅ 现代化UI设计

## 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# 构建生产版本
npm run build
```

## 浏览器支持

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
