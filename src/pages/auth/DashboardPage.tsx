import React, { useState } from 'react';
import '../../styles/pages/DashboardPage.css';
import Navigation from '../../components/layout/Navigation';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
  language: string;
  onLanguageChange: (language: string) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ 
  onNavigate, 
  language, 
  onLanguageChange 
}) => {
  const [activeMenu, setActiveMenu] = useState('home');
  const { user, logout } = useAuth();

  const handleMenuClick = (menu: string) => {
    setActiveMenu(menu);
  };

  // 翻译文本
  const translations = {
    zh: {
      title: 'EchoSoul AI Platform 控制台',
      home: '首页',
      messages: '消息',
      profile: '我的',
      welcome: '欢迎使用 EchoSoul AI Platform',
      overview: '系统概述',
      overviewContent: 'EchoSoul AI Platform 是一个多模态AI人格化系统，融合自然语言处理、计算机视觉、语音识别与情感计算技术，构建具有独特个性和情感理解能力的智能交互伙伴，为用户提供更加人性化、个性化的AI体验。系统采用先进的深度学习架构，支持多种输入输出模态，能够理解用户意图、情感和上下文，提供智能对话服务和个性化推荐。',
      coreFeatures: '核心功能',
      advancedNlp: '高级自然语言处理',
      advancedNlpDesc: '利用最先进的自然语言处理模型，实现上下文理解、情感分析和智能对话流，并支持多语言。',
      multimodalInteraction: '多模态交互',
      multimodalInteractionDesc: '支持文本、语音、图像和视频输入，实现不同通信渠道的无缝集成和实时处理能力。',
      proactiveEngagement: '主动式交互',
      proactiveEngagementDesc: '基于用户行为模式、上下文感知和智能调度，实现AI驱动的主动式沟通，提供最佳用户体验和参与度。',
      recentActivity: '最近活动',
      systemStatus: '系统状态',
      quickActions: '快速操作'
    },
    en: {
      title: 'EchoSoul AI Platform Dashboard',
      home: 'Home',
      messages: 'Messages',
      profile: 'Profile',
      welcome: 'Welcome to EchoSoul AI Platform',
      overview: 'System Overview',
      overviewContent: 'EchoSoul AI Platform is a multimodal AI personalization system that integrates natural language processing, computer vision, speech recognition, and emotional computing technologies to build intelligent interactive partners with unique personalities and emotional understanding capabilities, providing users with a more humanized and personalized AI experience. The system uses advanced deep learning architecture, supports various input/output modalities, understands user intent, emotion, and context, and provides intelligent dialogue services and personalized recommendations.',
      coreFeatures: 'Core Features',
      advancedNlp: 'Advanced Natural Language Processing',
      advancedNlpDesc: 'Utilize state-of-the-art natural language processing models for contextual understanding, sentiment analysis, and intelligent conversation flow with multi-language support.',
      multimodalInteraction: 'Multimodal Interaction',
      multimodalInteractionDesc: 'Support for text, voice, image, and video inputs with seamless integration across different communication channels and real-time processing capabilities.',
      proactiveEngagement: 'Proactive Engagement',
      proactiveEngagementDesc: 'AI-driven proactive communication based on user behavior patterns, contextual awareness, and intelligent scheduling for optimal user experience and engagement.',
      recentActivity: 'Recent Activity',
      systemStatus: 'System Status',
      quickActions: 'Quick Actions'
    },
    ja: {
      title: 'EchoSoul AI Platform ダッシュボード',
      home: 'ホーム',
      messages: 'メッセージ',
      profile: 'プロフィール',
      welcome: 'EchoSoul AI Platform へようこそ',
      overview: 'システム概要',
      overviewContent: 'EchoSoul AI Platform は、自然言語処理、コンピュータビジョン、音声認識、感情計算技術を統合し、独特な個性と感情理解能力を持つ知的インタラクティブパートナーを構築し、ユーザーにより人間的で個性的なAI体験を提供するマルチモーダルAI人格化システムです。システムは先進的な深層学習アーキテクチャを使用し、様々な入出力モダリティをサポートし、ユーザーの意図、感情、文脈を理解し、知的対話サービスと個性化された推奨を提供します。',
      coreFeatures: 'コア機能',
      advancedNlp: '高度な自然言語処理',
      advancedNlpDesc: '最先端の自然言語処理モデルを活用し、文脈理解、感情分析、知的会話フローを実現し、多言語をサポートします。',
      multimodalInteraction: 'マルチモーダルインタラクション',
      multimodalInteractionDesc: 'テキスト、音声、画像、動画の入力をサポートし、異なる通信チャネル間のシームレスな統合とリアルタイム処理能力を実現します。',
      proactiveEngagement: '積極的エンゲージメント',
      proactiveEngagementDesc: 'ユーザーの行動パターン、文脈認識、知的スケジューリングに基づくAI駆動の積極的コミュニケーションにより、最適なユーザー体験とエンゲージメントを提供します。',
      recentActivity: '最近の活動',
      systemStatus: 'システムステータス',
      quickActions: 'クイックアクション'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.zh;

  const renderContent = () => {
    switch (activeMenu) {
      case 'home':
        return (
          <div className="dashboard-content">
            <h1 className="dashboard-title">{t.title}</h1>
            
            <div className="welcome-section">
              <h2 className="welcome-title">{t.welcome}</h2>
            </div>

            <div className="content-section">
              <h2 className="section-title">{t.overview}</h2>
              <p className="section-content">{t.overviewContent}</p>
            </div>

            <div className="content-section">
              <h2 className="section-title">{t.coreFeatures}</h2>
              <div className="features-grid">
                <div className="feature-card">
                  <h3 className="feature-title">{t.advancedNlp}</h3>
                  <p className="feature-description">{t.advancedNlpDesc}</p>
                </div>
                <div className="feature-card">
                  <h3 className="feature-title">{t.multimodalInteraction}</h3>
                  <p className="feature-description">{t.multimodalInteractionDesc}</p>
                </div>
                <div className="feature-card">
                  <h3 className="feature-title">{t.proactiveEngagement}</h3>
                  <p className="feature-description">{t.proactiveEngagementDesc}</p>
                </div>
              </div>
            </div>

            <div className="content-section">
              <h2 className="section-title">{t.recentActivity}</h2>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon">🚀</div>
                  <div className="activity-content">
                    <div className="activity-title">系统启动</div>
                    <div className="activity-time">刚刚</div>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">💬</div>
                  <div className="activity-content">
                    <div className="activity-title">AI对话服务已就绪</div>
                    <div className="activity-time">2分钟前</div>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">🎯</div>
                  <div className="activity-content">
                    <div className="activity-title">个性化推荐已激活</div>
                    <div className="activity-time">5分钟前</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'messages':
        return (
          <div className="dashboard-content">
            <h1 className="dashboard-title">消息中心</h1>
            <div className="messages-section">
              <div className="message-item">
                <div className="message-icon">📢</div>
                <div className="message-content">
                  <div className="message-title">系统通知</div>
                  <div className="message-text">欢迎使用 EchoSoul AI Platform！</div>
                  <div className="message-time">刚刚</div>
                </div>
              </div>
              <div className="message-item">
                <div className="message-icon">💡</div>
                <div className="message-content">
                  <div className="message-title">功能提示</div>
                  <div className="message-text">您可以开始与AI助手对话了</div>
                  <div className="message-time">5分钟前</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="dashboard-content">
            <h1 className="dashboard-title">个人中心</h1>
            <div className="profile-section">
              <div className="profile-card">
                <div className="profile-avatar">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="头像" />
                  ) : (
                    '👤'
                  )}
                </div>
                <div className="profile-info">
                  <div className="profile-name">{user?.nickname || '用户'}</div>
                  <div className="profile-email">
                    {user?.email || user?.mobile || '未设置联系方式'}
                  </div>
                  <div className="profile-username">@{user?.username}</div>
                </div>
              </div>
              <div className="profile-actions">
                <button className="profile-action-btn">编辑资料</button>
                <button className="profile-action-btn">修改密码</button>
                <button 
                  className="profile-action-btn"
                  onClick={async () => {
                    await logout();
                    onNavigate('home');
                  }}
                >
                  退出登录
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-page">
      {/* Navigation - 复用组件 */}
      <Navigation 
        currentPage="dashboard"
        language={language}
        onNavigate={onNavigate}
        onLanguageChange={onLanguageChange}
      />
      
      <div className="dashboard-container">
        {/* 左侧菜单栏 */}
        <div className="dashboard-sidebar">
          <div className="sidebar-header">
            <h2 className="sidebar-title">控制台</h2>
          </div>
          <nav className="sidebar-menu">
            <button 
              className={`menu-item ${activeMenu === 'home' ? 'active' : ''}`}
              onClick={() => handleMenuClick('home')}
            >
              <span className="menu-icon">🏠</span>
              <span className="menu-text">{t.home}</span>
            </button>
            <button 
              className={`menu-item ${activeMenu === 'messages' ? 'active' : ''}`}
              onClick={() => handleMenuClick('messages')}
            >
              <span className="menu-icon">💬</span>
              <span className="menu-text">{t.messages}</span>
            </button>
            <button 
              className={`menu-item ${activeMenu === 'profile' ? 'active' : ''}`}
              onClick={() => handleMenuClick('profile')}
            >
              <span className="menu-icon">👤</span>
              <span className="menu-text">{t.profile}</span>
            </button>
          </nav>
        </div>

        {/* 主内容区域 */}
        <div className="dashboard-main">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
