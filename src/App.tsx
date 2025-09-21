import React, { useState, useEffect } from 'react';
import './styles/App.css';
import DocsPage from './pages/docs/DocsPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/auth/DashboardPage';
import ChatPage from './pages/auth/ChatPage';
import Navigation from './components/layout/Navigation';
import { AuthProvider } from './contexts/AuthContext';
import { TranslationProvider } from './contexts/TranslationContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { translations, TranslationKeys } from './data/translations';

// 路由配置
const ROUTES = {
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
  'dashboard-live2d-test': '/dashboard/live2d-test',
  chat: '/chat',
  home: '/'
} as const;

type RouteKey = keyof typeof ROUTES;

function AppContent() {
  const [currentPage, setCurrentPage] = useState<RouteKey>('home');
  const [language, setLanguage] = useState('zh');

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
  };

  const handleNavigate = (page: string) => {
    const routeKey = page as RouteKey;
    setCurrentPage(routeKey);
    
    // 更新URL
    const targetPath = ROUTES[routeKey];
    if (routeKey === 'chat') {
      // 保持当前的URL参数，包括conversationId
      const currentUrl = window.location.pathname + window.location.search;
      if (!currentUrl.includes('/chat')) {
        window.history.pushState({}, '', '/chat');
      }
    } else if (targetPath) {
      window.history.pushState({}, '', targetPath);
    }
  };

  // 监听URL变化
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      
      // 根据路径设置当前页面
      const routeEntry = Object.entries(ROUTES).find(([_, routePath]) => routePath === path);
      if (routeEntry) {
        setCurrentPage(routeEntry[0] as RouteKey);
      } else if (path.startsWith('/dashboard/')) {
        // 处理控制台子页面路由
        const subPath = path.replace('/dashboard/', '');
        switch (subPath) {
          case 'home':
            setCurrentPage('dashboard-home');
            break;
          case 'messages':
            setCurrentPage('dashboard-messages');
            break;
          case 'chat':
            setCurrentPage('dashboard-chat');
            break;
          case 'profile':
            setCurrentPage('dashboard-profile');
            break;
          case 'find-users':
            setCurrentPage('dashboard-find-users');
            break;
          case 'create-ai':
            setCurrentPage('dashboard-create-ai');
            break;
          case 'ai-library':
            setCurrentPage('dashboard-ai-library');
            break;
          case 'live2d-test':
            setCurrentPage('dashboard-live2d-test');
            break;
          default:
            setCurrentPage('dashboard');
        }
      } else {
        setCurrentPage('home');
      }
    };

    // 初始化时检查URL
    handlePopState();
    
    window.addEventListener('popstate', handlePopState);
    
    // 添加自定义事件监听器，用于处理程序化的路由跳转
    const handleRouteChange = () => {
      handlePopState();
    };
    
    window.addEventListener('routechange', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('routechange', handleRouteChange);
    };
  }, []);

  // 获取当前语言的翻译
  const t = (key: TranslationKeys): string => translations[language][key] || key;

  // 渲染页面组件
  const renderPage = () => {
    const commonProps = {
      onNavigate: handleNavigate,
      language,
      onLanguageChange: handleLanguageChange
    };

    switch (currentPage) {
      case 'docs':
        return <DocsPage {...commonProps} />;
      
      case 'login':
        return <LoginPage {...commonProps} />;
      
      case 'register':
        return <RegisterPage {...commonProps} />;
      
      case 'dashboard':
      case 'dashboard-home':
      case 'dashboard-messages':
      case 'dashboard-chat':
      case 'dashboard-profile':
      case 'dashboard-find-users':
      case 'dashboard-create-ai':
      case 'dashboard-ai-library':
      case 'dashboard-live2d-test':
        return <DashboardPage {...commonProps} currentPage={currentPage} />;
      
      case 'chat':
        const urlParams = new URLSearchParams(window.location.search);
        const chatUserId = urlParams.get('userId') || urlParams.get('userid');
        const conversationId = urlParams.get('conversationId');
        const chatUserUid = urlParams.get('chatUserUid') || urlParams.get('uid');
        
        return (
          <ChatPage 
            {...commonProps}
            chatUserId={chatUserId || undefined}
            conversationId={conversationId || undefined}
            chatUserUid={chatUserUid || undefined}
          />
        );
      
      default:
        return renderHomePage();
    }
  };

  // 渲染首页
  const renderHomePage = () => (
    <div className="App">
      <Navigation 
        currentPage={currentPage}
        language={language}
        onNavigate={handleNavigate}
        onLanguageChange={handleLanguageChange}
      />

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">EchoSoul AI Platform</h1>
            <h2 className="hero-subtitle">多模态AI人格化系统</h2>
            <h3 className="hero-subtitle-jp">マルチモーダルAI人格化システム</h3>
            <p className="hero-description">
              {t('heroDescription')}
            </p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={() => handleNavigate('login')}>
                {t('getStarted')}
              </button>
              <button className="btn-secondary">{t('contactSales')}</button>
              <button className="btn-secondary btn-trial">
                <span className="trial-text">{t('liveDemo')}</span>
                <div className="trial-pulse"></div>
              </button>
              
              
              
              
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="hero-placeholder">
              <div className="hero-visual-content">
                <div className="visual-element element-1">
                  <div className="visual-icon">🚀</div>
                </div>
                <div className="visual-element element-2">
                  <div className="visual-icon">💡</div>
                </div>
                <div className="visual-element element-3">
                  <div className="visual-icon">🌟</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <h3 className="feature-title">{t('advancedNlp')}</h3>
              <p className="feature-description">
                {t('advancedNlpDesc')}
              </p>
            </div>
            <div className="feature-card">
              <h3 className="feature-title">{t('multimodalInteraction')}</h3>
              <p className="feature-description">
                {t('multimodalInteractionDesc')}
              </p>
            </div>
            <div className="feature-card">
              <h3 className="feature-title">{t('proactiveEngagement')}</h3>
              <p className="feature-description">
                {t('proactiveEngagementDesc')}
              </p>
            </div>
            <div className="feature-card">
              <h3 className="feature-title">{t('persistentMemory')}</h3>
              <p className="feature-description">
                {t('persistentMemoryDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  return renderPage();
}

function App() {
  return (
    <TranslationProvider>
      <AuthProvider>
        <WebSocketProvider>
          <AppContent />
        </WebSocketProvider>
      </AuthProvider>
    </TranslationProvider>
  );
}

export default App;