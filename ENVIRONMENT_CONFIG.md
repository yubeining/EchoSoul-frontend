# EchoSoul 环境配置说明

## 环境对应关系

### 调试环境 (Development)
- **前端地址**: https://pcbzodaitkpj.sealosbja.site
- **后端地址**: https://glbbvnrguhix.sealosbja.site
- **用途**: 开发和测试新功能

### 线上环境 (Production)
- **前端地址**: https://cedezmdpgixn.sealosbja.site
- **后端地址**: https://ohciuodbxwdp.sealosbja.site
- **用途**: 正式生产环境

## API配置逻辑

前端会根据当前访问的域名自动选择对应的后端API地址：

```javascript
// 调试环境
if (hostname === 'pcbzodaitkpj.sealosbja.site') {
  return ['https://glbbvnrguhix.sealosbja.site'];
}

// 线上环境  
if (hostname === 'cedezmdpgixn.sealosbja.site') {
  return ['https://ohciuodbxwdp.sealosbja.site'];
}
```

## CORS配置要求

后端需要为以下域名配置CORS：

### 调试环境后端 (glbbvnrguhix.sealosbja.site)
- 允许来源: `https://pcbzodaitkpj.sealosbja.site`
- 允许来源: `http://localhost:3000` (本地开发)

### 线上环境后端 (ohciuodbxwdp.sealosbja.site)
- 允许来源: `https://cedezmdpgixn.sealosbja.site`

## 本地开发

本地开发时默认使用调试环境的后端API，确保与调试环境保持一致。

## 注意事项

1. 确保前后端域名对应关系正确
2. 后端CORS配置必须包含对应的前端域名
3. 避免跨环境调用，防止CORS问题
4. 本地开发时建议使用调试环境的后端API


