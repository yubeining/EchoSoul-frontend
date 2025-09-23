import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AIWebSocketService, AICharacter, AIStreamChunk, AIStreamEnd } from '../services/aiWebSocket';
import { useAuth } from './AuthContext';
import { ChatMessageUI } from '../hooks/useChat';
import { debug, info, error as logError } from '../utils/logger';

// AI WebSocket状态接口
interface AIWebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  currentAICharacter: AICharacter | null;
  isAISessionActive: boolean;
  currentConversationId: string | null;
  aiStreamingMessage: {
    messageId: string;
    content: string;
    isStreaming: boolean;
  } | null;
  userMessageSent: any | null; // 用户消息已发送通知
  isStartingSession: boolean; // 防止重复启动AI会话
}

// AI WebSocket上下文类型
interface AIWebSocketContextType extends AIWebSocketState {
  // 连接管理
  connect: () => Promise<void>;
  disconnect: () => void;
  
  // AI会话管理
  startAISession: (aiCharacterId: string, conversationId?: string) => void;
  endAISession: () => void;
  
  // 消息发送
  sendMessage: (content: string, messageType?: string) => void;
  
  // 历史记录
  getConversationHistory: (conversationId: string, limit?: number) => void;
  getAICharacters: () => void;
  
  // 状态管理
  setCurrentConversationId: (conversationId: string | null) => void;
  clearAIStreamingMessage: () => void;
  clearUserMessageSent: () => void;
}

// 创建AI WebSocket上下文
const AIWebSocketContext = createContext<AIWebSocketContextType | undefined>(undefined);

// AI WebSocket Provider组件
interface AIWebSocketProviderProps {
  children: ReactNode;
}

