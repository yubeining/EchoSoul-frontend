import { useState, useEffect, useCallback } from 'react';
import { chatApi, userApi, Conversation, ChatMessage } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

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

// 全局状态，避免多个组件重复调用
let globalConversations: Conversation[] = [];
let globalLoading = false;
let globalError: string | null = null;
let globalInitialized = false;

export const useChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>(globalConversations);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [currentMessages, setCurrentMessages] = useState<ChatMessageUI[]>([]);
  const [loading, setLoading] = useState(globalLoading);
  const [error, setError] = useState<string | null>(globalError);

  // 获取会话列表
  const fetchConversations = useCallback(async () => {
    if (!user || globalInitialized) return; // 使用全局状态防止重复调用
    
    globalLoading = true;
    globalError = null;
    globalInitialized = true;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await chatApi.getConversations();
      console.log('📋 获取会话列表响应:', response);
      if (response.code === 200 || response.code === 1) {
        console.log('✅ 设置会话列表:', response.data);
        globalConversations = response.data;
        globalError = null;
        setConversations(response.data);
        setError(null); // 确保清除错误状态
      } else {
        throw new Error(response.msg || '获取会话列表失败');
      }
    } catch (err) {
      console.error('❌ 获取会话列表失败:', err);
      const errorMessage = err instanceof Error ? err.message : '获取会话列表失败';
      globalError = errorMessage;
      globalInitialized = false; // 失败时重置状态，允许重试
      setError(errorMessage);
    } finally {
      globalLoading = false;
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
      console.log('getOrCreateConversation 响应:', response);
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
    return {
      id: message.message_id,
      senderId: message.sender_id.toString(),
      senderName: '', // 需要从用户信息中获取
      senderAvatar: '', // 需要从用户信息中获取
      content: message.content,
      timestamp: message.create_time,
      type: message.message_type,
      fileUrl: message.file_url || undefined,
      fileName: message.file_name || undefined,
      fileSize: message.file_size || undefined,
      replyToMessageId: message.reply_to_message_id || undefined
    };
  }, []);

  // 获取会话消息
  const fetchMessages = useCallback(async (conversationId: string, page: number = 1, limit: number = 50) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await chatApi.getMessages(conversationId, page, limit);
      console.log('fetchMessages 响应:', response);
      if (response.code === 200 || response.code === 1) {
        const messages = response.data.map(convertToUIMessage);
        setCurrentMessages(messages);
        return messages;
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
  }, [user, convertToUIMessage]);

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
    
    console.log('📋 开始获取聊天历史，会话数量:', conversations.length);
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

  // 初始化时获取会话列表（只执行一次）
  useEffect(() => {
    if (user && !globalInitialized) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  return {
    // 状态
    conversations,
    currentConversation,
    currentMessages,
    loading,
    error,
    
    // 方法
    fetchConversations,
    getOrCreateConversation,
    fetchMessages,
    sendMessage,
    getChatHistory,
    clearCurrentChat,
    
    // 工具方法
    convertToUIMessage,
    convertToChatHistoryItem
  };
};






