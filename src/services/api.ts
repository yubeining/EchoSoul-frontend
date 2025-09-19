// API服务配置和请求工具
// 根据环境自动选择对应的后端服务地址
const getApiBaseUrls = () => {
  const hostname = window.location.hostname;
  
  // 调试环境 - 前端：https://pcbzodaitkpj.sealosbja.site
  if (hostname === 'pcbzodaitkpj.sealosbja.site') {
    return [
      'https://glbbvnrguhix.sealosbja.site',  // 调试环境后端
    ];
  }
  
  // 线上环境 - 前端：https://cedezmdpgixn.sealosbja.site
  if (hostname === 'cedezmdpgixn.sealosbja.site') {
    return [
      'https://ohciuodbxwdp.sealosbja.site',  // 线上环境后端
      'https://glbbvnrguhix.sealosbja.site',   // 调试环境备用
    ];
  }
  
  // 本地开发环境
  return [
    'https://glbbvnrguhix.sealosbja.site',  // 默认使用调试环境
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
  uid: string;  // 新增：用户唯一标识符，8位字符串
  username: string;
  email: string | null;
  mobile: string | null;
  nickname: string;
  avatar: string | null;
  status: number;
  lastLoginTime: string;
  createTime: string;
}

// 用户搜索结果接口
export interface UserSearchResult {
  id: number;
  uid: string;
  username: string;
  nickname: string;
  email?: string;
  mobile?: string;
  avatar?: string;
  intro?: string;
  lastActive?: string;
  createdAt?: string;
}

// 分页信息接口
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 用户搜索响应接口
export interface UserSearchResponse {
  users: UserSearchResult[];
  pagination: PaginationInfo;
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

    let lastError: any = null;

    // 尝试所有可用的API地址
    for (const baseUrl of API_BASE_URLS) {
      try {
        const url = `${baseUrl}${endpoint}`;
        console.log(`🔄 尝试请求: ${url}`);
        
        const response = await fetch(url, {
          ...config,
          mode: 'cors', // 启用CORS
          credentials: 'omit', // 不发送cookies
          cache: 'no-cache', // 禁用缓存
          headers: {
            ...config.headers,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          return data;
        } else {
          // 尝试解析错误响应
          try {
            const errorData = await response.json();
            lastError = {
              message: errorData.msg || errorData.detail || `HTTP ${response.status}`,
              response: errorData,
              status: response.status
            };
          } catch {
            lastError = {
              message: `HTTP ${response.status}`,
              status: response.status
            };
          }
        }
      } catch (error: any) {
        
        // 如果是CORS错误，不要将其作为最终错误
        if (error.name === 'TypeError' && error.message.includes('CORS')) {
          console.log(`⚠️ CORS错误，跳过此地址: ${baseUrl}`);
          continue;
        }
        
        lastError = error;
      }
    }

    // 所有地址都失败，抛出最后一个错误
    if (lastError) {
      throw lastError;
    } else {
      throw new Error('所有API服务器都不可用，请检查网络连接');
    }
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
  async register(data: RegisterRequest): Promise<ApiResponse<{ userId: number; uid: string; username: string; nickname: string }>> {
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

// 用户搜索API
export const userApi = {
  // 搜索用户
  async searchUsers(keyword: string, page: number = 1, limit: number = 20): Promise<ApiResponse<UserSearchResponse>> {
    // 验证输入参数
    if (!keyword || keyword.trim().length < 2) {
      throw new Error('搜索关键词至少需要2个字符');
    }
    
    if (page < 1) {
      throw new Error('页码必须大于0');
    }
    
    if (limit < 1 || limit > 100) {
      throw new Error('每页数量必须在1-100之间');
    }
    
    const params = new URLSearchParams({
      keyword: keyword.trim(),
      page: page.toString(),
      limit: limit.toString()
    });
    
    
    try {
      const response = await apiClient.get(`/api/users/search?${params.toString()}`) as ApiResponse<UserSearchResponse>;
      return response;
    } catch (error: any) {
      console.error(`❌ 用户搜索失败:`, error);
      
      // 提供更友好的错误信息
      if (error.message?.includes('CORS')) {
        throw new Error('网络连接问题，请检查网络设置或联系管理员');
      } else if (error.status === 503) {
        throw new Error('服务暂时不可用，请稍后重试');
      } else if (error.status === 401) {
        throw new Error('请先登录后再进行搜索');
      } else if (error.status === 403) {
        throw new Error('没有权限进行用户搜索');
      } else {
        throw new Error(error.message || '搜索失败，请稍后重试');
      }
    }
  }
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
