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
class WebSocketService {
  private socket: WebSocket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventListeners: Map<string, Function[]> = new Map();
  private userId: number | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.send = this.send.bind(this);
    this.on = this.on.bind(this);
    this.off = this.off.bind(this);
  }

  // 连接到WebSocket服务器
  connect(userId: number): Promise<void> {
    return this.createConnection(userId);
  }

  // 断开WebSocket连接
  disconnect(): void {
    if (this.socket) {
      this.stopHeartbeat();
      this.socket.close(1000, '主动断开');
      this.socket = null;
      this.isConnected = false;
      this.eventListeners.clear();
    }
  }

    // 发送消息
    send(data: any): void {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify(data));
      } else {
        console.warn('⚠️ WebSocket未连接，无法发送消息，当前状态:', this.socket?.readyState);
      }
    }

  // 监听事件
  on<K extends keyof WebSocketEvents>(event: K, callback: WebSocketEvents[K]): void {
    // 保存事件监听器
    if (!this.eventListeners.has(event as string)) {
      this.eventListeners.set(event as string, []);
    }
    this.eventListeners.get(event as string)?.push(callback);
  }

  // 移除事件监听
  off<K extends keyof WebSocketEvents>(event: K, callback?: WebSocketEvents[K]): void {
    // 从本地监听器列表中移除
    if (callback && this.eventListeners.has(event as string)) {
      const listeners = this.eventListeners.get(event as string);
      const index = listeners?.indexOf(callback);
      if (index !== undefined && index > -1) {
        listeners?.splice(index, 1);
      }
    }
  }

  // 获取连接状态
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // 获取Socket实例
  getSocket(): WebSocket | null {
    return this.socket;
  }

  // 处理接收到的消息
  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);
      
      // 根据消息类型触发相应事件
      switch (message.type) {
        case 'new_message':
          this.triggerEvent('new_message', message.data);
          break;
        case 'response':
          this.triggerEvent('response', message);
          break;
        case 'typing_status':
          this.triggerEvent('typing_status', message.data);
          break;
        case 'error':
          this.triggerEvent('error', message);
          break;
        default:
      }
    } catch (error) {
      console.error('❌ 解析WebSocket消息失败:', error);
    }
  }

  // 开始心跳检测
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.send({
          type: 'ping',
          timestamp: Date.now()
        });
      }
    }, 30000); // 每30秒发送一次心跳
  }

  // 停止心跳检测
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // 发送聊天消息
  sendMessage(data: {
    conversation_id: string;
    content: string;
    message_type?: string;
  }): void {
    this.send({
      type: 'chat_message',
      conversation_id: data.conversation_id,
      content: data.content,
      message_type: data.message_type || 'text'
    });
  }

  // 发送输入状态
  sendTypingStatus(isTyping: boolean): void {
    this.send({
      type: 'typing',
      is_typing: isTyping
    });
  }

  // 获取历史消息
  getHistory(conversationId: string, page: number = 1, limit: number = 20): void {
    this.send({
      type: 'get_history',
      conversation_id: conversationId,
      page: page,
      limit: limit
    });
  }

  // 获取在线状态
  getOnlineStatus(): void {
    this.send({
      type: 'get_online_status'
    });
  }

  // 获取WebSocket服务器URL
  private getWebSocketUrl(userId: number): string {
    const hostname = window.location.hostname;
    
    // 根据环境选择WebSocket服务器地址
    let wsHost;
    if (hostname === 'localhost' || hostname === '127.0.0.1' ||hostname === 'pcbzodaitkpj.sealosbja.site') {
      // 调试环境
      wsHost = 'wss://glbbvnrguhix.sealosbja.site';
    } else if (hostname === 'cedezmdpgixn.sealosbja.site') {
      // 线上环境
      wsHost = 'wss://ohciuodbxwdp.sealosbja.site';
    }
    
    return `${wsHost}/api/ws/${userId}`;
  }

  // 处理重连逻辑
  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.userId) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      
      setTimeout(() => {
        if (!this.isConnected && this.userId) {
          // 重新创建WebSocket连接
          this.createConnection(this.userId).catch(error => {
            console.error('重连失败:', error);
          });
        }
      }, delay);
    } else {
      console.error('❌ WebSocket重连失败，已达到最大重试次数');
    }
  }

  // 创建WebSocket连接
  private createConnection(userId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.userId = userId;
        const wsUrl = this.getWebSocketUrl(userId);
        
        
        this.socket = new WebSocket(wsUrl);

        // 连接成功事件
        this.socket.onopen = () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          resolve();
        };

        // 连接错误事件
        this.socket.onerror = (error) => {
          console.error('❌ WebSocket连接失败:', error);
          this.isConnected = false;
          reject(error);
        };

        // 断开连接事件
        this.socket.onclose = (event) => {
          this.isConnected = false;
          this.stopHeartbeat();
          
          if (event.code !== 1000) { // 非正常关闭
            this.handleReconnect();
          }
        };

        // 接收消息事件
        this.socket.onmessage = (event) => {
          this.handleMessage(event.data);
        };

      } catch (error) {
        console.error('❌ WebSocket初始化失败:', error);
        reject(error);
      }
    });
  }

  // 触发本地事件
  private triggerEvent(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ 事件监听器执行失败 (${event}):`, error);
        }
      });
    }
  }
}

// 创建单例实例
export const webSocketService = new WebSocketService();

// 导出类型已在上面定义
