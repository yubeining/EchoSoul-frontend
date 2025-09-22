import React, { useState, useRef, useEffect, memo } from 'react';
import '../../styles/components/ChatDialog.css';
import { useChat, ChatMessageUI, ChatUser } from '../../hooks/useChat';
import { debug, info, warn, error as logError } from '../../utils/logger';

interface ChatDialogProps {
  user: ChatUser;
  conversationId?: string;
  characterId?: string; // 新增：AI角色ID
  onSendMessage?: (content: string) => void;
  onClose: () => void;
  isOpen: boolean;
  isPageMode?: boolean; // 新增：是否为页面模式
}

const ChatDialog: React.FC<ChatDialogProps> = memo(({
  user,
  conversationId,
  characterId,
  onSendMessage,
  onClose,
  isOpen,
  isPageMode = false
}) => {
  // 防止重复调用getConversationById的ref
  const isFetchingConversationRef = useRef<boolean>(false);
  // 防抖定时器ref
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [inputValue, setInputValue] = useState('');
  
  // 防抖发送输入状态
  const debouncedSendTyping = (isTyping: boolean) => {
    // 清除之前的定时器
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // 如果正在输入，立即发送
    if (isTyping) {
      sendTyping(true);
    } else {
      // 如果停止输入，延迟500ms后发送停止状态
      typingTimeoutRef.current = setTimeout(() => {
        sendTyping(false);
      }, 500);
    }
  };
  const [messages, setMessages] = useState<ChatMessageUI[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [waitingForAI, setWaitingForAI] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { 
    fetchMessages, 
    sendMessage, 
    currentMessages, 
    currentConversation,
    setOtherUserInfo,
    setCurrentConversationId,
    sendTyping,
    loadHistory,
    waitForAIResponse,
    isTyping,
    fetchConversations,
    getConversationById,
    // AI WebSocket功能
    isAIWebSocketConnected,
    isAISessionActive,
    aiConversationId,
    aiStreamingMessage,
    connectAI,
    startAISession,
    sendAIMessage,
    getAIHistory,
    setAIConversationId,
    clearAIStreamingMessage
  } = useChat();

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 加载会话列表
  useEffect(() => {
    if (isOpen) {
      debug('ChatDialog: 加载会话列表...');
      fetchConversations().catch(error => {
        logError('加载会话列表失败:', error);
      });
    }
  }, [isOpen, fetchConversations]);

  // 重置消息加载状态当conversationId改变时
  useEffect(() => {
    setMessagesLoaded(false);
    setMessages([]);
  }, [conversationId]);

  // WebSocket会话管理
  useEffect(() => {
    if (conversationId && isOpen) {
      // 先获取会话详情，然后判断是否是AI对话
      const checkAndHandleConversation = async () => {
        try {
          // 如果currentConversation为空，先获取会话详情
          let conversationToCheck = currentConversation;
          if (!conversationToCheck && !isFetchingConversationRef.current) {
            debug('currentConversation为空，尝试获取会话详情:', conversationId);
            isFetchingConversationRef.current = true;
            try {
              conversationToCheck = await getConversationById(conversationId);
              if (conversationToCheck) {
                debug('获取到会话详情:', conversationToCheck);
              }
            } finally {
              isFetchingConversationRef.current = false;
            }
          }
          
          // 检查是否是AI对话 - 通过多种方式判断
          const isAIConversation = (
            // 方式1：通过会话详情判断
            (conversationToCheck && conversationToCheck.user2_id === 0) ||
            // 方式3：通过当前AI会话状态判断
            (isAISessionActive && aiConversationId === conversationId)
          );
          
          debug('ChatDialog AI对话判断:', { 
            conversationId, 
            currentConversation: conversationToCheck, 
            user2_id: conversationToCheck?.user2_id,
            isAIConversation,
            isAIWebSocketConnected,
            isAISessionActive,
            aiConversationId
          });
          
          if (isAIConversation) {
            // AI对话：连接AI WebSocket并开始会话
            if (!isAIWebSocketConnected) {
              info('尝试连接AI WebSocket...');
              connectAI().catch(error => {
                logError('AI WebSocket连接失败:', error);
              });
            } else {
              debug('AI WebSocket已连接，跳过连接步骤');
            }
            
            // 设置AI会话ID
            setAIConversationId(conversationId);
            // 同时设置当前会话ID，确保currentConversation被正确设置
            setCurrentConversationId(conversationId);
            
            // 获取AI角色信息并开始会话
            const initializeAISession = async () => {
              try {
                debug('初始化AI会话 - 接收到的参数:', { characterId, user: user.id });
                
                let aiCharacterId = characterId;
                
                // 如果还是没有，尝试通过API获取角色详情
                if (!aiCharacterId) {
                  debug('尝试通过API获取AI角色信息...');
                  // 这里可以添加获取角色信息的逻辑
                  // 暂时使用默认值
                  aiCharacterId = 'char_001';
                  debug('使用默认AI角色ID:', aiCharacterId);
                }
                
                info('开始AI会话:', { aiCharacterId, conversationId, isAIWebSocketConnected });
                startAISession(aiCharacterId, conversationId);
              } catch (error) {
                logError('初始化AI会话失败:', error);
                // 回退到默认角色ID
                const aiCharacterId = 'char_001';
                startAISession(aiCharacterId, conversationId);
              }
            };
            
            initializeAISession();
            
            // 加载AI对话历史
            getAIHistory(conversationId);
          } else {
            // 普通用户对话：使用原有逻辑
            setCurrentConversationId(conversationId);
            loadHistory(conversationId);
          }
        } catch (error) {
          logError('检查会话类型失败:', error);
          // 发生错误时，默认按普通用户对话处理
          setCurrentConversationId(conversationId);
          loadHistory(conversationId);
        }
      };
      
      checkAndHandleConversation();
    }
  }, [conversationId, isOpen, setCurrentConversationId, loadHistory, connectAI, setAIConversationId, getAIHistory, user.id, currentConversation, characterId, isAISessionActive, aiConversationId, getConversationById, isAIWebSocketConnected]); // eslint-disable-line react-hooks/exhaustive-deps

  // 清理定时器
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // 设置对方用户信息
  useEffect(() => {
    if (user) {
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
      // 只在消息数量变化时记录日志，避免流式更新时的频繁日志
      if (currentMessages.length !== messages.length) {
        debug('ChatDialog: 接收到新消息列表:', currentMessages.map(m => ({ 
          id: m.id, 
          content: m.content, 
          senderName: m.senderName, 
          timestamp: m.timestamp 
        })));
      }
      setMessages(currentMessages);
    }
  }, [currentMessages, messages.length]);

  // 获取消息列表
  useEffect(() => {
    if (conversationId && isOpen && !messagesLoaded) {
      const loadMessages = async () => {
        setLoading(true);
        try {
          await fetchMessages(conversationId);
          setMessagesLoaded(true);
        } catch (error) {
          logError('获取消息失败，使用模拟数据:', error);
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

  // 监听AI流式消息变化
  useEffect(() => {
    if (aiStreamingMessage) {
      if (aiStreamingMessage.isStreaming) {
        // AI正在流式回复
        setWaitingForAI(true);
      } else {
        // AI回复完成
        setWaitingForAI(false);
        // 清除流式消息状态
        setTimeout(() => {
          clearAIStreamingMessage();
        }, 1000);
      }
    }
  }, [aiStreamingMessage, clearAIStreamingMessage]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !conversationId || sending) return;
    
    const content = inputValue.trim();
    setInputValue('');
    setSending(true);
    
    try {
      // 检查是否是AI对话 - 通过多种方式判断
      const isAIConversation = (
        // 方式1：通过currentConversation判断
        (currentConversation && currentConversation.user2_id === 0) ||
        // 方式2：通过conversationId判断（AI对话的conversationId通常包含特定标识）
        (conversationId && conversationId.includes('ai_')) ||
        // 方式3：通过当前AI会话状态判断
        (isAISessionActive && conversationId)
      );
      
      if (isAIConversation && isAIWebSocketConnected && isAISessionActive) {
        // 使用AI WebSocket发送消息（AI WebSocket服务端会处理消息保存到数据库）
        info('通过AI WebSocket发送消息:', content);
        sendAIMessage(content, 'text');
        
        // 显示AI思考状态
        setWaitingForAI(true);
        debug('显示AI思考状态...');
        
        // AI流式回复会通过useChat hook自动处理，不需要手动等待
      } else if (isAIConversation) {
        // AI对话但WebSocket未连接，回退到HTTP
        warn('AI WebSocket未连接，使用HTTP发送消息');
        const sentMessage = await sendMessage(conversationId, content, 'text');
        
        if (sentMessage) {
          setWaitingForAI(true);
          try {
            await waitForAIResponse(conversationId, user.id);
          } catch (error) {
            logError('等待AI回复失败:', error);
          } finally {
            setWaitingForAI(false);
          }
        }
      } else {
        // 普通用户对话
        const sentMessage = await sendMessage(conversationId, content, 'text');
        if (sentMessage) {
          debug('用户消息发送成功:', sentMessage);
        }
      }
      
      // 如果提供了外部发送消息回调，也调用它
      if (onSendMessage) {
        onSendMessage(content);
      }
    } catch (error) {
      logError('发送消息失败:', error);
      // 发送失败时恢复输入内容
      setInputValue(content);
      setWaitingForAI(false);
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
      minute: '2-digit',
      hour12: false  // 使用24小时制
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
              {/* 显示AI角色标识和连接状态 */}
              {user.id && user.id.startsWith('char_') && (
                <span className="ai-character-badge">
                  🤖 AI角色
                  {isAIWebSocketConnected ? (
                    <span className="ai-connection-status connected">● 已连接</span>
                  ) : (
                    <span className="ai-connection-status disconnected">● 未连接</span>
                  )}
                </span>
              )}
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
            // 判断消息类型和显示位置
            const isCurrentUser = message.senderName === '我';
            const isAIMessage = message.isAIMessage || false;
            const showDate = index === 0 || 
              formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);


            return (
              <div key={message.id}>
                {showDate && (
                  <div className="chat-date-divider">
                    {formatDate(message.timestamp)}
                  </div>
                )}
                <div className={`chat-message ${isCurrentUser ? 'current-user' : 'other-user'} ${isAIMessage ? 'ai-message' : ''}`}>
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
                      <div className="message-time">
                        {formatTime(message.timestamp)}
                        {isAIMessage && message.aiCharacterId && (
                          <span className="ai-character-badge">
                            🤖 {message.aiCharacterId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {/* 输入状态显示 */}
        {isTyping && Object.keys(isTyping).length > 0 && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="typing-text">
              {Object.keys(isTyping).filter(userId => isTyping[parseInt(userId)]).length > 0 && '正在输入...'}
            </span>
          </div>
        )}
        
        {/* AI正在思考指示器 */}
        {waitingForAI && (
          <div className="ai-thinking-indicator">
            <div className="ai-thinking-avatar">
              <span className="ai-icon">🤖</span>
            </div>
            <div className="ai-thinking-content">
              <div className="ai-thinking-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="ai-thinking-text">AI正在思考中...</span>
            </div>
          </div>
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
            onChange={(e) => {
              setInputValue(e.target.value);
              // 使用防抖发送输入状态
              debouncedSendTyping(e.target.value.length > 0);
            }}
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
