// API服务配置和请求工具
// 根据环境自动选择对应的后端服务地址
const getApiBaseUrls = () => {
  const hostname = window.location.hostname;
  
  // 测试环境
  if (hostname === 'pcbzodaitkpj.sealosbja.site') {
    return [
      'https://glbbvnrguhix.sealosbja.site',  // 测试环境后端
      'http://localhost:8080',  // 本地开发备用
    ];
  }
  
  // 线上环境
  if (hostname === 'jqpiogolcznu.sealosbja.site') {
    return [
      'https://rmlqwqpmrpnw.sealosbja.site',  // 线上环境后端
      'https://glbbvnrguhix.sealosbja.site',  // 测试环境备用
      'http://localhost:8080',  // 本地开发备用
    ];
  }
  
  // 本地开发环境
  return [
    'https://glbbvnrguhix.sealosbja.site',  // 默认使用测试环境
    'http://localhost:8080',  // 本地开发备用
  ];
};

const API_BASE_URLS = getApiBaseUrls();

// API响应接口
export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

// 用户信息接口
export interface UserInfo {
  id: number;
  username: string;
  email: string | null;
  mobile: string | null;
  nickname: string;
  avatar: string | null;
  status: number;
  lastLoginTime: string;
  createTime: string;
}

// 登录响应接口
export interface LoginResponse {
  token: string;
  userInfo: UserInfo;
  isNewUser: boolean;
}

// 注册请求接口
export interface RegisterRequest {
  mobileOrEmail: string;
  password: string;
  confirmPassword: string;
  nickname?: string;
}

// 登录请求接口
export interface LoginRequest {
  username: string;
  password: string;
}

// 修改密码请求接口
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// 修改资料请求接口
export interface UpdateProfileRequest {
  nickname?: string;
  avatar?: string;
}


// HTTP请求工具类
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // 获取认证头
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('echosoul_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  // 通用请求方法
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    // 尝试所有可用的API地址
    for (const baseUrl of API_BASE_URLS) {
      try {
        const url = `${baseUrl}${endpoint}`;
        console.log(`🔄 尝试请求: ${url}`);
        
        const response = await fetch(url, {
          ...config,
          mode: 'cors', // 启用CORS
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ 请求成功: ${url}`);
          return data;
        } else {
          console.log(`❌ 请求失败: ${url} - ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ 请求错误: ${baseUrl}${endpoint}`, error);
      }
    }

    // 所有地址都失败
    throw new Error('所有API服务器都不可用，请检查网络连接');
  }

  // GET请求
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST请求
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT请求
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE请求
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// 创建API客户端实例
const apiClient = new ApiClient(API_BASE_URLS[0]);

// 认证相关API
export const authApi = {
  // 用户注册
  async register(data: RegisterRequest): Promise<ApiResponse<{ userId: number; username: string; nickname: string }>> {
    return apiClient.post('/api/auth/register', data);
  },

  // 用户登录
  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post('/api/auth/login', data);
  },

  // 获取用户信息
  async getUserInfo(): Promise<ApiResponse<UserInfo>> {
    return apiClient.get('/api/auth/user/info');
  },

  // 修改用户资料
  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<UserInfo>> {
    return apiClient.put('/api/auth/user/profile', data);
  },

  // 修改密码
  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<{ message: string }>> {
    return apiClient.put('/api/auth/user/password', data);
  },

  // 刷新Token
  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return apiClient.post('/api/auth/refresh');
  },

  // 用户登出
  async logout(): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post('/api/auth/logout');
  },

  // 第三方登录
  async oauthLogin(oauthType: string, oauthCode: string, oauthState?: string): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post('/api/auth/oauth/login', {
      oauthType,
      oauthCode,
      oauthState,
    });
  },
};

// Token管理工具
export const tokenManager = {
  // 保存Token
  setToken(token: string): void {
    localStorage.setItem('echosoul_token', token);
  },

  // 获取Token
  getToken(): string | null {
    return localStorage.getItem('echosoul_token');
  },

  // 删除Token
  removeToken(): void {
    localStorage.removeItem('echosoul_token');
  },

  // 检查Token是否存在
  hasToken(): boolean {
    return !!this.getToken();
  },
};

// API连接测试工具
export const apiTester = {
  // 测试所有API地址的连接性
  async testAllConnections(): Promise<{ url: string; status: 'success' | 'error'; message: string }[]> {
    const results = [];
    
    for (const url of API_BASE_URLS) {
      try {
        const response = await fetch(`${url}/health`, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          results.push({
            url,
            status: 'success' as const,
            message: `连接成功: ${data.message || 'OK'}`
          });
        } else {
          results.push({
            url,
            status: 'error' as const,
            message: `HTTP ${response.status}: ${response.statusText}`
          });
        }
      } catch (error) {
        results.push({
          url,
          status: 'error' as const,
          message: error instanceof Error ? error.message : '连接失败'
        });
      }
    }
    
    return results;
  },

  // 测试特定API端点
  async testEndpoint(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any): Promise<any> {
    for (const baseUrl of API_BASE_URLS) {
      try {
        const url = `${baseUrl}${endpoint}`;
        const config: RequestInit = {
          method,
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
        };
        
        if (data && method === 'POST') {
          config.body = JSON.stringify(data);
        }
        
        const response = await fetch(url, config);
        
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.log(`测试端点失败: ${baseUrl}${endpoint}`, error);
      }
    }
    
    throw new Error(`所有服务器都无法访问端点: ${endpoint}`);
  }
};

// 错误处理工具
export const errorHandler = {
  // 处理API错误
  handleError(error: any): string {
    if (error.message) {
      return error.message;
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    return '未知错误，请稍后重试';
  },

  // 显示错误消息
  showError(message: string): void {
    // 这里可以集成toast通知库
    alert(message);
  },
};

export default apiClient;
