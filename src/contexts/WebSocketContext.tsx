import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { webSocketService, WebSocketEvents } from '../services/websocket';
import { useAuth } from './AuthContext';

// WebSocket状态接口
interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnectAttempts: number;
}

// WebSocket Context接口
interface WebSocketContextType {
  // 状态
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  
  // 连接管理
  connect: () => Promise<void>;
  disconnect: () => void;
  
  // 消息发送
  sendMessage: (data: {
    conversation_id: string;
    content: string;
    message_type?: string;
    file_url?: string;
    file_name?: string;
    file_size?: number;
    reply_to_message_id?: string;
  }) => void;
  
  // 历史消息和状态
  getHistory: (conversationId: string, page?: number, limit?: number) => void;
  getOnlineStatus: () => void;
  
  // 状态管理
  sendTypingStatus: (isTyping: boolean) => void;
  
  // 事件监听
  on: <K extends keyof WebSocketEvents>(event: K, callback: WebSocketEvents[K]) => void;
  off: <K extends keyof WebSocketEvents>(event: K, callback?: WebSocketEvents[K]) => void;
}

// 创建Context
const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

// Provider组件Props
interface WebSocketProviderProps {
  children: ReactNode;
}

// WebSocket Provider组件
export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const { user, token } = useAuth();
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    reconnectAttempts: 0
  });

  // 连接WebSocket
  const connect = useCallback(async (): Promise<void> => {
    if (!user) {
      console.warn('⚠️ 用户未登录，无法连接WebSocket');
      return;
    }

    if (state.isConnected || state.isConnecting) {
      console.log('🔌 WebSocket已连接或正在连接中');
      return;
    }

    try {
      setState(prev => ({ ...prev, isConnecting: true, error: null }));
      
      // 使用用户ID连接WebSocket
      await webSocketService.connect(user.id);
      
      setState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        error: null,
        reconnectAttempts: 0
      }));
      
      console.log('✅ WebSocket连接成功');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '连接失败';
      setState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        error: errorMessage
      }));
      
      console.error('❌ WebSocket连接失败:', error);
    }
  }, [user, state.isConnected, state.isConnecting]);

  // 断开WebSocket连接
  const disconnect = useCallback((): void => {
    webSocketService.disconnect();
    setState({
      isConnected: false,
      isConnecting: false,
      error: null,
      reconnectAttempts: 0
    });
    console.log('🔌 WebSocket连接已断开');
  }, []);

  // 发送消息
  const sendMessage = (data: {
    conversation_id: string;
    content: string;
    message_type?: string;
  }): void => {
    if (!state.isConnected) {
      console.warn('⚠️ WebSocket未连接，无法发送消息');
      return;
    }
    
    webSocketService.sendMessage(data);
  };

  // 发送输入状态
  const sendTypingStatus = (isTyping: boolean): void => {
    if (!state.isConnected) {
      return;
    }
    
    webSocketService.sendTypingStatus(isTyping);
  };

  // 获取历史消息
  const getHistory = (conversationId: string, page: number = 1, limit: number = 20): void => {
    if (!state.isConnected) {
      return;
    }
    
    webSocketService.getHistory(conversationId, page, limit);
  };

  // 获取在线状态
  const getOnlineStatus = (): void => {
    if (!state.isConnected) {
      return;
    }
    
    webSocketService.getOnlineStatus();
  };

  // 事件监听
  const on = <K extends keyof WebSocketEvents>(event: K, callback: WebSocketEvents[K]): void => {
    webSocketService.on(event, callback);
  };

  const off = <K extends keyof WebSocketEvents>(event: K, callback?: WebSocketEvents[K]): void => {
    webSocketService.off(event, callback);
  };

  // 监听用户登录状态变化
  useEffect(() => {
    if (user && token) {
      // 用户登录，尝试连接WebSocket
      connect();
    } else {
      // 用户登出，断开WebSocket连接
      disconnect();
    }
  }, [user, token, connect, disconnect]);

  // 监听WebSocket连接状态变化
  useEffect(() => {
    const handleConnect = () => {
      setState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        error: null,
        reconnectAttempts: 0
      }));
    };

    const handleDisconnect = () => {
      setState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false
      }));
    };

    const handleError = (error: Error) => {
      setState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        error: error.message
      }));
    };

    // 注册事件监听器
    webSocketService.on('connect', handleConnect);
    webSocketService.on('disconnect', handleDisconnect);
    webSocketService.on('connect_error', handleError);

    // 清理函数
    return () => {
      webSocketService.off('connect', handleConnect);
      webSocketService.off('disconnect', handleDisconnect);
      webSocketService.off('connect_error', handleError);
    };
  }, []);

  // 组件卸载时断开连接
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // Context值
  const contextValue: WebSocketContextType = {
    // 状态
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    error: state.error,
    
    // 连接管理
    connect,
    disconnect,
    
    // 消息发送
    sendMessage,
    
    // 历史消息和状态
    getHistory,
    getOnlineStatus,
    
    // 状态管理
    sendTypingStatus,
    
    // 事件监听
    on,
    off
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

// 自定义Hook
export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

// 导出Context
export default WebSocketContext;

