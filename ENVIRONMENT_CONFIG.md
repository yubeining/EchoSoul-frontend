# 🌍 EchoSoul AI Platform 环境配置

## 📋 环境地址映射

### 🖥️ 前端环境

| 环境 | 前端地址 | 后端地址 | 用途 |
|------|----------|----------|------|
| **测试环境** | https://pcbzodaitkpj.sealosbja.site | https://glbbvnrguhix.sealosbja.site | 功能测试和开发验证 |
| **线上环境** | https://jqpiogolcznu.sealosbja.site | https://rmlqwqpmrpnw.sealosbja.site | 生产环境 |
| **本地开发** | http://localhost:3000 | https://glbbvnrguhix.sealosbja.site | 本地开发调试 |

### 🔧 自动环境检测

前端应用会根据 `window.location.hostname` 自动选择对应的后端API地址：

```typescript
const getApiBaseUrls = () => {
  const hostname = window.location.hostname;
  
  // 测试环境
  if (hostname === 'pcbzodaitkpj.sealosbja.site') {
    return [
      'https://glbbvnrguhix.sealosbja.site',  // 测试环境后端
      'http://localhost:8080',  // 本地开发备用
    ];
  }
  
  // 线上环境
  if (hostname === 'jqpiogolcznu.sealosbja.site') {
    return [
      'https://rmlqwqpmrpnw.sealosbja.site',  // 线上环境后端
      'https://glbbvnrguhix.sealosbja.site',  // 测试环境备用
      'http://localhost:8080',  // 本地开发备用
    ];
  }
  
  // 本地开发环境
  return [
    'https://glbbvnrguhix.sealosbja.site',  // 默认使用测试环境
    'http://localhost:8080',  // 本地开发备用
  ];
};
```

## 🚀 后端服务状态

### 测试环境后端
- **地址**: https://glbbvnrguhix.sealosbja.site
- **状态**: ✅ 健康运行
- **架构**: 模块化架构
- **数据库**: MySQL + Redis
- **框架**: FastAPI (Python 3.7+)

### 线上环境后端
- **地址**: https://rmlqwqpmrpnw.sealosbja.site
- **状态**: ✅ 健康运行
- **架构**: 模块化架构
- **数据库**: MySQL + Redis
- **框架**: FastAPI (Python 3.7+)

## 📚 API文档

每个环境都提供完整的API文档：

- **Swagger UI**: `{backend_url}/docs`
- **ReDoc**: `{backend_url}/redoc`
- **健康检查**: `{backend_url}/health`

## 🔍 测试验证

### 健康检查测试
```bash
# 测试环境
curl https://glbbvnrguhix.sealosbja.site/health

# 线上环境
curl https://rmlqwqpmrpnw.sealosbja.site/health
```

### 登录API测试
```bash
# 测试环境
curl -X POST "https://glbbvnrguhix.sealosbja.site/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin@echosoul.com", "password": "admin123"}'

# 线上环境
curl -X POST "https://rmlqwqpmrpnw.sealosbja.site/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin@echosoul.com", "password": "admin123"}'
```

## 🛠️ 开发指南

### 本地开发
1. 启动前端: `npm start`
2. 访问: http://localhost:3000
3. API测试: http://localhost:3000/api-test

### 测试环境部署
1. 前端地址: https://pcbzodaitkpj.sealosbja.site
2. 自动连接测试环境后端
3. API测试页面会显示环境信息

### 线上环境部署
1. 前端地址: https://jqpiogolcznu.sealosbja.site
2. 自动连接线上环境后端
3. 支持测试环境作为备用

## ⚠️ 注意事项

1. **环境隔离**: 测试和线上环境完全隔离
2. **自动切换**: 前端根据域名自动选择后端
3. **备用机制**: 支持多地址自动切换
4. **SSL证书**: 所有环境都使用HTTPS
5. **CORS配置**: 已配置跨域访问支持
6. **🔒 API测试页面安全**: API测试页面仅在测试环境和本地开发环境可用，线上环境不会显示此功能

## 📊 监控和日志

- **健康检查**: 实时监控服务状态
- **API日志**: 完整的请求响应日志
- **错误处理**: 统一的错误处理机制
- **性能监控**: 响应时间统计

---

**最后更新**: 2025-09-18  
**维护团队**: EchoSoul AI Platform
