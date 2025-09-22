// AI WebSocket服务类
export interface AIWebSocketMessage {
  type: string;
  [key: string]: any;
}

export interface AICharacter {
  character_id: string;
  nickname: string;
  description: string;
  personality: string;
  avatar?: string;
}

export interface AIStreamChunk {
  message_id: string;
  chunk: string;
  timestamp: string;
}

export interface AIStreamEnd {
  message_id: string;
  final_content: string;
  timestamp: string;
}

export interface AIWebSocketEvents {
  connection_established: (data: any) => void;
  ai_session_started: (data: any) => void;
  user_message_sent: (data: any) => void;
  ai_stream_start: (data: any) => void;
  ai_stream_chunk: (data: AIStreamChunk) => void;
  ai_stream_end: (data: AIStreamEnd) => void;
  ai_error: (data: any) => void;
  response: (data: any) => void;
  conversation_history: (data: any) => void;
  ai_characters: (data: any) => void;
  error: (error: Event) => void;
  close: (event: CloseEvent) => void;
}

export class AIWebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private userId: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private eventListeners: Partial<AIWebSocketEvents> = {};

  constructor(userId: string, baseUrl: string = 'ws://localhost:8080', token?: string) {
    this.userId = userId;
    // 如果有token，添加到URL参数中
    const urlParams = token ? `?token=${encodeURIComponent(token)}` : '';
    this.url = `${baseUrl}/api/ws/ai-chat/${userId}${urlParams}`;
  }

  // 连接WebSocket
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);
        
        this.ws.onopen = () => {
          console.log('🤖 AI WebSocket连接已建立');
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('解析WebSocket消息失败:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('AI WebSocket错误:', error);
          this.eventListeners.error?.(error);
        };

        this.ws.onclose = (event) => {
          console.log('AI WebSocket连接已关闭:', event.code, event.reason);
          this.stopHeartbeat();
          this.eventListeners.close?.(event);
          
          // 自动重连
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`尝试重连AI WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => {
              this.connect().catch(console.error);
            }, this.reconnectInterval);
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  // 断开连接
  disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // 发送消息
  send(message: AIWebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('🤖 发送AI WebSocket消息:', message);
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('AI WebSocket未连接，无法发送消息');
    }
  }

  // 开始AI会话
  startAISession(aiCharacterId: string, conversationId?: string): void {
    this.send({
      type: 'start_ai_session',
      ai_character_id: aiCharacterId,
      conversation_id: conversationId
    });
  }

  // 结束AI会话
  endAISession(): void {
    this.send({
      type: 'end_ai_session'
    });
  }

  // 发送聊天消息
  sendChatMessage(content: string, messageType: string = 'text', conversationId: string, aiCharacterId?: string): void {
    const message: any = {
      type: 'chat_message',
      content,
      message_type: messageType,
      conversation_id: conversationId
    };
    
    // 如果有AI角色ID，添加到消息中
    if (aiCharacterId) {
      message.ai_character_id = aiCharacterId;
    }
    
    this.send(message);
  }

  // 获取对话历史
  getConversationHistory(conversationId: string, page: number = 1, limit: number = 20): void {
    this.send({
      type: 'get_conversation_history',
      conversation_id: conversationId,
      page,
      limit
    });
  }

  // 获取AI角色列表
  getAICharacters(): void {
    this.send({
      type: 'get_ai_characters'
    });
  }

  // 发送心跳
  private sendHeartbeat(): void {
    this.send({
      type: 'ping'
    });
  }

  // 开始心跳
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 30000); // 每30秒发送一次心跳
  }

  // 停止心跳
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // 处理接收到的消息
  private handleMessage(data: any): void {
    console.log('收到AI WebSocket消息:', data);
    
    const handler = this.eventListeners[data.type as keyof AIWebSocketEvents];
    if (handler) {
      handler(data);
    }
  }

  // 添加事件监听器
  on<K extends keyof AIWebSocketEvents>(event: K, handler: AIWebSocketEvents[K]): void {
    this.eventListeners[event] = handler;
  }

  // 移除事件监听器
  off<K extends keyof AIWebSocketEvents>(event: K): void {
    delete this.eventListeners[event];
  }

  // 获取连接状态
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // 获取连接状态文本
  get connectionState(): string {
    if (!this.ws) return '未连接';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return '连接中';
      case WebSocket.OPEN:
        return '已连接';
      case WebSocket.CLOSING:
        return '关闭中';
      case WebSocket.CLOSED:
        return '已关闭';
      default:
        return '未知状态';
    }
  }
}

// 创建AI WebSocket服务实例的工厂函数
export const createAIWebSocketService = (userId: string, baseUrl?: string, token?: string): AIWebSocketService => {
  return new AIWebSocketService(userId, baseUrl, token);
};
