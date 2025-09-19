import React, { useState, useEffect } from 'react';
import '../../styles/pages/ChatPage.css';
import Navigation from '../../components/layout/Navigation';
import ChatDialog, { ChatMessage, ChatUser } from '../../components/common/ChatDialog';
import { 
  getUserById, 
  getChatMessages, 
  addMessage, 
  createNewChat 
} from '../../data/mockChatData';

interface ChatPageProps {
  onNavigate: (page: string) => void;
  language: string;
  onLanguageChange: (language: string) => void;
  chatUserId?: string; // 从URL参数获取的用户ID
}

const ChatPage: React.FC<ChatPageProps> = ({ 
  onNavigate, 
  language, 
  onLanguageChange,
  chatUserId 
}) => {
  const [currentChatUser, setCurrentChatUser] = useState<ChatUser | null>(null);
  const [currentChatMessages, setCurrentChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // 初始化聊天
  useEffect(() => {
    if (chatUserId) {
      const chatUser = getUserById(chatUserId);
      if (chatUser) {
        // 创建或获取聊天
        const chatId = createNewChat(chatUser);
        
        // 获取聊天消息
        const messages = getChatMessages(chatId);
        
        setCurrentChatUser(chatUser);
        setCurrentChatMessages(messages);
      }
    }
    setLoading(false);
  }, [chatUserId]);

  // 发送消息处理
  const handleSendMessage = (content: string) => {
    if (!currentChatUser) return;
    
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: 'current_user',
      senderName: '我',
      content,
      timestamp: new Date().toISOString(),
      type: 'text'
    };
    
    // 添加到消息列表
    setCurrentChatMessages(prev => [...prev, newMessage]);
    
    // 添加到Mock数据
    addMessage(currentChatUser.id, newMessage);
    
    // 模拟对方回复（延迟1-3秒）
    setTimeout(() => {
      const replyMessage: ChatMessage = {
        id: `msg_${Date.now()}_reply`,
        senderId: currentChatUser.id,
        senderName: currentChatUser.nickname,
        senderAvatar: currentChatUser.avatar,
        content: `收到你的消息："${content}"`,
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      
      setCurrentChatMessages(prev => [...prev, replyMessage]);
      addMessage(currentChatUser.id, replyMessage);
    }, Math.random() * 2000 + 1000);
  };

  // 返回聊天记录页面
  const handleBackToChatHistory = () => {
    // 导航到dashboard页面，并设置activeMenu为chat
    onNavigate('dashboard');
    // 设置URL参数来指定显示聊天记录
    window.history.pushState({}, '', '/dashboard?menu=chat');
  };

  // 翻译文本
  const translations = {
    zh: {
      title: '聊天',
      backToChat: '返回聊天记录',
      chatWith: '与 {name} 聊天',
      noUser: '未找到用户',
      loading: '加载中...'
    },
    en: {
      title: 'Chat',
      backToChat: 'Back to Chat History',
      chatWith: 'Chat with {name}',
      noUser: 'User not found',
      loading: 'Loading...'
    },
    ja: {
      title: 'チャット',
      backToChat: 'チャット履歴に戻る',
      chatWith: '{name} とチャット',
      noUser: 'ユーザーが見つかりません',
      loading: '読み込み中...'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.zh;

  if (loading) {
    return (
      <div className="chat-page">
        <Navigation 
          currentPage="chat"
          language={language}
          onLanguageChange={onLanguageChange}
          onNavigate={onNavigate}
        />
        <div className="chat-page-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <div className="loading-text">{t.loading}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentChatUser) {
    return (
      <div className="chat-page">
        <Navigation 
          currentPage="chat"
          language={language}
          onLanguageChange={onLanguageChange}
          onNavigate={onNavigate}
        />
        <div className="chat-page-content">
          <div className="error-container">
            <div className="error-icon">❌</div>
            <div className="error-text">{t.noUser}</div>
            <button 
              className="back-button"
              onClick={handleBackToChatHistory}
            >
              {t.backToChat}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <Navigation 
        currentPage="chat"
        language={language}
        onLanguageChange={onLanguageChange}
        onNavigate={onNavigate}
      />
      
      <div className="chat-page-content">
            {/* 左侧角色展示区域 */}
            <div className="chat-left-panel">
              <div className="character-display-area">
                {/* 装饰元素 */}
                <div className="decorative-elements">
                  <div className="decorative-circle"></div>
                  <div className="decorative-circle"></div>
                  <div className="decorative-circle"></div>
                </div>
                
                {/* 角色展示框 */}
                <div className="character-box">
                  {/* 角色占位符 */}
                  <div className="character-placeholder">
                    <div className="character-placeholder-icon">🎭</div>
                    <div className="character-placeholder-text">Live2D 角色</div>
                    <div className="character-placeholder-subtext">即将加载...</div>
                  </div>
                  
                  {/* 角色信息 */}
                  <div className="character-info">
                    <div className="character-name">爱丽丝</div>
                    <div className="character-status">在线 • 正在聊天</div>
                  </div>
                </div>
              </div>
            </div>

        {/* 右侧聊天区域 */}
        <div className="chat-right-panel">
          {/* 聊天头部 */}
          <div className="chat-page-header">
            <button 
              className="back-button"
              onClick={handleBackToChatHistory}
            >
              ← {t.backToChat}
            </button>
            <div className="chat-page-title">
              {t.chatWith.replace('{name}', currentChatUser.nickname)}
            </div>
          </div>

          {/* 聊天内容区域 */}
          <div className="chat-content-area">
            <ChatDialog
              user={currentChatUser}
              messages={currentChatMessages}
              onSendMessage={handleSendMessage}
              onClose={handleBackToChatHistory}
              isOpen={true}
              isPageMode={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
