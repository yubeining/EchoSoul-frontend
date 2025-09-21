import React, { useState, useEffect } from 'react';
import '../../styles/pages/ChatPage.css';
import Navigation from '../../components/layout/Navigation';
import ChatDialog from '../../components/common/ChatDialog';
import { useChat, ChatUser } from '../../hooks/useChat';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { userApi, aiCharacterApi, aiChatApi } from '../../services/api';

interface ChatPageProps {
  onNavigate: (page: string) => void;
  language: string;
  onLanguageChange: (language: string) => void;
  chatUserId?: string; // 从URL参数获取的用户ID
  conversationId?: string; // 从URL参数获取的会话ID
  chatUserUid?: string; // 从URL参数获取的用户UID
}

const ChatPage: React.FC<ChatPageProps> = ({ 
  onNavigate, 
  language, 
  onLanguageChange,
  chatUserId,
  conversationId,
  chatUserUid
}) => {
  const [currentChatUser, setCurrentChatUser] = useState<ChatUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { getOrCreateConversation, setOtherUserInfo } = useChat();
  const { connect: connectWebSocket, disconnect: disconnectWebSocket, isConnected } = useWebSocket();

  // WebSocket连接管理
  useEffect(() => {
    if (user && !isConnected) {
      console.log('🔌 进入聊天页面，建立WebSocket连接');
      connectWebSocket().catch(error => {
        console.error('❌ WebSocket连接失败:', error);
      });
    }

    // 组件卸载时断开WebSocket连接
    return () => {
      if (isConnected) {
        console.log('🔌 离开聊天页面，断开WebSocket连接');
        disconnectWebSocket();
      }
    };
  }, [user, isConnected, connectWebSocket, disconnectWebSocket]);

  // 初始化聊天
  useEffect(() => {
    const initializeChat = async () => {
      console.log('🚀 ChatPage 初始化，参数:', { chatUserId, conversationId, chatUserUid, user: user?.id });
      console.log('🔍 当前URL:', window.location.href);
      console.log('🔍 URL参数解析:', {
        search: window.location.search,
        chatUserUid: chatUserUid,
        conversationId: conversationId,
        chatUserId: chatUserId
      });
      console.log('🔄 useEffect 执行时间:', new Date().toISOString());
      
      if (!user) {
        console.log('⚠️ 用户未登录，跳过初始化');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

      // 优先使用UID获取用户信息
      if (chatUserUid) {
        try {
          console.log('使用UID获取用户信息:', chatUserUid);
          
          // 检查是否是AI角色ID（以char_开头）
          if (chatUserUid.startsWith('char_')) {
            console.log('检测到AI角色ID，获取AI角色信息:', chatUserUid);
            const response = await aiCharacterApi.getCharacterDetail(chatUserUid);
            console.log('根据AI角色ID获取信息响应:', response);
            
            if (response.code === 1) {
              const aiCharacter = response.data.character;
              console.log('找到AI角色:', aiCharacter);
              
              const chatUser: ChatUser = {
                id: aiCharacter.id.toString(),
                username: aiCharacter.nickname,
                nickname: aiCharacter.name,
                avatar: aiCharacter.avatar || undefined,
                status: 'online'
              };
              
              setCurrentChatUser(chatUser);
              
              // 设置AI角色信息到useChat hook中
              setOtherUserInfo({
                id: aiCharacter.id,
                nickname: aiCharacter.name,
                avatar: aiCharacter.avatar || undefined
              });
              
              console.log('AI角色模式初始化完成，角色信息已加载');
            } else {
              throw new Error(response.msg || '获取AI角色信息失败');
            }
          } else {
            // 普通用户处理逻辑
            const response = await userApi.getUserByUid(chatUserUid);
            console.log('根据UID获取用户信息响应:', response);
            
            if (response.code === 200 || response.code === 1) {
              const targetUser = response.data.user;
              console.log('找到目标用户:', targetUser);
              
              const chatUser: ChatUser = {
                id: targetUser.id.toString(),
                username: targetUser.username,
                nickname: targetUser.nickname,
                avatar: targetUser.avatar || undefined,
                status: 'online'
              };
              
              setCurrentChatUser(chatUser);
              
              // 设置对方用户信息到useChat hook中
              setOtherUserInfo({
                id: targetUser.id,
                nickname: targetUser.nickname,
                avatar: targetUser.avatar || undefined
              });
              
              console.log('UID模式初始化完成，用户信息已加载');
            } else {
              throw new Error(response.msg || '获取用户信息失败');
            }
          }
        } catch (err) {
          console.error('根据UID获取信息失败:', err);
          setError('获取信息失败');
        }
        } else if (conversationId) {
          // 如果有会话ID，需要先获取角色ID才能调用API
          if (!chatUserUid) {
            console.error('缺少角色ID，无法获取会话信息');
            setError('缺少角色ID');
            return;
          }
          
          try {
            console.log('使用会话ID和角色ID初始化聊天:', { conversationId, chatUserUid });
            
            // 调用API获取会话信息和角色信息
            const response = await aiChatApi.createAIConversation({ character_id: chatUserUid });
            console.log('获取会话信息响应:', response);
            
            if (response.code === 1 && response.data) {
              const { character_info } = response.data;
              console.log('获取到角色信息:', character_info);
              
              // 使用真实的角色信息创建ChatUser对象
              const chatUser: ChatUser = {
                id: character_info.character_id,
                username: character_info.name,
                nickname: character_info.nickname,
                avatar: character_info.avatar || undefined,
                status: 'online'
              };
              
              setCurrentChatUser(chatUser);
              
              // 设置AI角色信息到useChat hook中
              setOtherUserInfo({
                id: character_info.id,
                nickname: character_info.nickname,
                avatar: character_info.avatar || undefined
              });
              
              console.log('会话ID模式初始化完成，角色信息已加载');
            } else {
              throw new Error(response.msg || '获取会话信息失败');
            }
          } catch (err) {
            console.error('获取会话信息失败:', err);
            // 如果获取失败，使用临时数据
            const tempChatUser: ChatUser = {
              id: 'unknown',
              username: 'Loading...',
              nickname: '正在加载...',
              avatar: undefined,
              status: 'online'
            };
            setCurrentChatUser(tempChatUser);
            setError('获取会话信息失败');
          }
        } else if (chatUserId) {
          // 如果有用户ID，直接获取用户信息并创建会话
          try {
            console.log('获取用户ID:', chatUserId);
            // 验证用户ID是否为有效数字
            const userId = parseInt(chatUserId);
            if (isNaN(userId)) {
              throw new Error('无效的用户ID格式');
            }
            // 直接根据用户ID获取用户信息
            const response = await userApi.getUserById(userId);
            console.log('用户信息响应:', response);
            
            if (response.code === 200 || response.code === 1) {
              const targetUser = response.data;
              console.log('找到目标用户:', targetUser);
              
              const chatUser: ChatUser = {
                id: targetUser.id.toString(),
                username: targetUser.username,
                nickname: targetUser.nickname,
                avatar: targetUser.avatar || undefined,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatUserId, conversationId, chatUserUid, user]);

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
                    {currentChatUser?.avatar ? (
                      <div className="character-avatar">
                        <img 
                          src={currentChatUser.avatar} 
                          alt={currentChatUser.nickname}
                          style={{ 
                            width: '120px', 
                            height: '120px', 
                            borderRadius: '50%', 
                            objectFit: 'cover',
                            border: '3px solid rgba(255, 255, 255, 0.3)'
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'block';
                          }}
                        />
                        <div className="character-placeholder-icon" style={{ display: 'none' }}>🤖</div>
                      </div>
                    ) : (
                      <div className="character-placeholder-icon">
                        {currentChatUser?.id && currentChatUser.id.startsWith('char_') ? '🤖' : '🎭'}
                      </div>
                    )}
                    <div className="character-placeholder-text">
                      {currentChatUser?.id && currentChatUser.id.startsWith('char_') ? 'AI角色' : 'Live2D 角色'}
                    </div>
                    <div className="character-placeholder-subtext">
                      {currentChatUser?.nickname ? `${currentChatUser.nickname} 已就绪` : '即将加载...'}
                    </div>
                  </div>
                  
                  {/* 角色信息 */}
                  <div className="character-info">
                    <div className="character-name">{currentChatUser?.nickname || '正在加载...'}</div>
                    <div className="character-status">
                      在线 • 正在聊天
                      {/* 显示AI角色标识 */}
                      {currentChatUser?.id && currentChatUser.id.startsWith('char_') && (
                        <span className="ai-character-indicator">🤖 AI角色</span>
                      )}
                    </div>
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
