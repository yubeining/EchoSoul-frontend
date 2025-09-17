import React, { useState, useEffect, useRef } from 'react';
import './App.css';

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
    liveDemo: "Live Demo",
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
    liveDemo: "在线演示", 
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
  }
};

function App() {
  const [language, setLanguage] = useState('zh'); // 默认中文
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setShowLanguageMenu(false);
  };

  const handleShare = () => {
    setShowShareMenu(!showShareMenu);
  };

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setShowLanguageMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 获取当前语言的翻译
  const t = (key: TranslationKeys): string => translations[language][key] || key;

  return (
    <div className="App">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <div className="ai-logo">AI</div>
            <div className="logo-text">EchoSoul AI Platform</div>
          </div>
          

          <div className="nav-right">
            <a href="#home" className="nav-link">{t('home')}</a>
            <a href="#docs" className="nav-link">{t('docs')}</a>
            <div className="language-selector" ref={languageMenuRef} onClick={() => setShowLanguageMenu(!showLanguageMenu)}>
              <span className="globe-icon">🌐</span>
              <span className="lang-text">{language === 'zh' ? '中文' : 'EN'}</span>
              <span className="chevron">▼</span>
              
              {showLanguageMenu && (
                <div className="language-menu">
                  <div 
                    className={`language-option ${language === 'zh' ? 'active' : ''}`}
                    onClick={() => handleLanguageChange('zh')}
                  >
                    中文
                  </div>
                  <div 
                    className={`language-option ${language === 'en' ? 'active' : ''}`}
                    onClick={() => handleLanguageChange('en')}
                  >
                    English
                  </div>
                </div>
              )}
            </div>
            <button className="share-btn" onClick={handleShare}>
              {t('share')}
            </button>
            
            {showShareMenu && (
              <div className="share-menu">
                <div className="share-option">{t('copyLink')}</div>
                <div className="share-option">{t('shareToWechat')}</div>
                <div className="share-option">{t('shareToWeibo')}</div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">EchoSoul AI Platform</h1>
            <h2 className="hero-subtitle">多模态AI人格化系统</h2>
            <p className="hero-description">
              {t('heroDescription')}
            </p>
            <div className="hero-buttons">
              <button className="btn-primary">{t('getStarted')}</button>
              <button className="btn-secondary">{t('contactSales')}</button>
              <button className="btn-secondary">{t('liveDemo')}</button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-placeholder">
              <div className="floating-card card-1">
                <div className="card-icon">🚀</div>
                <h3>{t('innovation')}</h3>
              </div>
              <div className="floating-card card-2">
                <div className="card-icon">💡</div>
                <h3>{t('creativity')}</h3>
              </div>
              <div className="floating-card card-3">
                <div className="card-icon">🌟</div>
                <h3>{t('excellence')}</h3>
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

export default App;
