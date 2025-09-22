import React, { useState, useEffect } from 'react';
import '../../styles/pages/ChatPage.css';
import Navigation from '../../components/layout/Navigation';
import ChatDialog from '../../components/common/ChatDialog';
import { ChatUser, useChat } from '../../hooks/useChat';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { userApi, aiCharacterApi, aiChatApi, chatApi } from '../../services/api';

interface ChatPageProps {
  onNavigate: (page: string) => void;
  language: string;
  onLanguageChange: (language: string) => void;
  chatUserId?: string; // 从URL参数获取的用户ID
  conversationId?: string; // 从URL参数获取的会话ID
  chatUserUid?: string; // 从URL参数获取的用户UID
  chatUserNickname?: string; // 从URL参数获取的用户昵称
}

const ChatPage: React.FC<ChatPageProps> = ({ 
  onNavigate, 
  language, 
  onLanguageChange,
  chatUserId,
  conversationId,
  chatUserUid,
  chatUserNickname
}) => {
  const [currentChatUser, setCurrentChatUser] = useState<ChatUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actualConversationId, setActualConversationId] = useState<string | null>(conversationId || null);
  
  const { user } = useAuth();
  const { connect: connectWebSocket, disconnect: disconnectWebSocket, isConnected } = useWebSocket();
  
  // 使用useChat hook管理聊天状态
  const { setCurrentConversationId, setOtherUserInfo } = useChat();

  // WebSocket连接管理
  useEffect(() => {
    if (user && !isConnected) {
      connectWebSocket().catch(error => {
        console.error('❌ WebSocket连接失败:', error);
      });
    }

    // 组件卸载时断开WebSocket连接
    return () => {
      if (isConnected) {
        disconnectWebSocket();
      }
    };
  }, [user, isConnected, connectWebSocket, disconnectWebSocket]);

  // 初始化聊天
  useEffect(() => {
    const initializeChat = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 优先使用UID获取用户信息
        if (chatUserUid) {
          if (chatUserUid.startsWith('char_')) {
            const response = await aiCharacterApi.getCharacterDetail(chatUserUid);
            
            if (response.code === 200 || response.code === 1) {
              const aiCharacter = response.data.character;
              
              setCurrentChatUser({
                id: aiCharacter.character_id,
                username: aiCharacter.character_id,
                nickname: aiCharacter.name,
                avatar: aiCharacter.avatar || '',
                status: 'online'
              });
              
              // 设置其他用户信息
              setOtherUserInfo({
                id: parseInt(aiCharacter.character_id.replace('char_', '')),
                nickname: aiCharacter.name,
                avatar: aiCharacter.avatar || undefined
              });
            } else {
              setError('获取AI角色信息失败');
            }
          } else {
            try {
              const response = await userApi.getUserByUid(chatUserUid);
              
              if (response.code === 200 || response.code === 1) {
                const targetUser = response.data.user;
                
                setCurrentChatUser({
                  id: targetUser.id.toString(),
                  username: targetUser.uid,
                  nickname: targetUser.nickname,
                  avatar: targetUser.avatar || '',
                  status: 'online'
                });
                
                // 设置其他用户信息
                setOtherUserInfo({
                  id: targetUser.id,
                  nickname: targetUser.nickname,
                  avatar: targetUser.avatar || undefined
                });
              } else {
                throw new Error('获取用户信息失败');
              }
            } catch (error) {
              console.error('获取用户信息失败，使用传递的参数:', error);
              
              // 使用传递的参数作为后备
              const fallbackUserId = chatUserUid || 'unknown';
              const fallbackNickname = chatUserNickname || `用户${fallbackUserId}`;
              
              setCurrentChatUser({
                id: fallbackUserId,
                username: fallbackUserId,
                nickname: fallbackNickname,
                avatar: '',
                status: 'online'
              });
              
              // 设置其他用户信息
              setOtherUserInfo({
                id: parseInt(fallbackUserId) || 0,
                nickname: fallbackNickname,
                avatar: undefined
              });
            }
          }
        } else if (conversationId && chatUserUid) {
          // 使用会话ID和角色ID初始化聊天
          const response = await aiChatApi.createAIConversation({ character_id: chatUserUid });
          
          if (response.code === 200 || response.code === 1) {
            const { character_info } = response.data;
            
            setCurrentChatUser({
              id: character_info.character_id,
              username: character_info.character_id,
              nickname: character_info.name,
              avatar: character_info.avatar || '',
              status: 'online'
            });
            
            // 设置会话ID
            setActualConversationId(response.data.conversation_id);
            setCurrentConversationId(response.data.conversation_id);
            
            // 设置其他用户信息
            setOtherUserInfo({
              id: parseInt(character_info.character_id.replace('char_', '')),
              nickname: character_info.name,
              avatar: character_info.avatar || undefined
            });
          } else {
            setError('获取会话信息失败');
          }
        } else if (chatUserId) {
          // 使用用户ID初始化聊天
          const userId = parseInt(chatUserId);
          if (isNaN(userId)) {
            setError('无效的用户ID');
            return;
          }

          const response = await userApi.getUserById(userId);
          
          if (response.code === 200 || response.code === 1) {
            const targetUser = response.data;
            
            setCurrentChatUser({
              id: targetUser.id.toString(),
              username: targetUser.uid,
              nickname: targetUser.nickname,
              avatar: targetUser.avatar || '',
              status: 'online'
            });
            
            // 设置其他用户信息
            setOtherUserInfo({
              id: targetUser.id,
              nickname: targetUser.nickname,
              avatar: targetUser.avatar || undefined
            });
            
            // 如果没有conversationId，尝试获取或创建会话
            if (!conversationId) {
              try {
                const convResponse = await chatApi.getOrCreateConversation(userId);
                if (convResponse.code === 200 || convResponse.code === 1) {
                  setActualConversationId(convResponse.data.conversation_id);
                  setCurrentConversationId(convResponse.data.conversation_id);
                }
              } catch (err) {
                console.error('获取会话失败:', err);
              }
            }
          } else {
            setError('获取用户信息失败');
          }
        } else {
          setError('缺少必要的聊天参数');
        }
      } catch (error: any) {
        setError('初始化聊天失败: ' + (error.message || '未知错误'));
      } finally {
        setLoading(false);
      }
    };

    initializeChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatUserId, conversationId, chatUserUid, user]);

  // 设置当前会话ID
  useEffect(() => {
    if (actualConversationId) {
      setCurrentConversationId(actualConversationId);
    }
  }, [actualConversationId, setCurrentConversationId]);

  // 发送消息处理（现在由ChatDialog组件内部处理）
  const handleSendMessage = (content: string) => {
    // 这个方法现在主要用于兼容性，实际的消息发送由ChatDialog组件处理
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
    chat: '聊天',
    backToChatHistory: '返回聊天记录',
    loading: '加载中...',
    error: '错误',
    retry: '重试'
  };

  const t = (key: keyof typeof translations): string => {
    return translations[key];
  };

  if (loading) {
    return (
      <div className="chat-page">
        <Navigation 
          currentPage="chat"
          language={language}
          onNavigate={onNavigate}
          onLanguageChange={onLanguageChange}
        />
        <div className="chat-loading">
          <div className="loading-spinner"></div>
          <p>{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-page">
        <Navigation 
          currentPage="chat"
          language={language}
          onNavigate={onNavigate}
          onLanguageChange={onLanguageChange}
        />
        <div className="chat-error">
          <h2>{t('error')}</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            {t('retry')}
          </button>
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
          onNavigate={onNavigate}
          onLanguageChange={onLanguageChange}
        />
        <div className="chat-error">
          <h2>{t('error')}</h2>
          <p>未找到聊天对象</p>
          <button onClick={handleBackToChatHistory}>
            {t('backToChatHistory')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <Navigation 
        currentPage="chat"
        language={language}
        onNavigate={onNavigate}
        onLanguageChange={onLanguageChange}
      />
      
      <div className="chat-layout">
        {/* 左侧内容区域 - 60%宽度 */}
        <div className="chat-main-content">
          <div className="content-placeholder">
            <h2>聊天内容</h2>
            <p>与 {currentChatUser.nickname} 的对话</p>
          </div>
        </div>
        
        {/* 右侧聊天框 - 40%宽度 */}
        <div className="chat-sidebar">
          <div className="chat-header">
            <button 
              className="back-button"
              onClick={handleBackToChatHistory}
              title={t('backToChatHistory')}
            >
              ← {t('backToChatHistory')}
            </button>
            <div className="chat-user-info">
              <img 
                src={currentChatUser.avatar || '/default-avatar.png'} 
                alt={currentChatUser.nickname}
                className="user-avatar"
              />
              <div className="user-details">
                <h3>{currentChatUser.nickname}</h3>
                <p>{currentChatUser.id.startsWith('char_') ? 'AI角色' : '用户'}</p>
              </div>
            </div>
          </div>
          
          <div className="chat-content">
            <ChatDialog
              user={currentChatUser}
              conversationId={actualConversationId || undefined}
              characterId={chatUserUid}
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