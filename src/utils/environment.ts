// 环境检测工具
export type Environment = 'test' | 'production' | 'development';

export const getCurrentEnvironment = (): Environment => {
  const hostname = window.location.hostname;
  
  if (hostname === 'pcbzodaitkpj.sealosbja.site') {
    return 'test';
  } else if (hostname === 'cedezmdpgixn.sealosbja.site') {
    return 'production';
  } else {
    return 'development';
  }
};

export const isTestEnvironment = (): boolean => {
  return getCurrentEnvironment() === 'test';
};

export const isProductionEnvironment = (): boolean => {
  return getCurrentEnvironment() === 'production';
};

export const isDevelopmentEnvironment = (): boolean => {
  return getCurrentEnvironment() === 'development';
};

export const isApiTestAvailable = (): boolean => {
  // API测试页面只在测试环境和本地开发环境可用
  return isTestEnvironment() || isDevelopmentEnvironment();
};

export const isChatTestAvailable = (): boolean => {
  // 聊天功能在所有环境都可用
  return true;
};

export const getEnvironmentInfo = () => {
  const env = getCurrentEnvironment();
  
  switch (env) {
    case 'test':
      return {
        name: '测试环境',
        backend: 'https://glbbvnrguhix.sealosbja.site',
        color: '#17a2b8'
      };
    case 'production':
      return {
        name: '线上环境',
        backend: 'https://ohciuodbxwdp.sealosbja.site',
        color: '#28a745'
      };
    case 'development':
      return {
        name: '本地开发',
        backend: 'https://glbbvnrguhix.sealosbja.site',
        color: '#6c757d'
      };
    default:
      return {
        name: '未知环境',
        backend: 'https://glbbvnrguhix.sealosbja.site',
        color: '#dc3545'
      };
  }
};
