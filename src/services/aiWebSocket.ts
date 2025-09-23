import { BaseWebSocketService } from './BaseWebSocketService';
import { aiDebug, aiInfo, aiError } from '../utils/logger';

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
  speaking_style?: string;
  usage_count?: number;
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

export class AIWebSocketService extends BaseWebSocketService {
  private userId: string;
  private eventListeners: Partial<AIWebSocketEvents> = {};

  constructor(userId: string, baseUrl: string = 'ws://localhost:8080', token?: string) {
    // 按照后端接口文档格式构建URL，包含token参数
    const urlParams = token ? `?token=${encodeURIComponent(token)}` : '';
    const url = `${baseUrl}/api/ws/ai-chat/${userId}${urlParams}`;
    super(url);
    this.userId = userId;
  }

  protected getServiceName(): string {
    return 'AI';
  }

  protected handleMessage(data: any): void {
    try {
      switch (data.type) {
        case 'connection_established':
          aiInfo('AI WebSocket连接已建立:', data);
          this.emit('connection_established', data);
          break;

        case 'ai_session_started':
          // AI会话开始日志在AIWebSocketContext中记录，避免重复
          this.emit('ai_session_started', data);
          break;

        case 'user_message_sent':
          aiInfo('用户消息已发送:', data);
          this.emit('user_message_sent', data);
          break;

        case 'ai_stream_start':
          aiInfo('AI流式回复开始:', data);
          this.emit('ai_stream_start', data);
          break;

        case 'ai_stream_chunk':
          // 流式回复片段日志在AIWebSocketContext中记录，避免重复
          this.emit('ai_stream_chunk', data);
          break;

        case 'ai_stream_end':
          aiInfo('AI流式回复结束:', data);
          this.emit('ai_stream_end', data);
          break;

        case 'ai_error':
          aiError('AI错误:', data);
          this.emit('ai_error', data);
          break;

        case 'response':
          // 响应日志在AIWebSocketContext中记录，避免重复
          this.emit('response', data);
          break;

        case 'conversation_history':
          aiInfo('收到对话历史:', data);
          this.emit('conversation_history', data);
          break;

        case 'ai_characters':
          aiInfo('收到AI角色列表:', data);
          this.emit('ai_characters', data);
          break;

        default:
          aiDebug('收到AI WebSocket消息:', data);
          break;
      }
    } catch (error) {
      aiError('处理AI WebSocket消息失败:', error);
    }
  }

  // 事件监听
  on<K extends keyof AIWebSocketEvents>(event: K, callback: AIWebSocketEvents[K]): void {
    this.eventListeners[event] = callback;
  }

  // 移除事件监听
  off<K extends keyof AIWebSocketEvents>(event: K): void {
    delete this.eventListeners[event];
  }

  // 触发事件
  private emit<K extends keyof AIWebSocketEvents>(event: K, ...args: Parameters<AIWebSocketEvents[K]>): void {
    const callback = this.eventListeners[event];
    if (callback) {
      try {
        (callback as any)(...args);
      } catch (error) {
        aiError(`AI WebSocket事件监听器执行失败 (${event}):`, error);
      }
    }
  }

  // 开始AI会话
  startAISession(aiCharacterId: string, conversationId?: string): void {
    const message: AIWebSocketMessage = {
      type: 'start_ai_session',
      ai_character_id: aiCharacterId
    };
    
    if (conversationId) {
      message.conversation_id = conversationId;
    }
    
    this.send(message);
  }

  // 结束AI会话
  endAISession(): void {
    this.send({
      type: 'end_ai_session'
    });
  }

  // 发送聊天消息
  sendChatMessage(content: string, messageType: string = 'text', conversationId: string, userId: string, aiCharacterId?: string): void {
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
  getConversationHistory(conversationId: string, limit: number = 20): void {
    this.send({
      type: 'get_conversation_history',
      conversation_id: conversationId,
      limit
    });
  }

  // 获取AI角色列表
  getAICharacters(): void {
    this.send({
      type: 'get_ai_characters'
    });
  }

  // 重写发送方法，添加AI专用日志
  protected send(message: AIWebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      // 只在非心跳消息时记录日志，减少日志噪音
      if (message.type !== 'ping') {
        // 记录重要消息的发送
        if (message.type === 'chat_message' || message.type === 'start_ai_session') {
          aiInfo('发送AI WebSocket消息:', message);
        } else {
          aiDebug('发送AI WebSocket消息:', message);
        }
      }
      this.ws.send(JSON.stringify(message));
    } else {
      aiError('AI WebSocket未连接，无法发送消息');
    }
  }

  // 重写心跳方法
  protected sendHeartbeat(): void {
    this.send({ type: 'ping' });
    // 只在开发环境且每10次心跳记录一次日志，减少日志噪音
    if (process.env.NODE_ENV === 'development' && Math.random() < 0.1) {
      aiDebug('AI WebSocket心跳已发送');
    }
  }

}