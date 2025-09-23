import React from 'react';
import ReactDOM from 'react-dom/client';
import Notification, { NotificationProps } from '../components/common/Notification';

interface NotificationItem extends NotificationProps {
  id: string;
}

class NotificationManager {
  private notifications: NotificationItem[] = [];
  private container: HTMLElement | null = null;
  private root: ReactDOM.Root | null = null;

  private createContainer(): void {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'notification-container';
      this.container.style.position = 'fixed';
      this.container.style.top = '0';
      this.container.style.right = '0';
      this.container.style.zIndex = '10000';
      this.container.style.pointerEvents = 'none';
      document.body.appendChild(this.container);
      
      this.root = ReactDOM.createRoot(this.container);
    }
  }

  private generateId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private render(): void {
    if (!this.root) return;

    const notificationElements = this.notifications.map(notification => (
      <div key={notification.id} style={{ pointerEvents: 'auto' }}>
        <Notification
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={() => this.remove(notification.id)}
        />
      </div>
    ));

    this.root.render(notificationElements);
  }

  private remove(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.render();
  }

  public show(message: string, type: NotificationProps['type'] = 'info', duration?: number): string {
    this.createContainer();
    
    const id = this.generateId();
    const notification: NotificationItem = {
      id,
      message,
      type,
      duration
    };

    this.notifications.push(notification);
    this.render();

    return id;
  }

  public success(message: string, duration?: number): string {
    return this.show(message, 'success', duration);
  }

  public error(message: string, duration?: number): string {
    return this.show(message, 'error', duration);
  }

  public warning(message: string, duration?: number): string {
    return this.show(message, 'warning', duration);
  }

  public info(message: string, duration?: number): string {
    return this.show(message, 'info', duration);
  }

  public clear(): void {
    this.notifications = [];
    this.render();
  }

  public destroy(): void {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = null;
    this.root = null;
    this.notifications = [];
  }
}

// 创建单例实例
export const notificationManager = new NotificationManager();

// 便捷方法
export const showNotification = {
  success: (message: string, duration?: number) => notificationManager.success(message, duration),
  error: (message: string, duration?: number) => notificationManager.error(message, duration),
  warning: (message: string, duration?: number) => notificationManager.warning(message, duration),
  info: (message: string, duration?: number) => notificationManager.info(message, duration),
  clear: () => notificationManager.clear()
};