export const AIWebSocketProvider: React.FC<AIWebSocketProviderProps> = ({ children }) => {
  const { user, token } = useAuth();
  const [aiWebSocketService, setAIWebSocketService] = useState<AIWebSocketService | null>(null);
  const [state, setState] = useState<AIWebSocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    currentAICharacter: null,
    isAISessionActive: false,
    currentConversationId: null,
    aiStreamingMessage: null,
    userMessageSent: null,
    isStartingSession: false
  });

  // 连接AI WebSocket
  const connect = useCallback(async () => {
    if (!user?.id || !token) {
      logError('用户未登录或token无效，无法连接AI WebSocket');
      return;
    }

    if (aiWebSocketService?.isConnected) {
      debug('AI WebSocket已连接');
      return;
    }

    // 如果正在连接中，避免重复连接
    if (state.isConnecting) {
      debug('AI WebSocket正在连接中，跳过重复连接');
      return;
    }

    info('开始连接AI WebSocket...');
    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      // 根据环境选择AI WebSocket服务器地址
      const hostname = window.location.hostname;
      let aiWsHost;
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === 'pcbzodaitkpj.sealosbja.site') {
        // 调试环境
        aiWsHost = 'wss://glbbvnrguhix.sealosbja.site';
      } else if (hostname === 'cedezmdpgixn.sealosbja.site') {
        // 线上环境
        aiWsHost = 'wss://ohciuodbxwdp.sealosbja.site';
      } else {
        // 默认使用调试环境
        aiWsHost = 'wss://glbbvnrguhix.sealosbja.site';
      }
      
      debug('连接AI WebSocket服务器:', aiWsHost);
      const service = new AIWebSocketService(user.id.toString(), aiWsHost, token);
      
      // 设置事件监听器
      service.on('connection_established', (data) => {
        info('AI WebSocket连接已建立:', data);
        setState(prev => ({ 
          ...prev, 
          isConnected: true, 
          isConnecting: false,
          error: null 
        }));
      });

      service.on('ai_session_started', (data) => {
        info('AI会话已开始:', data);
        debug('AI角色信息:', data.result?.ai_character);
        debug('会话ID:', data.result?.conversation_id);
        setState(prev => ({ 
          ...prev, 
          isAISessionActive: true,
          currentAICharacter: data.result?.ai_character || null,
          currentConversationId: data.result?.conversation_id || null
        }));
      });

      service.on('user_message_sent', (data) => {
        info('用户消息已发送:', data);
        // 将用户消息添加到消息列表中显示
        if (data.message_id && data.content) {
          const userMessage: ChatMessageUI = {
            id: data.message_id,
            senderId: user.id.toString(),
            senderName: '我',
            senderAvatar: '',
            content: data.content,
            timestamp: data.timestamp || new Date().toISOString(),
            type: data.message_type || 'text',
            isAIMessage: false,
            aiCharacterId: state.currentAICharacter?.character_id || null
          };
          
          debug('AI WebSocket确认用户消息已保存到数据库:', userMessage);
          
          // 通知父组件更新消息列表
          setState(prev => ({
            ...prev,
            userMessageSent: userMessage
          }));
        }
      });

      service.on('ai_stream_start', (data) => {
        // 只在开发环境记录流式回复开始日志
        if (process.env.NODE_ENV === 'development') {
          info('AI流式回复开始:', data);
        }
        setState(prev => ({
          ...prev,
          aiStreamingMessage: {
            messageId: data.message_id,
            content: '',
            isStreaming: true
          }
        }));
      });

      service.on('ai_stream_chunk', (data: AIStreamChunk) => {
        // 只在开发环境且每10个片段记录一次日志，避免过于频繁
        if (process.env.NODE_ENV === 'development' && Math.random() < 0.1) {
          debug('AI流式回复片段:', data);
        }
        setState(prev => {
          if (prev.aiStreamingMessage?.messageId === data.message_id) {
            return {
              ...prev,
              aiStreamingMessage: {
                ...prev.aiStreamingMessage,
                content: prev.aiStreamingMessage.content + data.chunk
              }
            };
          }
          return prev;
        });
      });

      service.on('ai_stream_end', (data: AIStreamEnd) => {
        // 只在开发环境记录流式回复结束日志
        if (process.env.NODE_ENV === 'development') {
          info('AI流式回复结束:', data);
        }
        setState(prev => ({
          ...prev,
          aiStreamingMessage: {
            messageId: data.message_id,
            content: data.final_content,
            isStreaming: false
          }
        }));
      });

      service.on('ai_error', (data) => {
        logError('AI错误:', data);
        setState(prev => ({ 
          ...prev, 
          error: data.error || 'AI服务错误',
          aiStreamingMessage: null
        }));
      });

      service.on('response', (data) => {
        // 只在开发环境或重要响应时记录日志
        if (process.env.NODE_ENV === 'development' || data.original_type === 'start_ai_session') {
          debug('收到响应:', data);
        }
        // 处理各种响应类型
        if (data.original_type === 'start_ai_session' && data.result?.success) {
          debug('AI会话开始响应:', data.result);
          setState(prev => ({
            ...prev,
            isAISessionActive: true,
            currentAICharacter: data.result.ai_character,
            currentConversationId: data.result.conversation_id,
            isStartingSession: false // 重置启动标记
          }));
        }
      });

      service.on('conversation_history', (data) => {
        // 只在开发环境记录历史记录日志
        if (process.env.NODE_ENV === 'development') {
          debug('收到对话历史:', data);
        }
        // 这里可以触发历史记录更新事件
      });

      service.on('ai_characters', (data) => {
        // 只在开发环境记录AI角色列表日志
        if (process.env.NODE_ENV === 'development') {
          debug('收到AI角色列表:', data);
        }
        // 这里可以触发AI角色列表更新事件
      });

      service.on('error', (error) => {
        logError('AI WebSocket错误:', error);
        setState(prev => ({ 
          ...prev, 
          error: 'WebSocket连接错误',
          isConnecting: false,
          isConnected: false
        }));
      });

      service.on('close', (event) => {
        info('AI WebSocket连接已关闭:', event.code, event.reason);
        setState(prev => ({ 
          ...prev, 
          isConnected: false,
          isConnecting: false,
          isAISessionActive: false,
          aiStreamingMessage: null
        }));
      });

      setAIWebSocketService(service);
      await service.connect();
    } catch (error) {
      logError('连接AI WebSocket失败:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : '连接失败',
        isConnecting: false
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, token, aiWebSocketService?.isConnected, state.isConnecting]); // 注意：不包含state.currentAICharacter?.character_id以避免循环引用

  // 断开连接
  const disconnect = useCallback(() => {
    if (aiWebSocketService) {
      aiWebSocketService.disconnect();
      setAIWebSocketService(null);
      setState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        isAISessionActive: false,
        currentAICharacter: null,
        currentConversationId: null,
        aiStreamingMessage: null
      }));
    }
  }, [aiWebSocketService]);

  // 开始AI会话
  const startAISession = useCallback((aiCharacterId: string, conversationId?: string) => {
    // 防止重复启动AI会话
    if (state.isStartingSession) {
      debug('AI会话正在启动中，跳过重复启动');
      return;
    }
    
    info('尝试开始AI会话:', { aiCharacterId, conversationId, isConnected: aiWebSocketService?.isConnected });
    if (aiWebSocketService?.isConnected) {
      setState(prev => ({ ...prev, isStartingSession: true }));
      aiWebSocketService.startAISession(aiCharacterId, conversationId);
    } else {
      logError('AI WebSocket未连接，无法开始AI会话');
    }
  }, [aiWebSocketService, state.isStartingSession]);

  // 结束AI会话
  const endAISession = useCallback(() => {
    if (aiWebSocketService?.isConnected) {
      aiWebSocketService.endAISession();
      setState(prev => ({
        ...prev,
        isAISessionActive: false,
        currentAICharacter: null,
        currentConversationId: null,
        aiStreamingMessage: null
      }));
    }
  }, [aiWebSocketService]);

  // 发送消息
  const sendMessage = useCallback((content: string, messageType: string = 'text') => {
    debug('AI WebSocket sendMessage 调用:', {
      isConnected: aiWebSocketService?.isConnected,
      currentConversationId: state.currentConversationId,
      currentAICharacter: state.currentAICharacter,
      aiCharacterId: state.currentAICharacter?.character_id,
      content,
      messageType
    });
    
    if (aiWebSocketService?.isConnected && state.currentConversationId) {
      const aiCharacterId = state.currentAICharacter?.character_id;
      const userId = user?.id?.toString() || '';
      info('发送AI消息到WebSocket:', { content, conversationId: state.currentConversationId, userId, aiCharacterId });
      aiWebSocketService.sendChatMessage(content, messageType, state.currentConversationId, userId, aiCharacterId);
    } else {
      logError('AI WebSocket未连接或没有活跃会话，无法发送消息:', {
        isConnected: aiWebSocketService?.isConnected,
        currentConversationId: state.currentConversationId
      });
    }
  }, [aiWebSocketService, state.currentConversationId, state.currentAICharacter, user?.id]);

  // 获取对话历史
  const getConversationHistory = useCallback((conversationId: string, limit: number = 20) => {
    if (aiWebSocketService?.isConnected) {
      aiWebSocketService.getConversationHistory(conversationId, limit);
    }
  }, [aiWebSocketService]);

  // 获取AI角色列表
  const getAICharacters = useCallback(() => {
    if (aiWebSocketService?.isConnected) {
      aiWebSocketService.getAICharacters();
    }
  }, [aiWebSocketService]);

  // 设置当前对话ID
  const setCurrentConversationId = useCallback((conversationId: string | null) => {
    setState(prev => ({ ...prev, currentConversationId: conversationId }));
  }, []);

  // 清除AI流式消息
  const clearAIStreamingMessage = useCallback(() => {
    setState(prev => ({ ...prev, aiStreamingMessage: null }));
  }, []);

  // 清除用户消息已发送通知
  const clearUserMessageSent = useCallback(() => {
    setState(prev => ({ ...prev, userMessageSent: null }));
  }, []);

  // 组件卸载时断开连接
  useEffect(() => {
    return () => {
      if (aiWebSocketService) {
        aiWebSocketService.disconnect();
      }
    };
  }, [aiWebSocketService]);

  const contextValue: AIWebSocketContextType = {
    ...state,
    connect,
    disconnect,
    startAISession,
    endAISession,
    sendMessage,
    getConversationHistory,
    getAICharacters,
    setCurrentConversationId,
    clearAIStreamingMessage,
    clearUserMessageSent
  };

  return (
    <AIWebSocketContext.Provider value={contextValue}>
      {children}
    </AIWebSocketContext.Provider>
  );
};

// 使用AI WebSocket上下文的Hook
export const useAIWebSocket = (): AIWebSocketContextType => {
  const context = useContext(AIWebSocketContext);
  if (context === undefined) {
    throw new Error('useAIWebSocket must be used within an AIWebSocketProvider');
  }
  return context;
};


