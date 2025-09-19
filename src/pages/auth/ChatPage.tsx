import React, { useState, useEffect } from 'react';
import '../../styles/pages/ChatPage.css';
import Navigation from '../../components/layout/Navigation';
import ChatDialog from '../../components/common/ChatDialog';
import { useChat, ChatUser } from '../../hooks/useChat';
import { useAuth } from '../../contexts/AuthContext';
import { userApi, chatApi, Conversation } from '../../services/api';

interface ChatPageProps {
  onNavigate: (page: string) => void;
  language: string;
  onLanguageChange: (language: string) => void;
  chatUserId?: string; // 从URL参数获取的用户ID
  conversationId?: string; // 从URL参数获取的会话ID
}

const ChatPage: React.FC<ChatPageProps> = ({ 
  onNavigate, 
  language, 
  onLanguageChange,
  chatUserId,
  conversationId 
}) => {
  const [currentChatUser, setCurrentChatUser] = useState<ChatUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { getOrCreateConversation } = useChat();

  // 初始化聊天
  useEffect(() => {
    const initializeChat = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        if (conversationId) {
          // 如果有会话ID，从会话列表中查找对应的会话
          try {
            console.log('查找会话ID:', conversationId);
            
            // 先获取会话列表，然后从中找到对应的会话
            const conversationsResponse = await chatApi.getConversations();
            if (conversationsResponse.code === 200 || conversationsResponse.code === 1) {
              // 直接使用data，因为API返回的data就是Conversation[]类型
              const conversations = conversationsResponse.data;
              console.log('获取到的会话列表:', conversations);
              
              // 查找匹配的会话
              const conversation = conversations.find((conv: Conversation) => conv.conversation_id === conversationId);
              if (conversation) {
                console.log('找到匹配的会话:', conversation);
                
                // 确定对方用户ID（当前用户不是user1就是user2）
                const otherUserId = conversation.user1_id === user?.id ? conversation.user2_id : conversation.user1_id;
                console.log('对方用户ID:', otherUserId);
                
                // 获取对方用户信息
                try {
                  const userResponse = await userApi.searchUsers(`user_id:${otherUserId}`, 1, 1);
                  console.log('用户搜索响应:', userResponse);
                  
                  if (userResponse.code === 200 && userResponse.data.users && userResponse.data.users.length > 0) {
                    const targetUser = userResponse.data.users[0];
                    console.log('获取到对方用户信息:', targetUser);
                    
                    const chatUser: ChatUser = {
                      id: targetUser.id.toString(),
                      username: targetUser.username,
                      nickname: targetUser.nickname,
                      avatar: targetUser.avatar,
                      status: 'online'
                    };
                    setCurrentChatUser(chatUser);
                  } else {
                    throw new Error('用户信息获取失败');
                  }
                } catch (userError) {
                  console.warn('获取用户信息失败，使用模拟数据:', userError);
                  // 使用模拟数据作为备用
                  const mockUser: ChatUser = {
                    id: otherUserId.toString(),
                    username: `user_${otherUserId}`,
                    nickname: conversation.conversation_name || `用户${otherUserId}`,
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUserId}`,
                    status: 'online'
                  };
                  setCurrentChatUser(mockUser);
                }
              } else {
                console.error('未找到匹配的会话，conversationId:', conversationId);
                setError('未找到指定的会话');
              }
            } else {
              setError('获取会话列表失败');
            }
          } catch (err) {
            console.error('获取会话详情失败:', err);
            setError('获取会话详情失败');
          }
        } else if (chatUserId) {
          // 如果有用户ID，搜索用户并创建会话
          try {
            console.log('搜索用户ID:', chatUserId);
            // 使用user_id:前缀来搜索特定用户ID
            const response = await userApi.searchUsers(`user_id:${chatUserId}`, 1, 1);
            console.log('用户搜索响应:', response);
            
            if (response.code === 200 && response.data.users && response.data.users.length > 0) {
              const targetUser = response.data.users[0];
              console.log('找到目标用户:', targetUser);
              
              const chatUser: ChatUser = {
                id: targetUser.id.toString(),
                username: targetUser.username,
                nickname: targetUser.nickname,
                avatar: targetUser.avatar,
                status: 'offline'
              };
              
              // 创建或获取会话
              const conversation = await getOrCreateConversation(targetUser.id);
              if (conversation) {
                setCurrentChatUser(chatUser);
              } else {
                setError('创建会话失败');
              }
            } else {
              console.warn('未找到用户，使用模拟数据');
              // 如果找不到用户，使用模拟数据
              const mockUser: ChatUser = {
                id: chatUserId,
                username: `user_${chatUserId}`,
                nickname: '爱丽丝',
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${chatUserId}`,
                status: 'online'
              };
              setCurrentChatUser(mockUser);
            }
          } catch (err) {
            console.error('搜索用户失败，使用模拟数据:', err);
            // 如果搜索失败，使用模拟数据
            const mockUser: ChatUser = {
              id: chatUserId,
              username: `user_${chatUserId}`,
              nickname: '爱丽丝',
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${chatUserId}`,
              status: 'online'
            };
            setCurrentChatUser(mockUser);
          }
        } else {
          setError('缺少必要的参数');
        }
      } catch (err) {
        console.error('初始化聊天失败:', err);
        setError('初始化聊天失败');
      } finally {
        setLoading(false);
      }
    };

    initializeChat();
  }, [chatUserId, conversationId, user, getOrCreateConversation]);

  // 发送消息处理（现在由ChatDialog组件内部处理）
  const handleSendMessage = (content: string) => {
    // 这个方法现在主要用于兼容性，实际的消息发送由ChatDialog组件处理
    console.log('消息发送:', content);
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

  if (error || !currentChatUser) {
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
            <div className="error-text">{error || t.noUser}</div>
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
              conversationId={conversationId}
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
