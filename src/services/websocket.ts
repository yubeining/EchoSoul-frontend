import { BaseWebSocketService } from './BaseWebSocketService';
import { wsDebug, wsInfo, wsError } from '../utils/logger';

// WebSocket事件类型定义 - 基于后端协议
export interface WebSocketEvents {
  // 连接事件
  connect: () => void;
  disconnect: () => void;
  connect_error: (error: Error) => void;
  
  // 消息事件
  new_message: (data: {
    message_id: string;
    conversation_id: string;
    sender_id: number;
    content: string;
    message_type: string;
    timestamp: string;
  }) => void;
  
  // 响应事件
  response: (data: {
    type: string;
    original_type: string;
    result: any;
  }) => void;
  
  // 输入状态事件
  typing_status: (data: {
    user_id: number;
    is_typing: boolean;
    timestamp: string;
  }) => void;
  
  // 错误事件
  error: (error: { message: string; code?: string }) => void;
}

// WebSocket服务类
class WebSocketService extends BaseWebSocketService {
  private userId: number | null = null;
  private eventListeners: Partial<WebSocketEvents> = {};

  constructor() {
    super(''); // 基础URL将在connect时设置
  }

  protected getServiceName(): string {
    return 'WebSocket';
  }

  protected handleMessage(data: any): void {
    try {
      switch (data.type) {
        case 'new_message':
          wsInfo('收到新消息:', data);
          this.emit('new_message', data);
          break;

        case 'response':
          wsDebug('收到响应:', data);
          this.emit('response', data);
          break;

        case 'typing_status':
          wsDebug('收到输入状态:', data);
          this.emit('typing_status', data);
          break;

        case 'error':
          wsError('收到错误:', data);
          this.emit('error', data);
          break;

        default:
          wsDebug('收到WebSocket消息:', data);
          break;
      }
    } catch (error) {
      wsError('处理WebSocket消息失败:', error);
    }
  }

  // 连接到WebSocket服务器
  async connectWebSocket(userId: number): Promise<void> {
    this.userId = userId;
    
    // 根据环境动态获取WebSocket URL
    const getWebSocketUrl = () => {
      const hostname = window.location.hostname;
      
      if (hostname === 'pcbzodaitkpj.sealosbja.site') {
        // 测试环境
        return 'wss://glbbvnrguhix.sealosbja.site';
      } else if (hostname === 'cedezmdpgixn.sealosbja.site') {
        // 生产环境
        return 'wss://ohciuodbxwdp.sealosbja.site';
      } else {
        // 本地开发环境
        return process.env.REACT_APP_WS_URL || 'ws://localhost:8080';
      }
    };
    
    const baseUrl = getWebSocketUrl();
    this.url = `${baseUrl}/api/ws/${userId}`;
    
    wsInfo(`连接WebSocket: ${this.url}`);
    
    try {
      await super.connect();
    } catch (error) {
      wsError('WebSocket连接失败:', error);
      this.emit('connect_error', error as Error);
      throw error;
    }
  }

  // 断开WebSocket连接
  disconnect(): void {
    super.disconnect();
    this.userId = null;
    this.eventListeners = {};
  }

  // 发送消息
  send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      // 只在非心跳消息时记录日志，减少日志噪音
      if (data.type !== 'ping') {
        wsDebug('发送WebSocket消息:', data);
      }
      this.ws.send(JSON.stringify(data));
    } else {
      wsError('WebSocket未连接，无法发送消息，当前状态:', this.ws?.readyState);
    }
  }

  // 监听事件
  on<K extends keyof WebSocketEvents>(event: K, callback: WebSocketEvents[K]): void {
    this.eventListeners[event] = callback;
  }

  // 移除事件监听
  off<K extends keyof WebSocketEvents>(event: K): void {
    delete this.eventListeners[event];
  }

  // 触发事件
  private emit<K extends keyof WebSocketEvents>(event: K, ...args: Parameters<WebSocketEvents[K]>): void {
    const callback = this.eventListeners[event];
    if (callback) {
      try {
        (callback as any)(...args);
      } catch (error) {
        wsError(`WebSocket事件监听器执行失败 (${event}):`, error);
      }
    }
  }

  // 发送输入状态
  sendTypingStatus(isTyping: boolean): void {
    this.send({
      type: 'typing_status',
      is_typing: isTyping,
      timestamp: new Date().toISOString()
    });
  }

  // 重写心跳方法
  protected sendHeartbeat(): void {
    this.send({ type: 'ping' });
    // 只在开发环境且每10次心跳记录一次日志，减少日志噪音
    if (process.env.NODE_ENV === 'development' && Math.random() < 0.1) {
      wsDebug('WebSocket心跳已发送');
    }
  }

  // 获取连接状态
  get connectionState(): boolean {
    return this.isConnected;
  }

  // 获取用户ID
  get currentUserId(): number | null {
    return this.userId;
  }

  // 发送消息方法
  sendMessage(data: any): void {
    this.send(data);
  }

  // 获取历史消息
  getHistory(conversationId: string, page: number = 1, limit: number = 20): void {
    this.send({
      type: 'get_history',
      conversation_id: conversationId,
      page,
      limit
    });
  }

  // 获取在线状态
  getOnlineStatus(userId: number): void {
    this.send({
      type: 'get_online_status',
      user_id: userId
    });
  }
}

// 创建单例实例
export const webSocketService = new WebSocketService();