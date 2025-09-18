import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, tokenManager, UserInfo, LoginRequest, RegisterRequest } from '../services/api';

// 认证上下文类型
interface AuthContextType {
  // 状态
  isAuthenticated: boolean;
  user: UserInfo | null;
  isLoading: boolean;
  
  // 方法
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUserInfo: () => Promise<void>;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 认证提供者组件
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化认证状态
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = tokenManager.getToken();
        if (token) {
          // 验证Token并获取用户信息
          const response = await authApi.getUserInfo();
          if (response.code === 1) {
            setUser(response.data);
            setIsAuthenticated(true);
          } else {
            // Token无效，清除
            tokenManager.removeToken();
          }
        }
      } catch (error) {
        console.error('初始化认证失败:', error);
        tokenManager.removeToken();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // 登录方法
  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authApi.login(credentials);
      
      if (response.code === 1) {
        const { token, userInfo } = response.data;
        
        // 保存Token和用户信息
        tokenManager.setToken(token);
        setUser(userInfo);
        setIsAuthenticated(true);
        
        return true;
      } else {
        throw new Error(response.msg);
      }
    } catch (error) {
      console.error('登录失败:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 注册方法
  const register = async (userData: RegisterRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authApi.register(userData);
      
      if (response.code === 1) {
        // 注册成功后自动登录
        const loginCredentials: LoginRequest = {
          username: userData.mobileOrEmail,
          password: userData.password,
        };
        
        return await login(loginCredentials);
      } else {
        throw new Error(response.msg);
      }
    } catch (error) {
      console.error('注册失败:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 登出方法
  const logout = async (): Promise<void> => {
    try {
      // 调用后端登出接口
      await authApi.logout();
    } catch (error) {
      console.error('登出请求失败:', error);
    } finally {
      // 无论后端请求是否成功，都清除本地状态
      tokenManager.removeToken();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // 刷新用户信息
  const refreshUserInfo = async (): Promise<void> => {
    try {
      const response = await authApi.getUserInfo();
      if (response.code === 1) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('刷新用户信息失败:', error);
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    isLoading,
    login,
    register,
    logout,
    refreshUserInfo,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 使用认证上下文的Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
