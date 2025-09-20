import React, { useState, useRef, useEffect, memo } from 'react';
import '../../styles/components/ChatDialog.css';
import { useChat, ChatMessageUI, ChatUser } from '../../hooks/useChat';

interface ChatDialogProps {
  user: ChatUser;
  conversationId?: string;
  onSendMessage?: (content: string) => void;
  onClose: () => void;
  isOpen: boolean;
  isPageMode?: boolean; // 新增：是否为页面模式
}

const ChatDialog: React.FC<ChatDialogProps> = memo(({
  user,
  conversationId,
  onSendMessage,
  onClose,
  isOpen,
  isPageMode = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessageUI[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { fetchMessages, sendMessage, currentMessages, setOtherUserInfo } = useChat();

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 重置消息加载状态当conversationId改变时
  useEffect(() => {
    setMessagesLoaded(false);
    setMessages([]);
  }, [conversationId]);

  // 设置对方用户信息
  useEffect(() => {
    if (user) {
      console.log('🔍 ChatDialog设置对方用户信息:', user);
      const userId = parseInt(user.id);
      if (!isNaN(userId)) {
        setOtherUserInfo({
          id: userId,
          nickname: user.nickname,
          avatar: user.avatar
        });
      }
    }
  }, [user, setOtherUserInfo]);

  // 监听currentMessages的变化，同步到本地messages状态
  useEffect(() => {
    if (currentMessages.length > 0) {
      console.log('🔄 同步currentMessages到本地messages:', currentMessages);
      setMessages(currentMessages);
    }
  }, [currentMessages]);

  // 获取消息列表
  useEffect(() => {
    if (conversationId && isOpen && !messagesLoaded) {
      const loadMessages = async () => {
        setLoading(true);
        try {
          console.log('🔄 开始获取消息列表，conversationId:', conversationId);
          await fetchMessages(conversationId);
          console.log('✅ 消息获取完成');
          setMessagesLoaded(true);
        } catch (error) {
          console.error('❌ 获取消息失败，使用模拟数据:', error);
          // 使用模拟消息数据作为备用
          const mockMessages: ChatMessageUI[] = [
            {
              id: '1',
              content: '你好!很高兴认识你',
              senderId: '2',
              senderName: '对方',
              senderAvatar: user.avatar || '',
              timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
              type: 'text'
            },
            {
              id: '2',
              content: `你好${user.nickname}!我也很高兴认识你`,
              senderId: '1',
              senderName: '我',
              senderAvatar: '',
              timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
              type: 'text'
            },
            {
              id: '3',
              content: '你在做什么工作呢?',
              senderId: '2',
              senderName: '对方',
              senderAvatar: user.avatar || '',
              timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
              type: 'text'
            }
          ];
          setMessages(mockMessages);
          setMessagesLoaded(true);
        } finally {
          setLoading(false);
        }
      };
      
      loadMessages();
    }
  }, [conversationId, isOpen, fetchMessages, messagesLoaded, user.avatar, user.nickname]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !conversationId || sending) return;
    
    const content = inputValue.trim();
    setInputValue('');
    setSending(true);
    
    try {
      // 使用聊天Hook发送消息
      const newMessage = await sendMessage(
        conversationId,
        content,
        'text'
      );
      
      if (newMessage) {
        setMessages(prev => [...prev, newMessage]);
      }
      
      // 如果提供了外部发送消息回调，也调用它
      if (onSendMessage) {
        onSendMessage(content);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      // 发送失败时恢复输入内容
      setInputValue(content);
    } finally {
      setSending(false);
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

  return (
    <div className={`chat-dialog ${isPageMode ? 'page-mode' : ''}`}>
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
          ▶
        </button>
      </div>

      {/* 聊天消息区域 */}
      <div className="chat-messages">
        {loading ? (
          <div className="chat-loading">
            <div className="loading-spinner"></div>
            <div className="loading-text">加载消息中...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="chat-empty">
            <div className="empty-icon">💬</div>
            <div className="empty-text">还没有消息，开始聊天吧！</div>
          </div>
        ) : (
          messages.map((message, index) => {
            // 判断是否为当前用户发送的消息
            const isCurrentUser = message.senderName === '我';
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
          })
        )}
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
            disabled={sending}
          />
          <button 
            className="chat-send-btn"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || sending}
          >
            {sending ? '发送中...' : '发送'}
          </button>
        </div>
      </div>
    </div>
  );
});

ChatDialog.displayName = 'ChatDialog';

export default ChatDialog;
