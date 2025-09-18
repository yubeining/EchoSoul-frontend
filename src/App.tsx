import React, { useState, useEffect } from 'react';
import './styles/App.css';
import DocsPage from './pages/docs/DocsPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/auth/DashboardPage';
import ApiTestPage from './pages/auth/ApiTestPage';
import Navigation from './components/layout/Navigation';
import { AuthProvider } from './contexts/AuthContext';
import { isApiTestAvailable } from './utils/environment';

// 翻译对象类型定义
type TranslationKeys = 'home' | 'docs' | 'share' | 'copyLink' | 'shareToWechat' | 'shareToWeibo' | 'getStarted' | 'contactSales' | 'liveDemo' | 'heroDescription' | 'innovation' | 'excellence' | 'creativity' | 'advancedNlp' | 'advancedNlpDesc' | 'multimodalInteraction' | 'multimodalInteractionDesc' | 'proactiveEngagement' | 'proactiveEngagementDesc' | 'persistentMemory' | 'persistentMemoryDesc';

type Translations = {
  [key in TranslationKeys]: string;
};

const translations: Record<string, Translations> = {
  en: {
    home: "Home",
    docs: "Documentation", 
    share: "Share",
    copyLink: "Copy Link",
    shareToWechat: "Share to WeChat",
    shareToWeibo: "Share to Weibo",
    getStarted: "Get Started",
    contactSales: "Development Plan", 
    liveDemo: "Live Trial",
    heroDescription: "Integrate natural language processing, computer vision, speech recognition, and emotional computing technologies to build intelligent interactive partners with unique personalities and emotional understanding capabilities, providing users with a more humanized and personalized AI experience.",
    innovation: "Innovation",
    excellence: "Excellence", 
    creativity: "Creativity",
    advancedNlp: "Advanced NLP Processing",
    advancedNlpDesc: "Utilize state-of-the-art natural language processing models for contextual understanding, sentiment analysis, and intelligent conversation flow with multi-language support.",
    multimodalInteraction: "Multimodal Interaction",
    multimodalInteractionDesc: "Support for text, voice, image, and video inputs with seamless integration across different communication channels and real-time processing capabilities.",
    proactiveEngagement: "Proactive Engagement", 
    proactiveEngagementDesc: "AI-driven proactive communication based on user behavior patterns, contextual awareness, and intelligent scheduling for optimal user experience and engagement.",
    persistentMemory: "Persistent Memory System",
    persistentMemoryDesc: "Advanced memory architecture that maintains long-term context, user preferences, and conversation history for personalized and continuous interactions across sessions."
  },
  zh: {
    home: "首页",
    docs: "文档",
    share: "分享", 
    copyLink: "复制链接",
    shareToWechat: "分享到微信",
    shareToWeibo: "分享到微博",
    getStarted: "开始使用",
    contactSales: "发展规划",
    liveDemo: "在线试用", 
    heroDescription: "融合自然语言处理、计算机视觉、语音识别与情感计算技术，构建具有独特个性和情感理解能力的智能交互伙伴，为用户提供更加人性化、个性化的AI体验",
    innovation: "创新",
    excellence: "卓越",
    creativity: "创造力",
    advancedNlp: "高级自然语言处理",
    advancedNlpDesc: "利用最先进的自然语言处理模型，实现上下文理解、情感分析和智能对话流，并支持多语言。",
    multimodalInteraction: "多模态交互",
    multimodalInteractionDesc: "支持文本、语音、图像和视频输入，实现不同通信渠道的无缝集成和实时处理能力。",
    proactiveEngagement: "主动式交互",
    proactiveEngagementDesc: "基于用户行为模式、上下文感知和智能调度，实现AI驱动的主动式沟通，提供最佳用户体验和参与度。",
    persistentMemory: "持久化记忆系统", 
    persistentMemoryDesc: "先进的记忆架构，维护长期上下文、用户偏好和会话历史，实现个性化和持续的跨会话交互。"
  },
  ja: {
    home: "ホーム",
    docs: "ドキュメント",
    share: "共有", 
    copyLink: "リンクをコピー",
    shareToWechat: "WeChatで共有",
    shareToWeibo: "Weiboで共有",
    getStarted: "始める",
    contactSales: "開発計画",
    liveDemo: "オンライントライアル", 
    heroDescription: "自然言語処理、コンピュータビジョン、音声認識、感情計算技術を統合し、独特な個性と感情理解能力を持つ知的インタラクティブパートナーを構築し、ユーザーにより人間的で個性的なAI体験を提供します。",
    innovation: "革新",
    excellence: "卓越",
    creativity: "創造性",
    advancedNlp: "高度な自然言語処理",
    advancedNlpDesc: "最先端の自然言語処理モデルを活用し、文脈理解、感情分析、知的会話フローを実現し、多言語をサポートします。",
    multimodalInteraction: "マルチモーダルインタラクション",
    multimodalInteractionDesc: "テキスト、音声、画像、動画の入力をサポートし、異なる通信チャネル間のシームレスな統合とリアルタイム処理能力を実現します。",
    proactiveEngagement: "積極的エンゲージメント",
    proactiveEngagementDesc: "ユーザーの行動パターン、文脈認識、知的スケジューリングに基づくAI駆動の積極的コミュニケーションにより、最適なユーザー体験とエンゲージメントを提供します。",
    persistentMemory: "永続メモリシステム", 
    persistentMemoryDesc: "長期文脈、ユーザー設定、会話履歴を維持する先進的なメモリアーキテクチャにより、セッション間での個性化された継続的なインタラクションを実現します。"
  }
};

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home'); // 当前页面
  const [language, setLanguage] = useState('zh'); // 默认中文

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    // 更新URL
    if (page === 'docs') {
      window.history.pushState({}, '', '/docs');
    } else if (page === 'login') {
      window.history.pushState({}, '', '/login');
    } else if (page === 'register') {
      window.history.pushState({}, '', '/register');
    } else if (page === 'dashboard') {
      window.history.pushState({}, '', '/dashboard');
    } else if (page === 'api-test') {
      window.history.pushState({}, '', '/api-test');
    } else {
      window.history.pushState({}, '', '/');
    }
  };



  // 监听URL变化
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/docs') {
        setCurrentPage('docs');
      } else if (path === '/login') {
        setCurrentPage('login');
      } else if (path === '/register') {
        setCurrentPage('register');
      } else if (path === '/dashboard') {
        setCurrentPage('dashboard');
      } else if (path === '/api-test') {
        setCurrentPage('api-test');
      } else {
        setCurrentPage('home');
      }
    };

    // 初始化时检查URL
    handlePopState();
    
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // 获取当前语言的翻译
  const t = (key: TranslationKeys): string => translations[language][key] || key;

  // 如果当前是文档页面，渲染文档页面组件
  if (currentPage === 'docs') {
    return (
      <DocsPage 
        onNavigate={handleNavigate}
        language={language}
        onLanguageChange={handleLanguageChange}
      />
    );
  }

  // 如果当前是登录页面，渲染登录页面组件
  if (currentPage === 'login') {
    return (
      <LoginPage 
        onNavigate={handleNavigate}
        language={language}
        onLanguageChange={handleLanguageChange}
      />
    );
  }

  // 如果当前是注册页面，渲染注册页面组件
  if (currentPage === 'register') {
    return (
      <RegisterPage 
        onNavigate={handleNavigate}
        language={language}
        onLanguageChange={handleLanguageChange}
      />
    );
  }

  // 如果当前是仪表板页面，渲染仪表板页面组件
  if (currentPage === 'dashboard') {
    return (
      <DashboardPage 
        onNavigate={handleNavigate}
        language={language}
        onLanguageChange={handleLanguageChange}
      />
    );
  }

  // 如果当前是API测试页面，渲染API测试页面组件（仅在测试环境）
  if (currentPage === 'api-test') {
    if (isApiTestAvailable()) {
      return <ApiTestPage />;
    } else {
      // 线上环境重定向到首页
      handleNavigate('home');
      return null;
    }
  }

  return (
    <div className="App">
      {/* Navigation - 复用组件 */}
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
              <button className="btn-primary" onClick={() => handleNavigate('login')}>{t('getStarted')}</button>
              <button className="btn-secondary">{t('contactSales')}</button>
                <button className="btn-secondary btn-trial">
                  <span className="trial-text">{t('liveDemo')}</span>
                  <div className="trial-pulse"></div>
                </button>
                {/* API测试按钮 - 仅在测试环境显示 */}
                {isApiTestAvailable() && (
                  <button 
                    className="btn-secondary" 
                    onClick={() => handleNavigate('api-test')}
                    style={{ marginTop: '10px', backgroundColor: '#6f42c1' }}
                  >
                    API 测试
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
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
