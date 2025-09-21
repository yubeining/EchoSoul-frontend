import { useState, useCallback, useEffect, useRef } from 'react';
import { chatApi, userApi, Conversation, ChatMessage } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';

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

  // WebSocket事件监听
  useEffect(() => {
    if (!isConnected) return;

    // 监听新消息
    const handleNewMessage = (data: any) => {
      
      // 转换消息格式
      const newMessage: ChatMessageUI = {
        id: data.message_id,
        senderId: data.sender_id.toString(),
        senderName: data.sender_name || '未知用户',
        senderAvatar: data.sender_avatar || '',
        content: data.content,
        timestamp: data.timestamp,
        type: data.message_type || 'text'
      };
      
      // 如果是当前会话的消息
      if (data.conversation_id === currentConversationIdRef.current) {
        setCurrentMessages(prev => {
          // 检查是否是当前用户发送的消息（通过内容匹配临时消息）
          const isCurrentUserMessage = user && data.sender_id === user.id;
          
          if (isCurrentUserMessage) {
            // 查找并替换临时消息
            const tempMessageIndex = prev.findIndex(msg => 
              msg.id.startsWith('temp_') && 
              msg.content === data.content && 
              msg.senderId === user.id.toString()
            );
            
            if (tempMessageIndex !== -1) {
              // 替换临时消息
              const updatedMessages = [...prev];
              updatedMessages[tempMessageIndex] = newMessage;
              return updatedMessages;
            }
          }
          
          // 如果不是当前用户的消息，或者是当前用户消息但没有找到临时消息，直接添加
          return [...prev, newMessage];
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
      
      if (data.original_type === 'get_history' && data.result.success) {
        // 处理历史消息
        const historyMessages = data.result.messages.map((msg: any) => ({
          id: msg.message_id,
          senderId: msg.sender_id.toString(),
          senderName: msg.sender_name || '未知用户',
          senderAvatar: msg.sender_avatar || '',
          content: msg.content,
          timestamp: msg.timestamp,
          type: msg.message_type || 'text'
        }));
        
        setCurrentMessages(historyMessages);
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
  }, [isConnected, wsOn, wsOff, user]);

  // 获取会话列表（按需调用）
  const fetchConversations = useCallback(async () => {
    if (!user) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await chatApi.getConversations();
      if (response.code === 200 || response.code === 1) {
        setConversations(response.data);
        setError(null);
      } else {
        throw new Error(response.msg || '获取会话列表失败');
      }
    } catch (err) {
      console.error('❌ 获取会话列表失败:', err);
      const errorMessage = err instanceof Error ? err.message : '获取会话列表失败';
      setError(errorMessage);
    } finally {
      setLoading(false);
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

  // 将后端消息格式转换为UI消息格式
  const convertToUIMessage = useCallback((message: ChatMessage): ChatMessageUI => {
    // 判断是否为当前用户发送的消息
    const isCurrentUser = user && message.sender_id === user.id;
    
    return {
      id: message.message_id,
      senderId: message.sender_id.toString(),
      senderName: isCurrentUser ? '我' : (otherUser?.nickname || '对方'), // 使用对方真实昵称
      senderAvatar: isCurrentUser ? '' : (otherUser?.avatar || ''), // 使用对方真实头像
      content: message.content,
      timestamp: message.create_time,
      type: message.message_type,
      fileUrl: message.file_url || undefined,
      fileName: message.file_name || undefined,
      fileSize: message.file_size || undefined,
      replyToMessageId: message.reply_to_message_id || undefined
    };
  }, [user, otherUser]);

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
    
    // 优先使用WebSocket发送
    if (isConnected) {
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
        
        return newMessage;
      } else {
        throw new Error(response.msg || '发送消息失败');
      }
    } catch (err) {
      console.error('发送消息失败:', err);
      setError(err instanceof Error ? err.message : '发送消息失败');
      return null;
    }
  }, [user, isConnected, wsSendMessage, convertToUIMessage]);

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

  // 获取聊天历史列表（用于聊天记录页面）
  const getChatHistory = useCallback(async (): Promise<ChatHistoryItem[]> => {
    if (!user) return [];
    
    const chatHistoryItems: ChatHistoryItem[] = [];
    
    for (const conv of conversations) {
      const otherUserId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;
      
      try {
        // 获取对方用户信息
        const userResponse = await userApi.searchUsers(`user_id:${otherUserId}`, 1, 1);
        let otherUser = null;
        if (userResponse.code === 200 && userResponse.data.users.length > 0) {
          otherUser = userResponse.data.users[0];
        }
        
        const chatItem: ChatHistoryItem = {
          id: conv.conversation_id,
          user: {
            id: otherUserId.toString(),
            username: otherUser?.username || `用户${otherUserId}`,
            nickname: otherUser?.nickname || conv.conversation_name || `用户${otherUserId}`,
            avatar: otherUser?.avatar || '',
            status: 'offline'
          },
          lastMessage: {
            content: '', // 暂时为空，后续可以从最后消息中获取
            timestamp: conv.last_message_time || conv.create_time,
            senderId: ''
          },
          unreadCount: 0,
          isPinned: false
        };
        
        chatHistoryItems.push(chatItem);
      } catch (error) {
        console.error('获取用户信息失败:', error);
        // 即使获取用户信息失败，也添加基本的聊天项
        chatHistoryItems.push(convertToChatHistoryItem(conv, user.id));
      }
    }
    
    return chatHistoryItems;
  }, [conversations, user, convertToChatHistoryItem]);

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
    
    // 方法
    fetchConversations,
    getOrCreateConversation,
    fetchMessages,
    sendMessage,
    getChatHistory,
    clearCurrentChat,
    setOtherUserInfo,
    
    // WebSocket方法
    setCurrentConversationId,
    sendTyping,
    loadHistory,
    
    // 工具方法
    convertToUIMessage,
    convertToChatHistoryItem
  };
};






