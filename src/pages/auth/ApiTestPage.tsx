import React, { useState, useEffect } from 'react';
import { authApi, apiTester } from '../../services/api';
import { getEnvironmentInfo } from '../../utils/environment';

const ApiTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<any[]>([]);

  const addResult = (test: string, result: any) => {
    setTestResults(prev => [...prev, { test, result, timestamp: new Date().toLocaleTimeString() }]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  // 测试所有API连接
  const testConnections = async () => {
    setIsLoading(true);
    try {
      const results = await apiTester.testAllConnections();
      setConnectionStatus(results);
      addResult('API连接测试', results);
    } catch (error) {
      addResult('API连接测试', { error: error instanceof Error ? error.message : String(error) });
    } finally {
      setIsLoading(false);
    }
  };

  // 组件加载时自动测试连接
  useEffect(() => {
    testConnections();
  }, [testConnections]);

  // 测试注册
  const testRegister = async () => {
    setIsLoading(true);
    try {
      const result = await authApi.register({
        mobileOrEmail: 'test@example.com',
        password: '123456',
        confirmPassword: '123456',
        nickname: '测试用户'
      });
      addResult('用户注册', result);
    } catch (error) {
      addResult('用户注册', { error: error instanceof Error ? error.message : String(error) });
    } finally {
      setIsLoading(false);
    }
  };

  // 测试登录
  const testLogin = async () => {
    setIsLoading(true);
    try {
      const result = await authApi.login({
        username: 'admin@echosoul.com',
        password: 'admin123'
      });
      addResult('用户登录', result);
      
      // 如果登录成功，保存token
      if (result.code === 1) {
        localStorage.setItem('echosoul_token', result.data.token);
      }
    } catch (error) {
      addResult('用户登录', { error: error instanceof Error ? error.message : String(error) });
    } finally {
      setIsLoading(false);
    }
  };

  // 测试获取用户信息
  const testGetUserInfo = async () => {
    setIsLoading(true);
    try {
      const result = await authApi.getUserInfo();
      addResult('获取用户信息', result);
    } catch (error) {
      addResult('获取用户信息', { error: error instanceof Error ? error.message : String(error) });
    } finally {
      setIsLoading(false);
    }
  };

  // 测试登出
  const testLogout = async () => {
    setIsLoading(true);
    try {
      const result = await authApi.logout();
      addResult('用户登出', result);
      localStorage.removeItem('echosoul_token');
    } catch (error) {
      addResult('用户登出', { error: error instanceof Error ? error.message : String(error) });
    } finally {
      setIsLoading(false);
    }
  };

  // 测试第三方登录
  const testOAuthLogin = async () => {
    setIsLoading(true);
    try {
      const result = await authApi.oauthLogin('wechat', 'test_code', 'test_state');
      addResult('第三方登录', result);
    } catch (error) {
      addResult('第三方登录', { error: error instanceof Error ? error.message : String(error) });
    } finally {
      setIsLoading(false);
    }
  };

  const envInfo = getEnvironmentInfo();

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>API 测试页面</h1>
      
      <div style={{ 
        marginBottom: '20px', 
        padding: '15px', 
        backgroundColor: '#e3f2fd', 
        borderRadius: '8px',
        border: `2px solid ${envInfo.color}`
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: envInfo.color }}>🌍 当前环境信息</h3>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <strong>环境类型:</strong> {envInfo.name}
          </div>
          <div>
            <strong>前端地址:</strong> {window.location.hostname}
          </div>
          <div>
            <strong>后端地址:</strong> {envInfo.backend}
          </div>
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>连接状态</h2>
        <div style={{ marginBottom: '15px' }}>
          {connectionStatus.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {connectionStatus.map((status, index) => (
                <div 
                  key={index}
                  style={{ 
                    padding: '8px 12px', 
                    backgroundColor: status.status === 'success' ? '#d4edda' : '#f8d7da',
                    color: status.status === 'success' ? '#155724' : '#721c24',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  <strong>{status.url}</strong>: {status.message}
                </div>
              ))}
            </div>
          ) : (
            <p>正在检测连接状态...</p>
          )}
        </div>
        
        <h2>测试操作</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={testConnections} 
            disabled={isLoading}
            style={{ padding: '10px 20px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            重新测试连接
          </button>
          <button 
            onClick={testRegister} 
            disabled={isLoading}
            style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            测试注册
          </button>
          <button 
            onClick={testLogin} 
            disabled={isLoading}
            style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            测试登录
          </button>
          <button 
            onClick={testGetUserInfo} 
            disabled={isLoading}
            style={{ padding: '10px 20px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            获取用户信息
          </button>
          <button 
            onClick={testLogout} 
            disabled={isLoading}
            style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            测试登出
          </button>
          <button 
            onClick={testOAuthLogin} 
            disabled={isLoading}
            style={{ padding: '10px 20px', backgroundColor: '#6f42c1', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            第三方登录
          </button>
          <button 
            onClick={clearResults} 
            style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            清除结果
          </button>
        </div>
      </div>

      {isLoading && (
        <div style={{ padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px', marginBottom: '20px' }}>
          正在测试中...
        </div>
      )}

      <div>
        <h2>测试结果</h2>
        {testResults.length === 0 ? (
          <p>暂无测试结果</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {testResults.map((item, index) => (
              <div 
                key={index} 
                style={{ 
                  padding: '15px', 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '4px',
                  border: '1px solid #dee2e6'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <strong>{item.test}</strong>
                  <span style={{ color: '#6c757d', fontSize: '12px' }}>{item.timestamp}</span>
                </div>
                <pre style={{ 
                  backgroundColor: '#fff', 
                  padding: '10px', 
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '12px',
                  margin: 0
                }}>
                  {JSON.stringify(item.result, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '30px' }}>
        <h2>测试说明</h2>
        <div style={{ backgroundColor: '#e9ecef', padding: '15px', borderRadius: '4px' }}>
          <h3>可用的测试用户：</h3>
          <ul>
            <li><strong>管理员</strong>: admin@echosoul.com / admin123</li>
            <li><strong>演示用户</strong>: demo@echosoul.com / demo123</li>
            <li><strong>手机用户</strong>: 18612345678 / test123</li>
            <li><strong>快速测试</strong>: quicktest@echosoul.com / 123456</li>
          </ul>
          
          <h3>API 端点：</h3>
          <ul>
            <li>注册: POST /api/auth/register</li>
            <li>登录: POST /api/auth/login</li>
            <li>用户信息: GET /api/auth/user/info</li>
            <li>登出: POST /api/auth/logout</li>
            <li>第三方登录: POST /api/auth/oauth/login</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ApiTestPage;
