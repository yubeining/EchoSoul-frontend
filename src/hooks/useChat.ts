import { useState, useCallback, useEffect, useRef } from 'react';
import { chatApi, Conversation, ChatMessage } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useAIWebSocket } from '../contexts/AIWebSocketContext';

// 聊天历史项接口（用于聊天记录列表）
export interface ChatHistoryItem {
  id: string;
  user: {
    id: string;
    username: string;
    nickname: string;
    avatar?: string;
    status: 'online' | 'offline';
  };
  lastMessage: {
    content: string;
    timestamp: string;
    senderId: string;
  };
  unreadCount: number;
  isPinned: boolean;
}

// 聊天用户接口
export interface ChatUser {
  id: string;
  username: string;
  nickname: string;
  avatar?: string;
  status: 'online' | 'offline';
  lastActive?: string;
}

// 聊天消息接口（用于聊天对话框）
export interface ChatMessageUI {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'voice' | 'video' | 'file' | 'emoji';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  replyToMessageId?: string;
  // AI消息相关字段
  isAIMessage?: boolean;
  aiCharacterId?: string | null;
}

// 移除全局状态，使用组件内部状态管理

export const useChat = () => {
  const { user } = useAuth();
  const { 
    isConnected, 
    sendMessage: wsSendMessage, 
    on: wsOn, 
    off: wsOff,
    sendTypingStatus,
    getHistory: wsGetHistory
  } = useWebSocket();
  
  // AI WebSocket功能
  const {
    isConnected: isAIConnected,
    isAISessionActive,
    currentAICharacter,
    currentConversationId: aiConversationId,
    aiStreamingMessage,
    userMessageSent,
    connect: connectAI,
    disconnect: disconnectAI,
    startAISession,
    endAISession,
    sendMessage: sendAIMessage,
    getConversationHistory: getAIHistory,
    setCurrentConversationId: setAIConversationId,
    clearAIStreamingMessage,
    clearUserMessageSent
  } = useAIWebSocket();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [currentMessages, setCurrentMessages] = useState<ChatMessageUI[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<{ id: number; nickname: string; avatar?: string } | null>(null);
  
  // WebSocket相关状态
  const [isTyping, setIsTyping] = useState<{ [userId: number]: boolean }>({});
  const [unreadMessages, setUnreadMessages] = useState<{ [conversationId: string]: number }>({});
  const currentConversationIdRef = useRef<string | null>(null);
  const isFetchingRef = useRef<boolean>(false);
  const waitForAIResponseRef = useRef<((conversationId: string, aiCharacterId: string) => Promise<void>) | null>(null);
  const convertToUIMessageRef = useRef<((message: ChatMessage) => ChatMessageUI) | null>(null);

  // WebSocket事件监听
  useEffect(() => {
    if (!isConnected) return;

    // 监听新消息
    const handleNewMessage = (data: any) => {
      console.log('📨 WebSocket收到新消息:', data);
      
      // 使用统一的AI消息识别逻辑
      const tempMessage: ChatMessage = {
        message_id: data.message_id,
        conversation_id: data.conversation_id,
        sender_id: data.sender_id,
        receiver_id: data.receiver_id || 0,
        content: data.content,
        message_type: data.message_type || 'text',
        file_url: data.file_url || null,
        file_name: data.file_name || null,
        file_size: data.file_size || null,
        is_deleted: 0,
        reply_to_message_id: data.reply_to_message_id || null,
        create_time: data.timestamp,
        update_time: '',
        is_ai_message: data.is_ai_message || false,
        ai_character_id: data.ai_character_id || null,
        sender_name: data.sender_name,
        sender_avatar: data.sender_avatar
      };
      
      // 使用convertToUIMessage转换消息格式
      const newMessage = convertToUIMessage(tempMessage);
      
      console.log('🔄 转换后的消息:', { newMessage, userId: user?.id, senderId: data.sender_id });
      
      // 如果是当前会话的消息
      if (data.conversation_id === currentConversationIdRef.current) {
        setCurrentMessages(prev => {
          let updatedMessages;
          const isCurrentUserMessage = user && data.sender_id === user.id;
          
          if (isCurrentUserMessage) {
            // 查找并替换临时消息
            const tempMessageIndex = prev.findIndex(msg => 
              msg.id.startsWith('temp_') && 
              msg.content === data.content && 
              msg.senderId === user?.id.toString()
            );
            
            if (tempMessageIndex !== -1) {
              // 替换临时消息
              updatedMessages = [...prev];
              updatedMessages[tempMessageIndex] = newMessage;
              console.log('✅ 替换临时消息:', { tempMessageIndex, newMessage });
            } else {
              // 没有找到临时消息，直接添加
              updatedMessages = [...prev, newMessage];
              console.log('➕ 添加当前用户消息:', newMessage);
            }
          } else {
            // 对方消息，直接添加
            updatedMessages = [...prev, newMessage];
            console.log('➕ 添加对方消息:', newMessage);
          }
          
          // 重新按时间排序（从早到晚）
          const sortedMessages = updatedMessages.sort((a, b) => {
            const timeA = new Date(a.timestamp).getTime();
            const timeB = new Date(b.timestamp).getTime();
            return timeA - timeB;
          });
          
          console.log('📋 排序后的消息列表:', sortedMessages.map(m => ({ 
            id: m.id, 
            content: m.content, 
            senderName: m.senderName, 
            timestamp: m.timestamp 
          })));
          
          return sortedMessages;
        });
      } else {
        // 其他会话的消息，增加未读计数
        setUnreadMessages(prev => ({
          ...prev,
          [data.conversation_id]: (prev[data.conversation_id] || 0) + 1
        }));
      }
    };

    // 监听响应消息
    const handleResponse = (data: any) => {
      console.log('📥 WebSocket收到响应:', data);
      
      if (data.original_type === 'get_history' && data.result.success) {
        // 处理历史消息，使用统一的AI消息识别逻辑
        const historyMessages = data.result.messages.map((msg: any) => {
          const tempMessage: ChatMessage = {
            message_id: msg.message_id,
            conversation_id: data.conversation_id || '',
            sender_id: msg.sender_id,
            receiver_id: msg.receiver_id || 0,
            content: msg.content,
            message_type: msg.message_type || 'text',
            file_url: msg.file_url || null,
            file_name: msg.file_name || null,
            file_size: msg.file_size || null,
            is_deleted: msg.is_deleted || 0,
            reply_to_message_id: msg.reply_to_message_id || null,
            create_time: msg.timestamp,
            update_time: '',
            is_ai_message: msg.is_ai_message || false,
            ai_character_id: msg.ai_character_id || null,
            sender_name: msg.sender_name,
            sender_avatar: msg.sender_avatar
          };
          return convertToUIMessageRef.current ? convertToUIMessageRef.current(tempMessage) : tempMessage as any;
        });
        
        // 按时间排序（从早到晚）
        const sortedMessages = historyMessages.sort((a: ChatMessageUI, b: ChatMessageUI) => {
          const timeA = new Date(a.timestamp).getTime();
          const timeB = new Date(b.timestamp).getTime();
          return timeA - timeB;
        });
        
        console.log('📋 WebSocket历史消息:', sortedMessages.map((m: ChatMessageUI) => ({ 
          id: m.id, 
          content: m.content, 
          senderName: m.senderName, 
          timestamp: m.timestamp 
        })));
        
        setCurrentMessages(sortedMessages);
      }
    };

    // 监听用户输入状态
    const handleTypingStatus = (data: { user_id: number; is_typing: boolean }) => {
      if (currentConversationIdRef.current) {
        setIsTyping(prev => ({
          ...prev,
          [data.user_id]: data.is_typing
        }));
      }
    };

    // 注册事件监听器
    wsOn('new_message', handleNewMessage);
    wsOn('response', handleResponse);
    wsOn('typing_status', handleTypingStatus);

    // 清理函数
    return () => {
      wsOff('new_message', handleNewMessage);
      wsOff('response', handleResponse);
      wsOff('typing_status', handleTypingStatus);
    };
  }, [isConnected, wsOn, wsOff, user, otherUser?.avatar, otherUser?.nickname, currentConversationIdRef]); // eslint-disable-line react-hooks/exhaustive-deps

  // 获取会话列表并直接转换为聊天历史（一次调用完成）
  const fetchConversations = useCallback(async (): Promise<ChatHistoryItem[]> => {
    if (!user) {
      return [];
    }
    
    // 防止重复调用
    if (isFetchingRef.current) {
      console.log('🔄 正在获取会话列表中，跳过重复调用');
      return [];
    }
    
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const response = await chatApi.getConversations();
      console.log('📞 获取会话列表响应:', response);
      
      if (response.code === 200 || response.code === 1) {
        // 根据API响应结构，data.conversations 包含会话数组
        const conversationsData = response.data.conversations || [];
        
        console.log('📋 处理后的会话数据:', conversationsData);
        setConversations(conversationsData);
        
        // 直接转换为聊天历史项，避免重复调用
        const chatHistoryItems: ChatHistoryItem[] = conversationsData.map((conv) => {
          const otherUserId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;
          
          return {
            id: conv.conversation_id,
            user: {
              id: otherUserId.toString(),
              username: `user_${otherUserId}`,
              nickname: conv.conversation_name || `用户${otherUserId}`,
              avatar: '',
              status: 'offline'
            },
            lastMessage: {
              content: '暂无消息',
              timestamp: conv.last_message_time || conv.create_time,
              senderId: ''
            },
            unreadCount: 0,
            isPinned: false
          };
        });
        
        console.log('✅ 聊天历史转换完成，数量:', chatHistoryItems.length);
        setError(null);
        return chatHistoryItems;
      } else {
        throw new Error(response.msg || '获取会话列表失败');
      }
    } catch (err) {
      console.error('❌ 获取会话列表失败:', err);
      const errorMessage = err instanceof Error ? err.message : '获取会话列表失败';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [user]);

  // 获取或创建会话
  const getOrCreateConversation = useCallback(async (otherUserId: number) => {
    if (!user) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await chatApi.getOrCreateConversation(otherUserId);
      if (response.code === 200 || response.code === 1) {
        const conversation = response.data;
        setCurrentConversation(conversation);
        
        // 更新会话列表
        setConversations(prev => {
          const existingIndex = prev.findIndex(c => c.conversation_id === conversation.conversation_id);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = conversation;
            return updated;
          } else {
            return [conversation, ...prev];
          }
        });
        
        return conversation;
      } else {
        throw new Error(response.msg || '获取会话失败');
      }
    } catch (err) {
      console.error('获取会话失败:', err);
      setError(err instanceof Error ? err.message : '获取会话失败');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 消息类型检测函数
  const getMessageType = useCallback((message: ChatMessage) => {
    if (message.is_ai_message) {
      // AI消息
      return {
        type: 'ai_reply',
        aiCharacterId: message.ai_character_id,
        displayName: message.ai_character_id ? `AI-${message.ai_character_id}` : 'AI',
        isFromAI: true,
        isFromCurrentUser: false
      };
    } else if (message.receiver_id === 0 && message.ai_character_id) {
      // 用户发给AI的消息
      return {
        type: 'user_to_ai',
        aiCharacterId: message.ai_character_id,
        displayName: '我',
        isFromAI: false,
        isFromCurrentUser: user && message.sender_id === user.id
      };
    } else {
      // 用户间消息
      const isFromCurrentUser = user && message.sender_id === user.id;
      return {
        type: 'user_to_user',
        aiCharacterId: null,
        displayName: isFromCurrentUser ? '我' : (otherUser?.nickname || '对方'),
        isFromAI: false,
        isFromCurrentUser
      };
    }
  }, [user, otherUser]);

  // 将后端消息格式转换为UI消息格式
  const convertToUIMessage = useCallback((message: ChatMessage): ChatMessageUI => {
    const messageType = getMessageType(message);
    
    return {
      id: message.message_id,
      senderId: message.sender_id.toString(),
      senderName: messageType.displayName,
      senderAvatar: messageType.isFromAI ? 
        (message.ai_character_id ? `/avatars/ai-${message.ai_character_id}.jpg` : '') : 
        (messageType.isFromCurrentUser ? '' : (otherUser?.avatar || '')),
      content: message.content,
      timestamp: message.create_time,
      type: message.message_type,
      fileUrl: message.file_url || undefined,
      fileName: message.file_name || undefined,
      fileSize: message.file_size || undefined,
      replyToMessageId: message.reply_to_message_id || undefined,
      // 添加AI相关字段
      isAIMessage: messageType.isFromAI,
      aiCharacterId: messageType.aiCharacterId
    };
  }, [otherUser, getMessageType]);

  // 更新 convertToUIMessage ref
  useEffect(() => {
    convertToUIMessageRef.current = convertToUIMessage;
  }, [convertToUIMessage]);

  // 获取会话消息
  const fetchMessages = useCallback(async (conversationId: string, page: number = 1, limit: number = 50) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await chatApi.getMessages(conversationId, page, limit);
      
      if (response.code === 200 || response.code === 1) {
        
        // 根据实际数据结构获取消息数组
        let messagesArray: ChatMessage[] = [];
        if (Array.isArray(response.data)) {
          messagesArray = response.data;
        } else if (response.data && typeof response.data === 'object') {
          // 使用类型断言来处理可能的对象结构
          const dataObj = response.data as any;
          if (Array.isArray(dataObj.messages)) {
            messagesArray = dataObj.messages;
          } else if (Array.isArray(dataObj.data)) {
            messagesArray = dataObj.data;
          } else {
            console.warn('⚠️ 无法从响应对象中提取消息数组，使用空数组');
            messagesArray = [];
          }
        } else {
          console.warn('⚠️ 无法从响应中提取消息数组，使用空数组');
          messagesArray = [];
        }
        
        // 转换消息格式并按时间排序
        const messages = messagesArray.map(convertToUIMessage);
        
        // 按时间顺序排序（从早到晚）
        const sortedMessages = messages.sort((a, b) => {
          const timeA = new Date(a.timestamp).getTime();
          const timeB = new Date(b.timestamp).getTime();
          return timeA - timeB;
        });
        
        console.log('📋 HTTP API历史消息:', sortedMessages.map(m => ({ 
          id: m.id, 
          content: m.content, 
          senderName: m.senderName, 
          timestamp: m.timestamp 
        })));
        
        setCurrentMessages(sortedMessages);
        return sortedMessages;
      } else {
        throw new Error(response.msg || '获取消息失败');
      }
    } catch (err) {
      console.error('获取消息失败:', err);
      setError(err instanceof Error ? err.message : '获取消息失败');
      return [];
    } finally {
      setLoading(false);
    }
  }, [convertToUIMessage]);

  // 发送消息
  const sendMessage = useCallback(async (
    conversationId: string,
    content: string,
    messageType: 'text' | 'image' | 'voice' | 'video' | 'file' | 'emoji' = 'text',
    fileUrl?: string,
    fileName?: string,
    fileSize?: number,
    replyToMessageId?: string
  ) => {
    if (!user) return null;
    
    // 检查是否是AI对话 - 通过当前用户信息判断
    const isAIConversation = currentConversation && currentConversation.user2_id === 0;
    
    console.log('🤖 消息发送判断:', { 
      isAIConversation, 
      currentConversation, 
      user2_id: currentConversation?.user2_id,
      isAIConnected, 
      isAISessionActive,
      currentAICharacter: currentAICharacter?.character_id,
      conversationId,
      currentConversationId: currentConversationIdRef.current
    });
    
    // 如果是AI对话且AI WebSocket已连接，使用AI WebSocket发送
    if (isAIConversation && isAIConnected && isAISessionActive) {
      console.log('🤖 发送AI消息:', { content, currentAICharacter, aiCharacterId: currentAICharacter?.character_id });
      try {
        // 创建临时消息ID
        const tempMessageId = `temp_${Date.now()}`;
        
        // 创建临时消息对象
        const tempMessage: ChatMessageUI = {
          id: tempMessageId,
          senderId: user.id.toString(),
          senderName: '我',
          senderAvatar: '',
          content,
          timestamp: new Date().toISOString(),
          type: messageType,
          isAIMessage: false,
          aiCharacterId: currentAICharacter?.character_id || null
        };
        
        // 立即显示发送的消息
        setCurrentMessages(prev => [...prev, tempMessage]);
        
        // 通过AI WebSocket发送消息
        sendAIMessage(content, messageType);
        
        return tempMessage;
      } catch (err) {
        console.error('AI WebSocket发送消息失败:', err);
        // 回退到HTTP请求
      }
    }
    
    // 优先使用WebSocket发送（普通用户对话）
    if (isConnected && !isAIConversation) {
      try {
        
        // 创建临时消息ID，用于后续替换
        const tempMessageId = `temp_${Date.now()}`;
        
        // 创建临时消息对象
        const tempMessage: ChatMessageUI = {
          id: tempMessageId,
          senderId: user.id.toString(),
          senderName: '我',
          senderAvatar: '',
          content,
          timestamp: new Date().toISOString(),
          type: messageType
        };
        
        // 立即显示发送的消息（乐观更新）
        setCurrentMessages(prev => {
          const newMessages = [...prev, tempMessage];
          return newMessages;
        });
        
        // 发送WebSocket消息
        wsSendMessage({
          conversation_id: conversationId,
          content,
          message_type: messageType
        });
        
        return tempMessage;
      } catch (err) {
        console.error('WebSocket发送消息失败:', err);
        // WebSocket失败，回退到HTTP
      }
    }
    
    // 回退到HTTP请求
    try {
      const response = await chatApi.sendMessage(
        conversationId,
        content,
        messageType,
        fileUrl,
        fileName,
        fileSize,
        replyToMessageId
      );
      
      if (response.code === 200) {
        const newMessage = convertToUIMessage(response.data);
        setCurrentMessages(prev => [...prev, newMessage]);
        
        // 更新会话列表中的最后消息时间
        setConversations(prev => prev.map(conv => 
          conv.conversation_id === conversationId 
            ? { ...conv, last_message_time: response.data.create_time }
            : conv
        ));
        
        // 检查是否是发给AI的消息，如果是则等待AI回复
        const messageType = getMessageType(response.data);
        if (messageType.type === 'user_to_ai' && messageType.aiCharacterId) {
          console.log('🤖 检测到发给AI的消息，开始等待AI回复...');
          // 异步等待AI回复，不阻塞UI
          setTimeout(() => {
            if (waitForAIResponseRef.current) {
              waitForAIResponseRef.current(conversationId, messageType.aiCharacterId || '').catch(error => {
                console.error('❌ 等待AI回复失败:', error);
              });
            }
          }, 100);
        }
        
        return newMessage;
      } else {
        throw new Error(response.msg || '发送消息失败');
      }
    } catch (err) {
      console.error('发送消息失败:', err);
      setError(err instanceof Error ? err.message : '发送消息失败');
      return null;
    }
  }, [user, isConnected, wsSendMessage, convertToUIMessage, getMessageType, isAIConnected, isAISessionActive, currentAICharacter, sendAIMessage, currentConversation]);

  // 将会话转换为聊天历史项格式
  const convertToChatHistoryItem = useCallback((conversation: Conversation, currentUserId: number): ChatHistoryItem => {
    // 确定对方用户ID
    const otherUserId = conversation.user1_id === currentUserId ? conversation.user2_id : conversation.user1_id;
    
    return {
      id: conversation.conversation_id,
      user: {
        id: otherUserId.toString(),
        username: '', // 需要从用户信息中获取
        nickname: conversation.conversation_name,
        avatar: '', // 需要从用户信息中获取
        status: 'offline' // 需要从在线状态中获取
      },
      lastMessage: {
        content: '', // 需要从最后消息中获取
        timestamp: conversation.last_message_time || conversation.create_time,
        senderId: '' // 需要从最后消息中获取
      },
      unreadCount: 0, // 后端暂未提供未读计数
      isPinned: false
    };
  }, []);


  // 清空当前聊天
  const clearCurrentChat = useCallback(() => {
    setCurrentConversation(null);
    setCurrentMessages([]);
  }, []);

  // 设置对方用户信息
  const setOtherUserInfo = useCallback((userInfo: { id: number; nickname: string; avatar?: string }) => {
    setOtherUser(userInfo);
  }, []);

  // 设置当前会话
  const setCurrentConversationId = useCallback((conversationId: string) => {
    currentConversationIdRef.current = conversationId;
    
    // 从会话列表中找到对应的会话并设置为当前会话
    setConversations(prev => {
      const foundConversation = prev.find(conv => conv.conversation_id === conversationId);
      if (foundConversation) {
        // 使用 setTimeout 确保状态更新在下一个事件循环中执行
        setTimeout(() => {
          setCurrentConversation(foundConversation);
          console.log('🤖 设置当前会话:', foundConversation);
        }, 0);
      } else {
        console.log('🤖 未找到会话:', conversationId, '当前会话列表:', prev);
      }
      return prev;
    });
    
    // 清除该会话的未读消息计数
    setUnreadMessages(prev => {
      const newUnread = { ...prev };
      delete newUnread[conversationId];
      return newUnread;
    });
  }, []);

  // 发送输入状态
  const sendTyping = useCallback((isTyping: boolean) => {
    if (isConnected) {
      sendTypingStatus(isTyping);
    }
  }, [isConnected, sendTypingStatus]);

  // 获取历史消息
  const loadHistory = useCallback((conversationId: string, page: number = 1, limit: number = 20) => {
    if (isConnected) {
      wsGetHistory(conversationId, page, limit);
    }
  }, [isConnected, wsGetHistory]);

  // 等待AI回复
  const waitForAIResponse = useCallback(async (conversationId: string, aiCharacterId: string) => {
    const maxAttempts = 30; // 最多等待30秒
    const interval = 1000;  // 每秒检查一次
    
    console.log('🤖 开始等待AI回复...', { conversationId, aiCharacterId });
    
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, interval));
      
      try {
        // 获取最新消息
        const response = await chatApi.getMessages(conversationId, 1, 1);
        
        if (response.code === 200 || response.code === 1) {
          let latestMessage;
          
          if (Array.isArray(response.data)) {
            latestMessage = response.data[0];
          } else if (response.data && typeof response.data === 'object') {
            const dataObj = response.data as any;
            if (Array.isArray(dataObj.messages)) {
              latestMessage = dataObj.messages[0];
            } else if (Array.isArray(dataObj.data)) {
              latestMessage = dataObj.data[0];
            }
          }
          
          if (latestMessage) {
            console.log('🔍 检查最新消息:', latestMessage);
            
            // 检查是否是AI回复
            if (latestMessage.is_ai_message && latestMessage.ai_character_id === aiCharacterId) {
              console.log('✅ 收到AI回复:', latestMessage);
              
              // 将AI回复添加到消息列表
              const aiMessage = convertToUIMessage(latestMessage);
              setCurrentMessages(prev => {
                const updatedMessages = [...prev, aiMessage];
                // 重新排序
                return updatedMessages.sort((a, b) => {
                  const timeA = new Date(a.timestamp).getTime();
                  const timeB = new Date(b.timestamp).getTime();
                  return timeA - timeB;
                });
              });
              break;
            }
          }
        }
      } catch (error) {
        console.error('❌ 获取AI回复失败:', error);
      }
    }
    
    console.log('⏰ AI回复等待结束');
  }, [convertToUIMessage]);

  // 更新 waitForAIResponse ref
  useEffect(() => {
    waitForAIResponseRef.current = waitForAIResponse;
  }, [waitForAIResponse]);

  // AI流式消息处理
  useEffect(() => {
    if (aiStreamingMessage) {
      // 检查是否已经存在相同的流式消息
      setCurrentMessages(prev => {
        const existingIndex = prev.findIndex(msg => msg.id === aiStreamingMessage.messageId);
        
        if (existingIndex >= 0) {
          // 更新现有消息
          const updatedMessages = [...prev];
          updatedMessages[existingIndex] = {
            ...updatedMessages[existingIndex],
            content: aiStreamingMessage.content,
            isAIMessage: true,
            aiCharacterId: currentAICharacter?.character_id || null
          };
          return updatedMessages;
        } else {
          // 添加新消息
          const newMessage: ChatMessageUI = {
            id: aiStreamingMessage.messageId,
            senderId: currentAICharacter?.character_id || 'ai',
            senderName: currentAICharacter?.nickname || 'AI助手',
            senderAvatar: currentAICharacter?.avatar || '',
            content: aiStreamingMessage.content,
            timestamp: new Date().toISOString(),
            type: 'text',
            isAIMessage: true,
            aiCharacterId: currentAICharacter?.character_id || null
          };
          return [...prev, newMessage];
        }
      });
    }
  }, [aiStreamingMessage, currentAICharacter]);

  // 处理用户消息已发送通知
  useEffect(() => {
    if (userMessageSent) {
      console.log('📤 收到用户消息已发送通知:', userMessageSent);
      
      // 检查是否已经存在相同的消息（避免重复添加）
      setCurrentMessages(prev => {
        const existingIndex = prev.findIndex(msg => msg.id === userMessageSent.id);
        
        if (existingIndex >= 0) {
          // 如果消息已存在，更新为正式消息（替换临时消息）
          const updatedMessages = [...prev];
          updatedMessages[existingIndex] = {
            ...updatedMessages[existingIndex],
            id: userMessageSent.id,
            timestamp: userMessageSent.timestamp,
            // 保持其他属性不变
          };
          return updatedMessages;
        } else {
          // 添加新消息
          return [...prev, userMessageSent];
        }
      });
      
      // 清除通知
      clearUserMessageSent();
    }
  }, [userMessageSent, clearUserMessageSent]);

  return {
    // 状态
    conversations,
    currentConversation,
    currentMessages,
    loading,
    error,
    otherUser,
    isTyping,
    unreadMessages,
    
    // WebSocket状态
    isWebSocketConnected: isConnected,
    
    // AI WebSocket状态
    isAIWebSocketConnected: isAIConnected,
    isAISessionActive,
    currentAICharacter,
    aiConversationId,
    aiStreamingMessage,
    
    // 方法
    fetchConversations,
    getOrCreateConversation,
    fetchMessages,
    sendMessage,
    clearCurrentChat,
    setOtherUserInfo,
    
    // WebSocket方法
    setCurrentConversationId,
    sendTyping,
    loadHistory,
    waitForAIResponse,
    
    // AI WebSocket方法
    connectAI,
    disconnectAI,
    startAISession,
    endAISession,
    sendAIMessage,
    getAIHistory,
    setAIConversationId,
    clearAIStreamingMessage,
    
    // 工具方法
    convertToUIMessage,
    convertToChatHistoryItem
  };
};






