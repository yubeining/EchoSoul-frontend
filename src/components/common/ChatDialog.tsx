import React, { useState, useRef, useEffect } from 'react';
import '../../styles/components/ChatDialog.css';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
}

export interface ChatUser {
  id: string;
  username: string;
  nickname: string;
  avatar?: string;
  status: 'online' | 'offline';
  lastActive?: string;
}

interface ChatDialogProps {
  user: ChatUser;
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  onClose: () => void;
  isOpen: boolean;
  isPageMode?: boolean; // 新增：是否为页面模式
}

const ChatDialog: React.FC<ChatDialogProps> = ({
  user,
  messages,
  onSendMessage,
  onClose,
  isOpen,
  isPageMode = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return '今天';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '昨天';
    } else {
      return date.toLocaleDateString('zh-CN', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (!isOpen) return null;

  // 页面模式：直接返回聊天内容，不需要overlay
  if (isPageMode) {
    return (
      <div className="chat-dialog chat-dialog-page">
        {/* 聊天头部 */}
        <div className="chat-header">
          <div className="chat-user-info">
            <div className="chat-user-avatar">
              {user.avatar ? (
                <img src={user.avatar} alt={user.nickname} />
              ) : (
                <div className="avatar-placeholder">
                  {user.nickname.charAt(0)}
                </div>
              )}
              <div className={`status-indicator ${user.status}`}></div>
            </div>
            <div className="chat-user-details">
              <div className="chat-user-name">{user.nickname}</div>
              <div className="chat-user-status">
                {user.status === 'online' ? '在线' : '离线'}
                {user.lastActive && ` • ${user.lastActive}`}
              </div>
            </div>
          </div>
          <button className="chat-close-btn" onClick={onClose}>
            →
          </button>
        </div>

        {/* 聊天消息区域 */}
        <div className="chat-messages">
          {messages.map((message, index) => {
            const isCurrentUser = message.senderId === 'current_user';
            const showDate = index === 0 || 
              formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);

            return (
              <div key={message.id}>
                {showDate && (
                  <div className="chat-date-divider">
                    {formatDate(message.timestamp)}
                  </div>
                )}
                <div className={`chat-message ${isCurrentUser ? 'current-user' : 'other-user'}`}>
                  {!isCurrentUser && (
                    <div className="message-avatar">
                      {message.senderAvatar ? (
                        <img src={message.senderAvatar} alt={message.senderName} />
                      ) : (
                        <div className="avatar-placeholder">
                          {message.senderName.charAt(0)}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="message-content">
                    <div className="message-bubble">
                      <div className="message-text">{message.content}</div>
                      <div className="message-time">{formatTime(message.timestamp)}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div className="chat-input-area">
          <div className="chat-input-container">
            <input
              ref={inputRef}
              type="text"
              className="chat-input"
              placeholder={`发送消息给 ${user.nickname}...`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button
              className="chat-send-btn"
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
            >
              发送
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 弹窗模式：返回带overlay的对话框
  return (
    <div className="chat-dialog-overlay">
      <div className="chat-dialog">
        {/* 聊天头部 */}
        <div className="chat-header">
          <div className="chat-user-info">
            <div className="chat-user-avatar">
              {user.avatar ? (
                <img src={user.avatar} alt={user.nickname} />
              ) : (
                <div className="avatar-placeholder">
                  {user.nickname.charAt(0)}
                </div>
              )}
              <div className={`status-indicator ${user.status}`}></div>
            </div>
            <div className="chat-user-details">
              <div className="chat-user-name">{user.nickname}</div>
              <div className="chat-user-status">
                {user.status === 'online' ? '在线' : '离线'}
                {user.lastActive && ` • ${user.lastActive}`}
              </div>
            </div>
          </div>
          <button className="chat-close-btn" onClick={onClose}>
            →
          </button>
        </div>

        {/* 聊天消息区域 */}
        <div className="chat-messages">
          {messages.map((message, index) => {
            const isCurrentUser = message.senderId === 'current_user';
            const showDate = index === 0 || 
              formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);

            return (
              <div key={message.id}>
                {showDate && (
                  <div className="chat-date-divider">
                    {formatDate(message.timestamp)}
                  </div>
                )}
                <div className={`chat-message ${isCurrentUser ? 'current-user' : 'other-user'}`}>
                  {!isCurrentUser && (
                    <div className="message-avatar">
                      {message.senderAvatar ? (
                        <img src={message.senderAvatar} alt={message.senderName} />
                      ) : (
                        <div className="avatar-placeholder">
                          {message.senderName.charAt(0)}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="message-content">
                    <div className="message-bubble">
                      <div className="message-text">{message.content}</div>
                      <div className="message-time">{formatTime(message.timestamp)}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div className="chat-input-area">
          <div className="chat-input-container">
            <input
              ref={inputRef}
              type="text"
              className="chat-input"
              placeholder={`发送消息给 ${user.nickname}...`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button
              className="chat-send-btn"
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
            >
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatDialog;



