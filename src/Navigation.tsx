import React, { useState, useRef, useEffect } from 'react';
import './Navigation.css';

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

interface NavigationProps {
  currentPage: string;
  language: string;
  onNavigate: (page: string) => void;
  onLanguageChange: (language: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ 
  currentPage, 
  language, 
  onNavigate, 
  onLanguageChange 
}) => {
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  const handleLanguageChange = (newLanguage: string) => {
    onLanguageChange(newLanguage);
    setShowLanguageMenu(false);
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
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <div className="ai-logo">AI</div>
          <div className="logo-text">EchoSoul AI Platform</div>
        </div>
        
        <div className="nav-right">
          <button 
            className={`nav-link ${currentPage === 'home' ? 'active' : ''}`} 
            onClick={() => onNavigate('home')}
          >
            {t('home')}
          </button>
          <button 
            className={`nav-link ${currentPage === 'docs' ? 'active' : ''}`} 
            onClick={() => onNavigate('docs')}
          >
            {t('docs')}
          </button>
          <div className="language-selector" ref={languageMenuRef} onClick={() => setShowLanguageMenu(!showLanguageMenu)}>
            <span className="globe-icon">🌐</span>
            <span className="lang-text">
              {language === 'zh' ? '中文' : language === 'en' ? 'EN' : '日本語'}
            </span>
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
                <div 
                  className={`language-option ${language === 'ja' ? 'active' : ''}`}
                  onClick={() => handleLanguageChange('ja')}
                >
                  日本語
                </div>
              </div>
            )}
          </div>
          <button className="github-btn" onClick={() => window.open('https://github.com/yubeining/EchoSoul-frontend', '_blank')}>
            <svg className="github-icon" viewBox="0 0 24 24" fill="#333">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
