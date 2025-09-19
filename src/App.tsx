import React, { useState, useEffect } from 'react';
import './styles/App.css';
import DocsPage from './pages/docs/DocsPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/auth/DashboardPage';
import ChatPage from './pages/auth/ChatPage';
import ApiTestPage from './pages/auth/ApiTestPage';
import Navigation from './components/layout/Navigation';
import { AuthProvider } from './contexts/AuthContext';
import { TranslationProvider } from './contexts/TranslationContext';
import { isApiTestAvailable, isChatTestAvailable } from './utils/environment';
import { translations, TranslationKeys } from './data/translations';

// 路由配置
const ROUTES = {
  docs: '/docs',
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  chat: '/chat',
  'api-test': '/api-test',
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
    console.log('handleNavigate 被调用，页面:', page, '当前URL:', window.location.href);
    const routeKey = page as RouteKey;
    setCurrentPage(routeKey);
    
    // 更新URL
    const targetPath = ROUTES[routeKey];
    if (routeKey === 'chat') {
      // 保持当前的URL参数，包括conversationId
      const currentUrl = window.location.pathname + window.location.search;
      console.log('chat页面路由，当前URL:', currentUrl);
      if (!currentUrl.includes('/chat')) {
        window.history.pushState({}, '', '/chat');
        console.log('设置新的chat URL');
      } else {
        console.log('保持当前chat URL不变:', currentUrl);
      }
    } else {
      window.history.pushState({}, '', targetPath);
    }
    console.log('handleNavigate 完成，新页面状态:', routeKey);
  };

  // 监听URL变化
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      console.log('URL变化检测到，当前路径:', path);
      
      // 根据路径设置当前页面
      const routeEntry = Object.entries(ROUTES).find(([_, routePath]) => routePath === path);
      if (routeEntry) {
        setCurrentPage(routeEntry[0] as RouteKey);
      } else {
        setCurrentPage('home');
      }
    };

    // 初始化时检查URL
    handlePopState();
    
    window.addEventListener('popstate', handlePopState);
    
    // 添加自定义事件监听器，用于处理程序化的路由跳转
    const handleRouteChange = () => {
      console.log('自定义路由变化事件触发');
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
        return <DashboardPage {...commonProps} />;
      
      case 'chat':
        if (isChatTestAvailable()) {
          const urlParams = new URLSearchParams(window.location.search);
          const chatUserId = urlParams.get('userId') || urlParams.get('userid');
          const conversationId = urlParams.get('conversationId');
          
          return (
            <ChatPage 
              {...commonProps}
              chatUserId={chatUserId || undefined}
              conversationId={conversationId || undefined}
            />
          );
        } else {
          handleNavigate('home');
          return null;
        }
      
      case 'api-test':
        if (isApiTestAvailable()) {
          return <ApiTestPage />;
        } else {
          handleNavigate('home');
          return null;
        }
      
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
              
              {/* 测试环境按钮 */}
              {(() => {
                console.log('环境检测 - API测试可用:', isApiTestAvailable());
                console.log('环境检测 - 聊天测试可用:', isChatTestAvailable());
                console.log('当前hostname:', window.location.hostname);
                return null;
              })()}
              
              {/* 强制显示测试按钮用于调试 */}
              <button 
                className="btn-secondary" 
                  onClick={() => {
                    console.log('强制测试按钮被点击');
                    const chatUrl = '/chat?userid=10000001';
                    console.log('准备跳转到:', chatUrl);
                    window.history.pushState({}, '', chatUrl);
                    console.log('URL已设置，当前URL:', window.location.href);
                    handleNavigate('chat');
                    console.log('handleNavigate已调用');
                  }}
                style={{ marginTop: '10px', backgroundColor: '#ff6b6b' }}
              >
                强制测试聊天 (调试用)
              </button>
              
              {isApiTestAvailable() && (
                <button 
                  className="btn-secondary" 
                  onClick={() => handleNavigate('api-test')}
                  style={{ marginTop: '10px', backgroundColor: '#6f42c1' }}
                >
                  API 测试
                </button>
              )}
              
              {isChatTestAvailable() && (
                <button 
                  className="btn-secondary" 
                  onClick={() => {
                    console.log('测试聊天按钮被点击');
                    const chatUrl = '/chat?userid=10000001';
                    console.log('准备跳转到:', chatUrl);
                    window.history.pushState({}, '', chatUrl);
                    console.log('URL已设置，当前URL:', window.location.href);
                    handleNavigate('chat');
                    console.log('handleNavigate已调用');
                  }}
                  style={{ marginTop: '10px', backgroundColor: '#28a745' }}
                >
                  测试聊天 (爱丽丝)
                </button>
              )}
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
        <AppContent />
      </AuthProvider>
    </TranslationProvider>
  );
}

export default App;