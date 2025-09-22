import React, { useEffect, useState } from 'react';
import '../../styles/components/ChatHistory.css';
import { useChat, ChatHistoryItem } from '../../hooks/useChat';
import { useAuth } from '../../contexts/AuthContext';
import { debug, info, error as logError } from '../../utils/logger';

interface ChatHistoryProps {
  onChatClick: (conversationId: string, userInfo: { id: string; nickname: string; avatar?: string }) => void;
  onNewChat: () => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
  onChatClick,
  onNewChat
}) => {
  const { user } = useAuth();
  const { loading, error, fetchConversations } = useChat();
  const [chatList, setChatList] = useState<ChatHistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // 组件挂载时获取聊天历史
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const history = await fetchConversations();
        info('ChatHistory: 获取到的聊天历史', history);
        setChatList(history);
      } catch (err) {
        logError('获取聊天历史失败:', err);
        setChatList([]);
      }
    };

    loadChatHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 只在组件挂载时执行一次

  // 刷新聊天记录
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const history = await fetchConversations();
      setChatList(history);
    } catch (err) {
      logError('刷新聊天记录失败:', err);
    } finally {
      setIsRefreshing(false);
    }
  };
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false  // 使用24小时制
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('zh-CN', { 
        weekday: 'short' 
      });
    } else {
      return date.toLocaleDateString('zh-CN', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const formatLastMessage = (message: ChatHistoryItem['lastMessage'], currentUserId: string) => {
    if (!message || !message.content) {
      return '暂无消息';
    }
    
    const isFromCurrentUser = message.senderId === currentUserId;
    const prefix = isFromCurrentUser ? '我: ' : '';
    
    // 限制消息预览长度
    const maxLength = 50;
    const content = message.content.length > maxLength 
      ? message.content.substring(0, maxLength) + '...'
      : message.content;
    
    return prefix + content;
  };

  // 过滤聊天列表
  const filteredChatList = chatList.filter(chat => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      chat.user.nickname.toLowerCase().includes(query) ||
      chat.user.username.toLowerCase().includes(query) ||
      chat.lastMessage.content.toLowerCase().includes(query)
    );
  });

  return (
    <div className="chat-history">
      <div className="chat-history-header">
        <h2>聊天记录</h2>
        <div className="header-actions">
          <button 
            className="refresh-btn" 
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
            title="刷新聊天记录"
          >
            <span className={`refresh-icon ${isRefreshing ? 'spinning' : ''}`}>🔄</span>
          </button>
          <button className="new-chat-btn" onClick={onNewChat}>
            <span className="new-chat-icon">+</span>
            新建聊天
          </button>
        </div>
      </div>

      {/* 搜索框 */}
      <div className="chat-search">
        <div className="search-input-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="搜索聊天记录..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="chat-history-list">
        {loading ? (
          <div className="loading-chat-list">
            <div className="loading-spinner"></div>
            <div className="loading-text">加载聊天记录中...</div>
          </div>
        ) : error ? (
          <div className="error-chat-list">
            <div className="error-icon">⚠️</div>
            <div className="error-text">加载失败</div>
            <div className="error-hint">{error}</div>
          </div>
        ) : filteredChatList.length === 0 ? (
          <div className="empty-chat-list">
            <div className="empty-icon">🔍</div>
            <div className="empty-text">
              {searchQuery ? '未找到匹配的聊天记录' : '暂无聊天记录'}
            </div>
            <div className="empty-hint">
              {searchQuery ? '尝试使用其他关键词搜索' : '开始与用户聊天吧！'}
            </div>
          </div>
        ) : (
          filteredChatList.map((chat) => {
            const handleChatItemClick = () => {
              debug('ChatHistory: 点击聊天项', {
                conversationId: chat.id,
                userInfo: {
                  id: chat.user.id,
                  nickname: chat.user.nickname,
                  avatar: chat.user.avatar
                }
              });
              onChatClick(chat.id, {
                id: chat.user.id,
                nickname: chat.user.nickname,
                avatar: chat.user.avatar
              });
            };
            
            return (
            <div
              key={chat.id}
              className={`chat-item ${chat.isPinned ? 'pinned' : ''}`}
              onClick={handleChatItemClick}
            >
              <div className="chat-item-avatar">
                {chat.user.avatar ? (
                  <img src={chat.user.avatar} alt={chat.user.nickname} />
                ) : (
                  <div className="avatar-placeholder">
                    {chat.user.nickname.charAt(0)}
                  </div>
                )}
                <div className={`status-indicator ${chat.user.status}`}></div>
              </div>

              <div className="chat-item-content">
                <div className="chat-item-header">
                  <div className="chat-item-name">
                    {chat.user.nickname}
                    {chat.isPinned && <span className="pin-icon">📌</span>}
                  </div>
                  <div className="chat-item-time">
                    {formatTime(chat.lastMessage.timestamp)}
                  </div>
                </div>

                <div className="chat-item-preview">
                  <div className="chat-item-message">
                    {formatLastMessage(chat.lastMessage, user?.id.toString() || '')}
                  </div>
                  {chat.unreadCount > 0 && (
                    <div className="unread-badge">
                      {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default ChatHistory;



