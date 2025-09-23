import React, { Component, ErrorInfo, ReactNode } from 'react';
import { error as logError } from '../../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误信息
    logError('ErrorBoundary 捕获到错误:', error);
    logError('错误详情:', errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // 如果有自定义的fallback组件，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认的错误UI
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '40px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px'
            }}>
              ⚠️
            </div>
            
            <h1 style={{
              color: '#dc3545',
              fontSize: '24px',
              fontWeight: '600',
              marginBottom: '16px',
              margin: '0 0 16px 0'
            }}>
              应用遇到了问题
            </h1>
            
            <p style={{
              color: '#6c757d',
              fontSize: '16px',
              lineHeight: '1.5',
              marginBottom: '24px',
              margin: '0 0 24px 0'
            }}>
              很抱歉，应用遇到了一个意外错误。请尝试刷新页面或联系技术支持。
            </p>
            
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={this.handleRetry}
                style={{
                  backgroundColor: '#165DFF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0E4BCC'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#165DFF'}
              >
                重试
              </button>
              
              <button
                onClick={() => window.location.reload()}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
              >
                刷新页面
              </button>
            </div>
            
            {/* 开发环境下显示错误详情 */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{
                marginTop: '24px',
                textAlign: 'left',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid #dee2e6'
              }}>
                <summary style={{
                  cursor: 'pointer',
                  fontWeight: '500',
                  marginBottom: '8px'
                }}>
                  错误详情 (开发环境)
                </summary>
                <pre style={{
                  fontSize: '12px',
                  color: '#dc3545',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  margin: '0'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;


