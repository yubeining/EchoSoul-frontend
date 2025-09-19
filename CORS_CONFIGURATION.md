# 🌐 CORS 跨域配置文档

## 📋 概述

本文档详细说明了前端应用 `https://pcbzodaitkpj.sealosbja.site` 访问后端服务 `https://glbbvnrguhix.sealosbja.site` 时需要的CORS配置。

## 🎯 需要配置的CORS设置

### 1. 允许的源地址 (Allowed Origins)
```
https://pcbzodaitkpj.sealosbja.site
```

### 2. 允许的HTTP方法 (Allowed Methods)
```
GET, POST, PUT, DELETE, OPTIONS
```

### 3. 允许的请求头 (Allowed Headers)
```
Content-Type
Authorization
Accept
X-Requested-With
```

### 4. 需要CORS支持的API端点

#### 🔐 认证相关端点
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/user/info
PUT  /api/auth/user/profile
PUT  /api/auth/user/password
POST /api/auth/refresh
POST /api/auth/logout
POST /api/auth/oauth/login
```

#### 👥 用户搜索端点
```
GET /api/users/search
```

#### 🏥 健康检查端点 (调试用)
```
GET /api/health
```

## 🔧 后端CORS配置示例

### FastAPI 配置示例
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://pcbzodaitkpj.sealosbja.site",
        "http://localhost:3000",  # 本地开发环境
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=[
        "Content-Type",
        "Authorization",
        "Accept",
        "X-Requested-With",
    ],
)
```

### Nginx 配置示例
```nginx
location /api/ {
    # 处理预检请求
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' 'https://pcbzodaitkpj.sealosbja.site';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, Accept, X-Requested-With';
        add_header 'Access-Control-Max-Age' 1728000;
        add_header 'Content-Type' 'text/plain; charset=utf-8';
        add_header 'Content-Length' 0;
        return 204;
    }
    
    # 处理实际请求
    add_header 'Access-Control-Allow-Origin' 'https://pcbzodaitkpj.sealosbja.site';
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, Accept, X-Requested-With';
    
    proxy_pass http://backend;
}
```

## 🚨 当前遇到的问题

### 1. 503 Service Unavailable
- **问题**: 后端服务暂时不可用
- **解决**: 确保后端服务正常运行

### 2. CORS Preflight 失败
- **问题**: OPTIONS预检请求被拒绝
- **解决**: 确保所有API端点都支持OPTIONS方法

### 3. 认证头被阻止
- **问题**: Authorization头在跨域请求中被阻止
- **解决**: 在CORS配置中明确允许Authorization头

## 🧪 测试验证

### 使用curl测试CORS配置
```bash
# 测试预检请求
curl -X OPTIONS "https://glbbvnrguhix.sealosbja.site/api/users/search" \
  -H "Origin: https://pcbzodaitkpj.sealosbja.site" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization,Content-Type" \
  -v

# 测试实际请求
curl -X GET "https://glbbvnrguhix.sealosbja.site/api/users/search?keyword=admin" \
  -H "Origin: https://pcbzodaitkpj.sealosbja.site" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -v
```

## 📝 调试建议

1. **检查后端服务状态**: 确保 `https://glbbvnrguhix.sealosbja.site` 服务正常运行
2. **验证CORS配置**: 使用浏览器开发者工具检查响应头
3. **测试认证流程**: 确保登录后能正常获取和使用token
4. **监控网络请求**: 使用前端调试工具监控所有API请求

## 🔄 更新日志

- 2024-09-19: 初始版本，包含基本CORS配置
- 2024-09-19: 添加调试工具和测试方法

