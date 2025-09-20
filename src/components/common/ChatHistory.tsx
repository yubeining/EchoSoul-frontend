import React, { useEffect, useState } from 'react';
import '../../styles/components/ChatHistory.css';
import { useChat, ChatHistoryItem } from '../../hooks/useChat';

interface ChatHistoryProps {
  onChatClick: (chatId: string) => void;
  onNewChat: () => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
  onChatClick,
  onNewChat
}) => {
  const { getChatHistory, loading, error, conversations, fetchConversations } = useChat();
  const [chatList, setChatList] = useState<ChatHistoryItem[]>([]);

  // 组件挂载时主动获取会话列表
  useEffect(() => {
    console.log('📋 ChatHistory组件挂载，开始获取会话列表');
    fetchConversations();
  }, [fetchConversations]);

  // 当会话列表更新时，获取聊天历史
  useEffect(() => {
    const updateChatHistory = async () => {
      if (conversations.length > 0) {
        try {
          const history = await getChatHistory();
          setChatList(history);
        } catch (err) {
          console.error('获取聊天历史失败:', err);
        }
      }
    };

    updateChatHistory();
  }, [conversations, getChatHistory]);
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
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
    const isFromCurrentUser = message.senderId === currentUserId;
    const prefix = isFromCurrentUser ? '我: ' : '';
    return prefix + message.content;
  };

  return (
    <div className="chat-history">
      <div className="chat-history-header">
        <h2>聊天记录</h2>
        <button className="new-chat-btn" onClick={onNewChat}>
          <span className="new-chat-icon">+</span>
          新建聊天
        </button>
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
        ) : chatList.length === 0 ? (
          <div className="empty-chat-list">
            <div className="empty-icon">💬</div>
            <div className="empty-text">暂无聊天记录</div>
            <div className="empty-hint">开始与用户聊天吧！</div>
          </div>
        ) : (
          chatList.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${chat.isPinned ? 'pinned' : ''}`}
              onClick={() => onChatClick(chat.id)}
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
                    {formatLastMessage(chat.lastMessage, 'current_user')}
                  </div>
                  {chat.unreadCount > 0 && (
                    <div className="unread-badge">
                      {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default ChatHistory;



