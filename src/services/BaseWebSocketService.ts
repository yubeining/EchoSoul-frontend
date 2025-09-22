/**
 * WebSocket服务基类
 * 提供通用的WebSocket连接、重连、心跳等功能
 */

import { logger } from '../utils/logger';

export interface BaseWebSocketEvents {
  connect: () => void;
  disconnect: () => void;
  error: (error: Event) => void;
  close: (event: CloseEvent) => void;
}

export abstract class BaseWebSocketService {
  protected ws: WebSocket | null = null;
  protected url: string;
  public isConnected = false;
  protected reconnectAttempts = 0;
  protected maxReconnectAttempts = 5;
  protected reconnectInterval = 3000;
  protected heartbeatInterval: NodeJS.Timeout | null = null;
  protected baseEventListeners: Map<string, Function[]> = new Map();

  constructor(url: string) {
    this.url = url;
  }

  // 抽象方法，子类必须实现
  protected abstract handleMessage(data: any): void;
  protected abstract getServiceName(): string;

  // 连接WebSocket
  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.CONNECTING || this.ws?.readyState === WebSocket.OPEN) {
      logger.wsInfo(`${this.getServiceName()} WebSocket正在连接中，跳过重复连接`);
      return;
    }

    logger.wsInfo(`开始连接${this.getServiceName()} WebSocket...`);

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);
        
        this.ws.onopen = () => {
          logger.wsInfo(`${this.getServiceName()} WebSocket连接已建立`);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.emitBaseEvent('connect');
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            logger.wsError(`解析${this.getServiceName()} WebSocket消息失败:`, error);
          }
        };

        this.ws.onerror = (error) => {
          logger.wsError(`${this.getServiceName()} WebSocket错误:`, error);
          this.emitBaseEvent('error', error);
          reject(error);
        };

        this.ws.onclose = (event) => {
          logger.wsInfo(`${this.getServiceName()} WebSocket连接已关闭: ${event.code} ${event.reason}`);
          this.isConnected = false;
          this.stopHeartbeat();
          this.emitBaseEvent('close', event);
          
          // 自动重连
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            logger.wsInfo(`尝试重连${this.getServiceName()} WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => {
              this.connect().catch(logger.wsError);
            }, this.reconnectInterval);
          } else {
            logger.wsError(`${this.getServiceName()} WebSocket重连失败，已达到最大重试次数`);
          }
        };
      } catch (error) {
        logger.wsError(`连接${this.getServiceName()} WebSocket失败:`, error);
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
    this.isConnected = false;
    this.emitBaseEvent('disconnect');
  }

  // 发送消息
  protected send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      logger.wsError(`${this.getServiceName()} WebSocket未连接，无法发送消息`);
    }
  }

  // 开始心跳
  protected startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.sendHeartbeat();
      }
    }, 30000); // 30秒心跳
  }

  // 停止心跳
  protected stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // 发送心跳（子类可重写）
  protected sendHeartbeat(): void {
    this.send({ type: 'ping' });
  }

  // 基础事件监听
  protected onBaseEvent(event: string, callback: Function): void {
    if (!this.baseEventListeners.has(event)) {
      this.baseEventListeners.set(event, []);
    }
    this.baseEventListeners.get(event)!.push(callback);
  }

  // 移除基础事件监听
  protected offBaseEvent(event: string, callback: Function): void {
    const listeners = this.baseEventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // 触发基础事件
  protected emitBaseEvent(event: string, ...args: any[]): void {
    const listeners = this.baseEventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          logger.wsError(`事件监听器执行失败 (${event}):`, error);
        }
      });
    }
  }

  // 获取连接状态
  get connectionState(): boolean {
    return this.isConnected;
  }
}
