// 路由管理工具
export type Route = 'home' | 'docs' | 'login' | 'register' | 'dashboard';

// 路由配置
export const routes: Record<Route, string> = {
  home: '/',
  docs: '/docs',
  login: '/login',
  register: '/register',
  dashboard: '/dashboard'
};

// 路径到路由的映射
export const pathToRoute: Record<string, Route> = {
  '/': 'home',
  '/docs': 'docs',
  '/login': 'login',
  '/register': 'register',
  '/dashboard': 'dashboard'
};

/**
 * 根据路径获取对应的路由
 * @param path 路径
 * @returns 对应的路由
 */
export const getRouteFromPath = (path: string): Route => {
  return pathToRoute[path] || 'home';
};

/**
 * 根据路由获取对应的路径
 * @param route 路由
 * @returns 对应的路径
 */
export const getPathFromRoute = (route: Route): string => {
  return routes[route];
};

/**
 * 导航到指定路由
 * @param route 目标路由
 */
export const navigateToRoute = (route: Route): void => {
  const path = getPathFromRoute(route);
  window.history.pushState({}, '', path);
};

/**
 * 监听浏览器前进后退事件
 * @param callback 路由变化回调
 * @returns 清理函数
 */
export const listenToRouteChanges = (callback: (route: Route) => void): (() => void) => {
  const handlePopState = () => {
    const path = window.location.pathname;
    const route = getRouteFromPath(path);
    callback(route);
  };

  // 初始化时检查当前路径
  handlePopState();

  window.addEventListener('popstate', handlePopState);
  
  return () => {
    window.removeEventListener('popstate', handlePopState);
  };
};

