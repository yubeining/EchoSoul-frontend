import React, { useState, useEffect } from 'react';
import '../../styles/pages/DashboardPage.css';
import '../../styles/pages/AICharacterCreation.css';
import Navigation from '../../components/layout/Navigation';
import ChangePasswordModal from '../../components/common/ChangePasswordModal';
import UserSearchResult from '../../components/common/UserSearchResult';
import ChatHistory from '../../components/common/ChatHistory';
import Live2DCharacter from '../../components/live2d/Live2DCharacter';
import { useAuth } from '../../contexts/AuthContext';
import { useUserSearch, UserSearchResult as UserSearchResultType } from '../../hooks/useUserSearch';
import { useChat } from '../../hooks/useChat';
import { aiCharacterApi, aiChatApi, CreateAICharacterRequest } from '../../services/api';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
  language: string;
  onLanguageChange: (language: string) => void;
  currentPage?: string;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ 
  onNavigate, 
  language, 
  onLanguageChange,
  currentPage
}) => {
  const [activeMenu, setActiveMenu] = useState('home');
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  
  // AI角色创建相关状态
  const [aiCharacterForm, setAiCharacterForm] = useState({
    name: '',
    nickname: '',
    avatar: '',
    description: '',
    personality: '',
    background_story: '',
    speaking_style: '',
    is_public: false
  });
  const [isCreatingAI, setIsCreatingAI] = useState(false);
  const [aiCreationError, setAiCreationError] = useState<string | null>(null);
  const [aiCreationSuccess, setAiCreationSuccess] = useState<string | null>(null);
  
  // AI角色库相关状态
  const [aiCharacters, setAiCharacters] = useState<any[]>([]);
  const [aiLibraryLoading, setAiLibraryLoading] = useState(false);
  const [aiLibraryError, setAiLibraryError] = useState<string | null>(null);
  const [aiLibraryType, setAiLibraryType] = useState<'public' | 'my' | 'favorited'>('public');
  
  const { user, logout } = useAuth();
  const { getOrCreateConversation } = useChat();

  // 根据currentPage prop设置activeMenu
  useEffect(() => {
    if (currentPage) {
      switch (currentPage) {
        case 'dashboard':
        case 'dashboard-home':
          setActiveMenu('home');
          break;
        case 'dashboard-messages':
          setActiveMenu('messages');
          break;
        case 'dashboard-chat':
          setActiveMenu('chat');
          break;
        case 'dashboard-profile':
          setActiveMenu('profile');
          break;
        case 'dashboard-find-users':
          setActiveMenu('findUsers');
          break;
        case 'dashboard-create-ai':
          setActiveMenu('createAI');
          break;
        case 'dashboard-ai-library':
          setActiveMenu('aiLibrary');
          break;
        case 'dashboard-live2d-test':
          setActiveMenu('live2dTest');
          break;
        default:
          setActiveMenu('home');
      }
    } else {
      // 兼容旧的URL参数方式
      const urlParams = new URLSearchParams(window.location.search);
      const menu = urlParams.get('menu');
      if (menu && ['home', 'messages', 'chat', 'profile', 'findUsers', 'createAI', 'aiLibrary', 'live2dTest'].includes(menu)) {
        setActiveMenu(menu);
      }
    }
  }, [currentPage]);

  // 当切换到AI角色库时加载数据
  useEffect(() => {
    if (activeMenu === 'aiLibrary') {
      loadAICharacters('public');
    }
  }, [activeMenu]);
  
  // 使用用户搜索Hook
  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    results: searchResults,
    isSearching,
    error: searchError,
    clearResults
  } = useUserSearch({
    debounceMs: 300,
    minQueryLength: 2
  });

  const handleMenuClick = (menu: string) => {
    setActiveMenu(menu);
    
    // 更新URL路径
    const routeMap: { [key: string]: string } = {
      'home': 'dashboard-home',
      'messages': 'dashboard-messages',
      'chat': 'dashboard-chat',
      'profile': 'dashboard-profile',
      'findUsers': 'dashboard-find-users',
      'createAI': 'dashboard-create-ai',
      'aiLibrary': 'dashboard-ai-library',
      'live2dTest': 'dashboard-live2d-test'
    };
    
    const routeKey = routeMap[menu];
    if (routeKey) {
      onNavigate(routeKey);
    }
    
    // 切换到查找用户页面时清空搜索结果
    if (menu === 'findUsers') {
      clearResults();
    }
  };

  // AI角色创建相关处理函数
  const handleAICharacterFormChange = (field: string, value: string | boolean) => {
    setAiCharacterForm(prev => ({
      ...prev,
      [field]: value
    }));
    // 清除错误和成功消息
    setAiCreationError(null);
    setAiCreationSuccess(null);
  };

  const handleCreateAICharacter = async () => {
    if (!user) {
      setAiCreationError('请先登录');
      return;
    }

    // 验证必填字段
    if (!aiCharacterForm.name.trim()) {
      setAiCreationError('请输入角色名称');
      return;
    }
    if (!aiCharacterForm.nickname.trim()) {
      setAiCreationError('请输入角色昵称');
      return;
    }

    try {
      setIsCreatingAI(true);
      setAiCreationError(null);
      setAiCreationSuccess(null);

      const requestData: CreateAICharacterRequest = {
        name: aiCharacterForm.name.trim(),
        nickname: aiCharacterForm.nickname.trim(),
        avatar: aiCharacterForm.avatar.trim() || undefined,
        description: aiCharacterForm.description.trim() || undefined,
        personality: aiCharacterForm.personality.trim() || undefined,
        background_story: aiCharacterForm.background_story.trim() || undefined,
        speaking_style: aiCharacterForm.speaking_style.trim() || undefined,
        is_public: aiCharacterForm.is_public
      };

      console.log('准备创建AI角色:', requestData);
      const response = await aiCharacterApi.createCharacter(requestData);
      
      if (response.code === 1) {
        setAiCreationSuccess(`AI角色"${aiCharacterForm.name}"创建成功！`);
        // 重置表单
        setAiCharacterForm({
          name: '',
          nickname: '',
          avatar: '',
          description: '',
          personality: '',
          background_story: '',
          speaking_style: '',
          is_public: false
        });
      } else {
        setAiCreationError(response.msg || '创建失败');
      }
    } catch (error: any) {
      console.error('创建AI角色失败:', error);
      setAiCreationError(error.message || '创建AI角色失败，请重试');
    } finally {
      setIsCreatingAI(false);
    }
  };

  const handleSaveDraft = () => {
    // 保存草稿功能（可以保存到localStorage）
    const draft = {
      ...aiCharacterForm,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('ai_character_draft', JSON.stringify(draft));
    setAiCreationSuccess('草稿已保存');
  };

  // AI角色库相关处理函数
  const loadAICharacters = async (listType: 'public' | 'my' | 'favorited' = 'public') => {
    try {
      setAiLibraryLoading(true);
      setAiLibraryError(null);
      
      console.log('🤖 加载AI角色列表:', listType);
      const response = await aiCharacterApi.getCharacters(listType, 1, 20);
      
      if (response.code === 1) {
        console.log('🤖 AI角色数据:', response.data.characters);
        setAiCharacters(response.data.characters);
        setAiLibraryType(listType);
      } else {
        setAiLibraryError(response.msg || '加载失败');
      }
    } catch (error: any) {
      console.error('❌ 加载AI角色列表失败:', error);
      setAiLibraryError(error.message || '加载AI角色列表失败');
    } finally {
      setAiLibraryLoading(false);
    }
  };

  const handleStartAIChat = async (character: any) => {
    if (!user) {
      alert('请先登录');
      return;
    }

    try {
      console.log('🤖 开始与AI角色聊天:', character);
      const response = await aiChatApi.createAIConversation({
        character_id: character.character_id
      });
      
      if (response.code === 1) {
        // 跳转到聊天页面
        const chatUrl = `/chat?conversationId=${response.data.conversation_id}&chatUserUid=${character.character_id}`;
        onNavigate('chat');
        window.history.pushState({}, '', chatUrl);
      } else {
        alert(response.msg || '创建会话失败');
      }
    } catch (error: any) {
      console.error('❌ 创建AI会话失败:', error);
      alert(error.message || '创建AI会话失败');
    }
  };

  // 处理用户操作
  const handleStartChat = async (targetUser: UserSearchResultType) => {
    if (!user) {
      alert('请先登录');
      return;
    }
    
    try {
      console.log('开始创建会话，目标用户ID:', targetUser.id, '类型:', typeof targetUser.id);
      
      // 获取或创建会话
      const conversation = await getOrCreateConversation(targetUser.id);
      console.log('getOrCreateConversation 返回结果:', conversation);
      if (conversation) {
        console.log('会话创建成功:', conversation);
        // 跳转到聊天页面，传递会话ID和用户UID参数
        const chatUrl = `/chat?conversationId=${conversation.conversation_id}&uid=${targetUser.uid}`;
        console.log('准备跳转到:', chatUrl);
        
        // 先设置URL，再调用导航
        window.history.pushState({}, '', chatUrl);
        console.log('URL已设置，当前URL:', window.location.href);
        
        // 触发自定义路由变化事件
        window.dispatchEvent(new CustomEvent('routechange'));
        console.log('自定义路由变化事件已触发');
        
        // 调用导航函数
        onNavigate('chat');
        console.log('onNavigate("chat") 已调用');
        
        // 强制刷新页面状态
        setTimeout(() => {
          console.log('延迟检查URL:', window.location.href);
          console.log('延迟检查页面状态');
        }, 100);
      } else {
        console.error('会话创建失败，conversation为null');
        alert('创建会话失败，请重试');
      }
    } catch (error: any) {
      console.error('创建会话失败:', error);
      
      // 提供更详细的错误信息
      let errorMessage = '创建会话失败，请稍后重试';
      
      if (error.message) {
        if (error.message.includes('401')) {
          errorMessage = '登录已过期，请重新登录';
        } else if (error.message.includes('422')) {
          errorMessage = '请求参数错误，请检查用户信息';
        } else if (error.message.includes('403')) {
          errorMessage = '没有权限创建会话';
        } else if (error.message.includes('404')) {
          errorMessage = '目标用户不存在';
        } else {
          errorMessage = `创建会话失败: ${error.message}`;
        }
      }
      
      alert(errorMessage);
    }
  };


  // 聊天相关处理函数
  const handleChatClick = (conversationId: string) => {
    // 跳转到聊天页面，传递会话ID参数
    const chatUrl = `/chat?conversationId=${conversationId}`;
    window.history.pushState({}, '', chatUrl);
    onNavigate('chat');
  };

  const handleNewChat = () => {
    // 切换到用户搜索页面
    setActiveMenu('findUsers');
  };

  // 翻译文本
  const translations = {
    zh: {
      title: 'EchoSoul AI Platform 控制台',
      home: '首页',
      messages: '消息',
      chat: '聊天',
      profile: '我的',
      findUsers: '查找用户',
      createAI: '创建AI角色',
      aiLibrary: 'AI角色库',
      live2dTest: 'Live2D角色测试',
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
      quickActions: '快速操作',
      searchUsers: '用户搜索',
      searchPlaceholder: '输入用户名或邮箱进行搜索...',
      searchButton: '搜索',
      noResults: '未找到匹配的用户',
      userList: '用户列表'
    },
    en: {
      title: 'EchoSoul AI Platform Dashboard',
      home: 'Home',
      messages: 'Messages',
      chat: 'Chat',
      profile: 'Profile',
      findUsers: 'Find Users',
      createAI: 'Create AI Character',
      aiLibrary: 'AI Character Library',
      live2dTest: 'Live2D Character Test',
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
      quickActions: 'Quick Actions',
      searchUsers: 'User Search',
      searchPlaceholder: 'Enter username or email to search...',
      searchButton: 'Search',
      noResults: 'No matching users found',
      userList: 'User List'
    },
    ja: {
      title: 'EchoSoul AI Platform ダッシュボード',
      home: 'ホーム',
      messages: 'メッセージ',
      chat: 'チャット',
      profile: 'プロフィール',
      findUsers: 'ユーザー検索',
      createAI: 'AIキャラクター作成',
      aiLibrary: 'AIキャラクターライブラリ',
      live2dTest: 'Live2Dキャラクターテスト',
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
      quickActions: 'クイックアクション',
      searchUsers: 'ユーザー検索',
      searchPlaceholder: 'ユーザー名またはメールアドレスを入力して検索...',
      searchButton: '検索',
      noResults: '一致するユーザーが見つかりません',
      userList: 'ユーザーリスト'
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
                <button 
                  className="profile-action-btn"
                  onClick={() => setShowChangePasswordModal(true)}
                >
                  修改密码
                </button>
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
      case 'chat':
        return (
          <div className="dashboard-content">
            <h1 className="dashboard-title">聊天记录</h1>
            <ChatHistory
              onChatClick={handleChatClick}
              onNewChat={handleNewChat}
            />
          </div>
        );
      case 'findUsers':
        return (
          <div className="dashboard-content">
            <h1 className="dashboard-title">{t.searchUsers}</h1>
            
            
            <div className="search-section">
              <div className="search-form">
                <input
                  type="text"
                  className="search-input"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button 
                    className="clear-button"
                    onClick={clearResults}
                    title="清空搜索"
                  >
                    ✕
                  </button>
                )}
              </div>
              
              {/* 搜索提示 */}
              <div className="search-tips">
                <p>💡 输入用户名、昵称、邮箱或简介关键词进行搜索</p>
                <p>🔍 输入2个字符以上开始实时搜索</p>
              </div>
            </div>

            {/* 搜索状态 */}
            {isSearching && (
              <div className="search-status">
                <div className="loading-spinner"></div>
                <span>正在搜索用户...</span>
              </div>
            )}

            {/* 搜索错误 */}
            {searchError && (
              <div className="search-error">
                <div className="error-icon">⚠️</div>
                <div className="error-message">{searchError}</div>
              </div>
            )}

            {/* 搜索结果 */}
            {searchResults.length > 0 && (
              <div className="search-results">
                <div className="results-header">
                  <h2 className="results-title">{t.userList}</h2>
                  <span className="results-count">找到 {searchResults.length} 个用户</span>
                </div>
                <div className="user-results-list">
                  {searchResults.map((user) => (
                    <UserSearchResult
                      key={user.id}
                      user={user}
                      onStartChat={handleStartChat}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 无搜索结果 */}
            {searchQuery && searchResults.length === 0 && !isSearching && !searchError && (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <div className="no-results-text">{t.noResults}</div>
                <div className="no-results-suggestions">
                  <p>尝试以下建议：</p>
                  <ul>
                    <li>检查拼写是否正确</li>
                    <li>尝试使用更简单的关键词</li>
                    <li>搜索用户名或昵称</li>
                  </ul>
                </div>
              </div>
            )}

            {/* 初始状态提示 */}
            {!searchQuery && (
              <div className="search-intro">
                <div className="intro-icon">👥</div>
                <h3>发现更多用户</h3>
                <p>在搜索框中输入关键词，实时查找平台上的其他用户</p>
                <div className="intro-features">
                  <div className="feature-item">
                    <span className="feature-icon">💬</span>
                    <span>发起聊天</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'createAI':
        return (
          <div className="dashboard-content">
            <div className="ai-creation-header">
              <h1 className="ai-creation-title">创建AI角色</h1>
              <span className="ai-creation-divider">•</span>
              <p className="ai-creation-subtitle">设计一个独特的AI角色，让它成为你的智能助手</p>
            </div>
            
            <div className="ai-character-creation">
              <div className="creation-form">
                <div className="form-section">
                  <div className="section-header">
                    <div className="section-icon">📝</div>
                    <h3 className="section-title">基本信息</h3>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">
                        角色名称 <span className="required">*</span>
                      </label>
                      <div className="input-wrapper">
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="给你的AI角色起个名字"
                          value={aiCharacterForm.name}
                          onChange={(e) => handleAICharacterFormChange('name', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        角色昵称 <span className="required">*</span>
                      </label>
                      <div className="input-wrapper">
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="用户会如何称呼这个角色"
                          value={aiCharacterForm.nickname}
                          onChange={(e) => handleAICharacterFormChange('nickname', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">角色描述</label>
                    <div className="textarea-wrapper">
                      <textarea 
                        className="form-textarea" 
                        placeholder="描述这个AI角色的基本信息、特点和能力..."
                        rows={4}
                        value={aiCharacterForm.description}
                        onChange={(e) => handleAICharacterFormChange('description', e.target.value)}
                      ></textarea>
                      <div className="char-count">{aiCharacterForm.description.length}/500</div>
                    </div>
                  </div>
                </div>
                
                <div className="form-section">
                  <div className="section-header">
                    <div className="section-icon">🎭</div>
                    <h3 className="section-title">人设设定</h3>
                  </div>
                  <div className="form-group">
                    <label className="form-label">性格特点</label>
                    <div className="input-wrapper">
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="例如：温柔、幽默、专业、活泼"
                        value={aiCharacterForm.personality}
                        onChange={(e) => handleAICharacterFormChange('personality', e.target.value)}
                      />
                    </div>
                    <div className="form-hint">用逗号分隔多个特点</div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">背景故事</label>
                    <div className="textarea-wrapper">
                      <textarea 
                        className="form-textarea" 
                        placeholder="讲述这个AI角色的背景故事、经历和成长历程..."
                        rows={4}
                        value={aiCharacterForm.background_story}
                        onChange={(e) => handleAICharacterFormChange('background_story', e.target.value)}
                      ></textarea>
                      <div className="char-count">{aiCharacterForm.background_story.length}/1000</div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">对话风格</label>
                    <div className="select-wrapper">
                      <select 
                        className="form-select"
                        value={aiCharacterForm.speaking_style}
                        onChange={(e) => handleAICharacterFormChange('speaking_style', e.target.value)}
                      >
                        <option value="">选择对话风格</option>
                        <option value="formal">正式严谨</option>
                        <option value="casual">轻松随意</option>
                        <option value="friendly">友好亲切</option>
                        <option value="professional">专业高效</option>
                        <option value="humorous">幽默风趣</option>
                        <option value="caring">关怀体贴</option>
                      </select>
                      <div className="select-arrow">▼</div>
                    </div>
                  </div>
                </div>
                
                <div className="form-section">
                  <div className="section-header">
                    <div className="section-icon">🎨</div>
                    <h3 className="section-title">外观设置</h3>
                  </div>
                  <div className="form-group">
                    <label className="form-label">头像URL</label>
                    <div className="input-wrapper">
                      <input 
                        type="url" 
                        className="form-input" 
                        placeholder="https://example.com/avatar.jpg"
                        value={aiCharacterForm.avatar}
                        onChange={(e) => handleAICharacterFormChange('avatar', e.target.value)}
                      />
                    </div>
                    <div className="form-hint">支持 JPG、PNG、GIF 格式，建议尺寸 200x200 像素</div>
                    {aiCharacterForm.avatar && (
                      <div className="avatar-preview">
                        <img 
                          src={aiCharacterForm.avatar} 
                          alt="头像预览" 
                          className="preview-avatar"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <div className="checkbox-wrapper">
                      <label className="checkbox-label">
                        <input 
                          type="checkbox" 
                          className="form-checkbox"
                          checked={aiCharacterForm.is_public}
                          onChange={(e) => handleAICharacterFormChange('is_public', e.target.checked)}
                        />
                        <span className="checkbox-custom"></span>
                        <span className="checkbox-text">公开此角色</span>
                      </label>
                      <div className="checkbox-hint">其他用户可以搜索并使用这个角色</div>
                    </div>
                  </div>
                </div>
                
                {/* 错误和成功消息显示 */}
                {aiCreationError && (
                  <div className="form-message error">
                    <div className="message-icon">⚠️</div>
                    <div className="message-text">{aiCreationError}</div>
                  </div>
                )}
                {aiCreationSuccess && (
                  <div className="form-message success">
                    <div className="message-icon">✅</div>
                    <div className="message-text">{aiCreationSuccess}</div>
                  </div>
                )}
                
                <div className="form-actions">
                  <button 
                    className="btn-create" 
                    onClick={handleCreateAICharacter}
                    disabled={isCreatingAI}
                  >
                    {isCreatingAI ? (
                      <>
                        <div className="btn-spinner"></div>
                        创建中...
                      </>
                    ) : (
                      <>
                        <span className="btn-icon">✨</span>
                        创建AI角色
                      </>
                    )}
                  </button>
                  <button 
                    className="btn-draft" 
                    onClick={handleSaveDraft}
                    disabled={isCreatingAI}
                  >
                    <span className="btn-icon">💾</span>
                    保存草稿
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'aiLibrary':
        return (
          <div className="dashboard-content">
            <h1 className="dashboard-title">AI角色库</h1>
            
            {/* 筛选标签 */}
            <div className="ai-library-filters" style={{ marginBottom: '20px' }}>
              <button 
                className={`filter-btn ${aiLibraryType === 'public' ? 'active' : ''}`}
                onClick={() => loadAICharacters('public')}
              >
                公开角色
              </button>
              <button 
                className={`filter-btn ${aiLibraryType === 'my' ? 'active' : ''}`}
                onClick={() => loadAICharacters('my')}
              >
                我创建的
              </button>
              <button 
                className={`filter-btn ${aiLibraryType === 'favorited' ? 'active' : ''}`}
                onClick={() => loadAICharacters('favorited')}
              >
                我收藏的
              </button>
            </div>

            {/* 加载状态 */}
            {aiLibraryLoading && (
              <div className="loading-message" style={{ textAlign: 'center', padding: '20px' }}>
                加载中...
              </div>
            )}

            {/* 错误消息 */}
            {aiLibraryError && (
              <div className="error-message" style={{ color: '#e74c3c', textAlign: 'center', padding: '20px' }}>
                {aiLibraryError}
              </div>
            )}

            {/* AI角色列表 */}
            {!aiLibraryLoading && !aiLibraryError && (
              <div className="ai-characters-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                gap: '20px',
                marginTop: '20px'
              }}>
                {aiCharacters.length === 0 ? (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#666' }}>
                    暂无AI角色
                  </div>
                ) : (
                  aiCharacters.map((character) => {
                    console.log('🎭 渲染角色卡片:', { 
                      name: character.name, 
                      nickname: character.nickname,
                      character_id: character.character_id 
                    });
                    return (
                    <div key={character.character_id} className="ai-character-card" style={{
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      padding: '20px',
                      backgroundColor: '#fff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}>
                      <div className="character-header" style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                        <div className="character-avatar" style={{ marginRight: '15px' }}>
                          {character.avatar ? (
                            <img 
                              src={character.avatar} 
                              alt={character.name}
                              style={{ 
                                width: '50px', 
                                height: '50px', 
                                borderRadius: '50%', 
                                objectFit: 'cover' 
                              }}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'block';
                              }}
                            />
                          ) : null}
                          <div style={{ 
                            display: character.avatar ? 'none' : 'flex',
                            width: '50px', 
                            height: '50px', 
                            borderRadius: '50%', 
                            backgroundColor: '#f0f0f0',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px'
                          }}>
                            🤖
                          </div>
                        </div>
                        <div className="character-info">
                          <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{character.name}</h3>
                          <p style={{ 
                            margin: '0', 
                            color: '#8e44ad', 
                            fontSize: '14px',
                            fontWeight: '500',
                            backgroundColor: '#f8f9fa',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            display: 'inline-block'
                          }}>
                            @{character.nickname || character.name || '未知角色'}
                          </p>
                        </div>
                      </div>
                      
                      {character.description && (
                        <div className="character-description" style={{ marginBottom: '15px' }}>
                          <p style={{ margin: '0', fontSize: '14px', lineHeight: '1.4' }}>
                            {character.description}
                          </p>
                        </div>
                      )}
                      
                      {character.personality && (
                        <div className="character-personality" style={{ marginBottom: '15px' }}>
                          <span style={{ 
                            fontSize: '12px', 
                            color: '#666', 
                            backgroundColor: '#f0f0f0', 
                            padding: '2px 8px', 
                            borderRadius: '12px',
                            marginRight: '8px'
                          }}>
                            性格: {character.personality}
                          </span>
                        </div>
                      )}
                      
                      <div className="character-stats" style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '15px',
                        fontSize: '12px',
                        color: '#666'
                      }}>
                        <span>使用次数: {character.usage_count}</span>
                        <span>点赞数: {character.like_count}</span>
                      </div>
                      
                      <div className="character-actions" style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          className="btn-primary"
                          onClick={() => handleStartAIChat(character)}
                          style={{ flex: 1, padding: '8px 16px', fontSize: '14px' }}
                        >
                          开始聊天
                        </button>
                        <button 
                          className="btn-secondary"
                          style={{ padding: '8px 16px', fontSize: '14px' }}
                        >
                          {character.is_public ? '已公开' : '私有'}
                        </button>
                      </div>
                    </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      case 'live2dTest':
        return (
          <div className="dashboard-content">
            <h1 className="dashboard-title">Live2D角色测试</h1>
            <Live2DCharacter />
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
              className={`menu-item ${activeMenu === 'chat' ? 'active' : ''}`}
              onClick={() => handleMenuClick('chat')}
            >
              <span className="menu-icon">💭</span>
              <span className="menu-text">{t.chat}</span>
            </button>
            <button 
              className={`menu-item ${activeMenu === 'profile' ? 'active' : ''}`}
              onClick={() => handleMenuClick('profile')}
            >
              <span className="menu-icon">👤</span>
              <span className="menu-text">{t.profile}</span>
            </button>
            <button 
              className={`menu-item ${activeMenu === 'findUsers' ? 'active' : ''}`}
              onClick={() => handleMenuClick('findUsers')}
            >
              <span className="menu-icon">🔍</span>
              <span className="menu-text">{t.findUsers}</span>
            </button>
          <button 
            className={`menu-item ${activeMenu === 'createAI' ? 'active' : ''}`}
            onClick={() => handleMenuClick('createAI')}
          >
            <span className="menu-icon">🤖</span>
            <span className="menu-text">{t.createAI}</span>
          </button>
          <button 
            className={`menu-item ${activeMenu === 'aiLibrary' ? 'active' : ''}`}
            onClick={() => handleMenuClick('aiLibrary')}
          >
            <span className="menu-icon">📚</span>
            <span className="menu-text">{t.aiLibrary}</span>
          </button>
          <button 
            className={`menu-item ${activeMenu === 'live2dTest' ? 'active' : ''}`}
            onClick={() => handleMenuClick('live2dTest')}
          >
            <span className="menu-icon">🎭</span>
            <span className="menu-text">{t.live2dTest}</span>
          </button>
          </nav>
        </div>

        {/* 主内容区域 */}
        <div className="dashboard-main">
          {renderContent()}
        </div>
      </div>

      {/* 修改密码弹窗 */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onSuccess={() => {
          // 密码修改成功后的回调
          console.log('密码修改成功');
        }}
      />
    </div>
  );
};

export default DashboardPage;
