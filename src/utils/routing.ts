// 路由工具函数
export const ROUTES = {
  docs: '/docs',
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  'dashboard-home': '/dashboard/home',
  'dashboard-messages': '/dashboard/messages',
  'dashboard-chat': '/dashboard/chat',
  'dashboard-profile': '/dashboard/profile',
  'dashboard-find-users': '/dashboard/find-users',
  'dashboard-create-ai': '/dashboard/create-ai',
  'dashboard-ai-library': '/dashboard/ai-library',
  chat: '/chat',
  'api-test': '/api-test',
  home: '/'
} as const;

export type RouteKey = keyof typeof ROUTES;

// 路由映射配置
export const DASHBOARD_SUBROUTES: Record<string, RouteKey> = {
  'home': 'dashboard-home',
  'messages': 'dashboard-messages',
  'chat': 'dashboard-chat',
  'profile': 'dashboard-profile',
  'find-users': 'dashboard-find-users',
  'create-ai': 'dashboard-create-ai',
  'ai-library': 'dashboard-ai-library'
};

// 根据路径获取路由键
export function getRouteKeyFromPath(path: string): RouteKey {
  // 直接匹配路由
  const directRoute = Object.entries(ROUTES).find(([_, routePath]) => routePath === path);
  if (directRoute) {
    return directRoute[0] as RouteKey;
  }

  // 处理dashboard子路由
  if (path.startsWith('/dashboard/')) {
    const subPath = path.replace('/dashboard/', '');
    return DASHBOARD_SUBROUTES[subPath] || 'dashboard';
  }

  return 'home';
}

// 导航到指定路由
export function navigateToRoute(routeKey: RouteKey, preserveParams = false): void {
  const targetPath = ROUTES[routeKey];
  
  if (routeKey === 'chat' && preserveParams) {
    // 保持当前的URL参数
    const currentUrl = window.location.pathname + window.location.search;
    if (!currentUrl.includes('/chat')) {
      window.history.pushState({}, '', '/chat');
    }
  } else if (targetPath) {
    window.history.pushState({}, '', targetPath);
  }
}

// 创建路由变化事件
export function triggerRouteChange(): void {
  window.dispatchEvent(new CustomEvent('routechange'));
}

