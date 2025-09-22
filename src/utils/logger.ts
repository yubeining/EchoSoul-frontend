/**
 * 统一的日志工具
 * 提供分级日志输出，支持生产环境日志控制
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

class Logger {
  private logLevel: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    // 开发环境显示所有日志，生产环境只显示警告和错误
    this.logLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;
    
    // 绑定方法到this上下文
    this.debug = this.debug.bind(this);
    this.info = this.info.bind(this);
    this.warn = this.warn.bind(this);
    this.error = this.error.bind(this);
    this.wsDebug = this.wsDebug.bind(this);
    this.wsInfo = this.wsInfo.bind(this);
    this.wsError = this.wsError.bind(this);
    this.aiDebug = this.aiDebug.bind(this);
    this.aiInfo = this.aiInfo.bind(this);
    this.aiError = this.aiError.bind(this);
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private formatMessage(prefix: string, message: any, ...args: any[]): string {
    const timestamp = new Date().toISOString().substr(11, 12);
    return `[${timestamp}] ${prefix} ${message}`;
  }

  debug(message: any, ...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage('🐛', message), ...args);
    }
  }

  info(message: any, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage('ℹ️', message), ...args);
    }
  }

  warn(message: any, ...args: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('⚠️', message), ...args);
    }
  }

  error(message: any, ...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage('❌', message), ...args);
    }
  }

  // WebSocket专用日志方法
  wsDebug(message: any, ...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage('🔌', message), ...args);
    }
  }

  wsInfo(message: any, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage('🔌', message), ...args);
    }
  }

  wsError(message: any, ...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage('🔌❌', message), ...args);
    }
  }

  // AI WebSocket专用日志方法
  aiDebug(message: any, ...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage('🤖', message), ...args);
    }
  }

  aiInfo(message: any, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage('🤖', message), ...args);
    }
  }

  aiError(message: any, ...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage('🤖❌', message), ...args);
    }
  }

  // 设置日志级别
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  // 获取当前日志级别
  getLogLevel(): LogLevel {
    return this.logLevel;
  }
}

// 创建全局日志实例
export const logger = new Logger();

// 导出便捷方法
export const { debug, info, warn, error, wsDebug, wsInfo, wsError, aiDebug, aiInfo, aiError } = logger;


