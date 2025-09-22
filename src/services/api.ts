// API服务配置和请求工具
// 根据环境自动选择对应的后端服务地址
import { error as logError } from '../utils/logger';
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
      // 暂时移除备用服务器，避免503错误影响用户体验
      // 'https://glbbvnrguhix.sealosbja.site',   // 调试环境备用
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

// AI角色相关接口
export interface AICharacter {
  id: number;
  character_id: string;
  name: string;
  nickname: string;
  avatar: string | null;
  description: string | null;
  personality: string | null;
  background_story: string | null;
  speaking_style: string | null;
  creator_id: number;
  is_public: boolean;
  status: number;
  usage_count: number;
  like_count: number;
  create_time: string;
  update_time: string;
}

export interface CreateAICharacterRequest {
  name: string;
  nickname: string;
  avatar?: string;
  description?: string;
  personality?: string;
  background_story?: string;
  speaking_style?: string;
  is_public?: boolean;
}

export interface UpdateAICharacterRequest {
  name?: string;
  nickname?: string;
  avatar?: string;
  description?: string;
  personality?: string;
  background_story?: string;
  speaking_style?: string;
  is_public?: boolean;
}

export interface AICharacterListResponse {
  characters: AICharacter[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface AICharacterDetailResponse {
  character: AICharacter;
}

export interface CreateAICharacterResponse {
  character_id: string;
  message: string;
}

export interface AIConversationResponse {
  conversation_id: string;
  character_info: {
    id: number;
    character_id: string;
    name: string;
    nickname: string;
    avatar: string | null;
    description: string;
    personality: string;
    background_story: string;
    speaking_style: string;
    creator_id: number;
    is_public: boolean;
    status: number;
    usage_count: number;
    like_count: number;
    create_time: string;
    update_time: string;
  };
  message: string;
}

export interface CreateAIConversationRequest {
  character_id: string;
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
        
        // 创建AbortController用于超时控制
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒超时
        
        const response = await fetch(url, {
          ...config,
          mode: 'cors', // 启用CORS
          credentials: 'omit', // 不发送cookies，使用JWT Token认证
          cache: 'no-cache', // 禁用缓存
          signal: controller.signal, // 添加超时控制
          headers: {
            ...config.headers,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
        
        clearTimeout(timeoutId); // 清除超时定时器
        
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
        // 处理不同类型的错误
        if (error.name === 'AbortError') {
          lastError = {
            message: '请求超时，请检查网络连接',
            status: 0,
            type: 'timeout'
          };
        } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          lastError = {
            message: '网络连接失败，请检查网络设置或服务器状态',
            status: 0,
            type: 'network'
          };
        } else if (error.name === 'TypeError' && error.message.includes('CORS')) {
          // 如果是CORS错误，不要将其作为最终错误，继续尝试下一个服务器
          continue;
        } else {
          lastError = {
            message: error.message || '请求失败',
            status: 0,
            type: 'unknown'
          };
        }
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

// 请求去重管理
const pendingRequests = new Map<string, Promise<ApiResponse<UserInfo>>>();

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

  // 获取用户信息（带请求去重）
  async getUserInfo(): Promise<ApiResponse<UserInfo>> {
    const requestKey = 'getUserInfo';
    
    // 如果已有相同的请求正在进行，返回该请求的Promise
    if (pendingRequests.has(requestKey)) {
      return pendingRequests.get(requestKey)!;
    }
    
    // 创建新的请求
    const requestPromise = apiClient.get<UserInfo>('/api/auth/user/info');
    
    // 将请求存储到Map中
    pendingRequests.set(requestKey, requestPromise);
    
    // 请求完成后从Map中移除
    requestPromise.finally(() => {
      pendingRequests.delete(requestKey);
    });
    
    return requestPromise;
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
      logError(`用户搜索失败:`, error);
      
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
  },

  // 根据用户ID获取用户信息
  async getUserById(userId: number): Promise<ApiResponse<UserInfo>> {
    try {
      const response = await apiClient.get(`/api/users/${userId}`) as ApiResponse<UserInfo>;
      return response;
    } catch (error: any) {
      logError('根据用户ID获取用户信息失败:', error);
      throw new Error(error.message || '获取用户信息失败');
    }
  },

  // 根据用户UID获取用户信息（用于聊天页面显示用户资料）
  async getUserByUid(uid: string): Promise<ApiResponse<{ user: UserInfo }>> {
    try {
      const response = await apiClient.get(`/api/users/profile/${uid}`) as ApiResponse<{ user: UserInfo }>;
      return response;
    } catch (error: any) {
      logError('根据用户UID获取用户信息失败:', error);
      logError('错误详情:', {
        message: error.message,
        status: error.status,
        stack: error.stack
      });
      throw new Error(error.message || '获取用户信息失败');
    }
  }
};

// 聊天相关接口类型定义
export interface Conversation {
  conversation_id: string;
  user1_id: number;
  user2_id: number;
  conversation_name: string;
  last_message_id: number | null;
  last_message_time: string | null;
  status: number;
  create_time: string;
  update_time: string;
}

export interface ChatMessage {
  message_id: string;
  conversation_id: string;
  sender_id: number;
  receiver_id: number;
  content: string;
  message_type: 'text' | 'image' | 'voice' | 'video' | 'file' | 'emoji';
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  is_deleted: number;
  reply_to_message_id: string | null;
  create_time: string;
  update_time: string;
  // AI消息相关字段
  is_ai_message: boolean;
  ai_character_id: string | null;
  sender_name?: string;
  sender_avatar?: string;
}

// 聊天API
export const chatApi = {
  // 获取或创建会话
  async getOrCreateConversation(otherUserId: number): Promise<ApiResponse<Conversation>> {
    try {
      
      const response = await apiClient.post('/api/chat/conversations/get-or-create', {
        target_user_id: otherUserId
      }) as ApiResponse<Conversation>;
      
      return response;
    } catch (error: any) {
      logError('获取或创建会话失败:', error);
      
      // 提供更详细的错误信息
      if (error.status) {
        if (error.status === 401) {
          throw new Error('401: 登录已过期，请重新登录');
        } else if (error.status === 422) {
          throw new Error('422: 请求参数错误，请检查用户ID');
        } else if (error.status === 403) {
          throw new Error('403: 没有权限创建会话');
        } else if (error.status === 404) {
          throw new Error('404: 目标用户不存在');
        } else {
          throw new Error(`${error.status}: ${error.message || '服务器错误'}`);
        }
      } else {
        throw new Error(error.message || '网络错误，请检查连接');
      }
    }
  },

  // 获取用户会话列表
  async getConversations(user1Id?: number, user2Id?: number): Promise<ApiResponse<{ conversations: Conversation[] }>> {
    try {
      let url = '/api/chat/conversations';
      const params = new URLSearchParams();
      
      // 如果传入了用户ID，则添加查询参数
      if (user1Id !== undefined) {
        params.append('user1_id', user1Id.toString());
      }
      if (user2Id !== undefined) {
        params.append('user2_id', user2Id.toString());
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await apiClient.get(url) as ApiResponse<{ conversations: Conversation[] }>;
      
      // 检查响应状态码
      if (response.code === 200 || response.code === 1) {
        return response;
      } else {
        throw new Error(response.msg || '获取会话列表失败');
      }
    } catch (error: any) {
      logError('获取会话列表失败:', error);
      throw new Error(error.message || '获取会话列表失败');
    }
  },

  // 根据两个用户ID获取会话
  async getConversationByUsers(user1Id: number, user2Id: number): Promise<ApiResponse<Conversation>> {
    try {
      const response = await apiClient.get(`/api/chat/conversations?user1_id=${user1Id}&user2_id=${user2Id}`) as ApiResponse<Conversation[]>;
      
      
      if (response.code === 200 || response.code === 1) {
        const conversations = response.data;
        if (conversations && conversations.length > 0) {
          // 返回第一个匹配的会话
          return {
            code: response.code,
            msg: response.msg,
            data: conversations[0]
          };
        } else {
          throw new Error('未找到两个用户之间的会话');
        }
      } else {
        throw new Error(response.msg || '获取会话失败');
      }
    } catch (error: any) {
      logError('获取两个用户之间的会话失败:', error);
      throw new Error(error.message || '获取会话失败');
    }
  },

  // 根据会话ID获取会话详情
  async getConversationById(conversationId: string): Promise<ApiResponse<Conversation>> {
    try {
      const response = await apiClient.get(`/api/chat/conversations/${conversationId}`) as ApiResponse<Conversation>;
      return response;
    } catch (error: any) {
      logError('获取会话详情失败:', error);
      throw new Error(error.message || '获取会话详情失败');
    }
  },

  // 发送消息
  async sendMessage(
    conversationId: string,
    content: string,
    messageType: 'text' | 'image' | 'voice' | 'video' | 'file' | 'emoji' = 'text',
    fileUrl?: string,
    fileName?: string,
    fileSize?: number,
    replyToMessageId?: string
  ): Promise<ApiResponse<ChatMessage>> {
    try {
      const response = await apiClient.post('/api/chat/messages', {
        conversation_id: conversationId,
        content: content,
        message_type: messageType,
        file_url: fileUrl || null,
        file_name: fileName || null,
        file_size: fileSize || null,
        reply_to_message_id: replyToMessageId || null
      }) as ApiResponse<ChatMessage>;
      return response;
    } catch (error: any) {
      logError('发送消息失败:', error);
      throw new Error(error.message || '发送消息失败');
    }
  },

  // 获取会话消息列表
  async getMessages(conversationId: string, page: number = 1, limit: number = 20): Promise<ApiResponse<ChatMessage[]>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      const response = await apiClient.get(`/api/chat/conversations/${conversationId}/messages?${params.toString()}`) as ApiResponse<ChatMessage[]>;
      
      // 检查响应状态码
      if (response.code === 200 || response.code === 1) {
        return response;
      } else {
        throw new Error(response.msg || '获取消息列表失败');
      }
    } catch (error: any) {
      logError('获取消息列表失败:', error);
      throw new Error(error.message || '获取消息列表失败');
    }
  }
};

// AI角色相关API
export const aiCharacterApi = {
  // 创建AI角色
  async createCharacter(data: CreateAICharacterRequest): Promise<ApiResponse<CreateAICharacterResponse>> {
    try {
      const response = await apiClient.post('/api/ai/characters', data) as ApiResponse<CreateAICharacterResponse>;
      return response;
    } catch (error: any) {
      logError('创建AI角色失败:', error);
      throw new Error(error.message || '创建AI角色失败');
    }
  },

  // 获取AI角色列表
  async getCharacters(listType: 'public' | 'my' | 'favorited' = 'public', page: number = 1, limit: number = 20): Promise<ApiResponse<AICharacterListResponse>> {
    try {
      const response = await apiClient.get(`/api/ai/characters?list_type=${listType}&page=${page}&limit=${limit}`) as ApiResponse<AICharacterListResponse>;
      return response;
    } catch (error: any) {
      logError('获取AI角色列表失败:', error);
      throw new Error(error.message || '获取AI角色列表失败');
    }
  },

  // 获取AI角色详情
  async getCharacterDetail(characterId: string): Promise<ApiResponse<AICharacterDetailResponse>> {
    try {
      const response = await apiClient.get(`/api/ai/characters/${characterId}`) as ApiResponse<AICharacterDetailResponse>;
      return response;
    } catch (error: any) {
      logError('获取AI角色详情失败:', error);
      throw new Error(error.message || '获取AI角色详情失败');
    }
  },

  // 更新AI角色
  async updateCharacter(characterId: string, data: UpdateAICharacterRequest): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiClient.put(`/api/ai/characters/${characterId}`, data) as ApiResponse<{ message: string }>;
      return response;
    } catch (error: any) {
      logError('更新AI角色失败:', error);
      throw new Error(error.message || '更新AI角色失败');
    }
  },

  // 删除AI角色
  async deleteCharacter(characterId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiClient.delete(`/api/ai/characters/${characterId}`) as ApiResponse<{ message: string }>;
      return response;
    } catch (error: any) {
      logError('删除AI角色失败:', error);
      throw new Error(error.message || '删除AI角色失败');
    }
  },

  // 收藏AI角色
  async favoriteCharacter(characterId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiClient.post(`/api/ai/characters/${characterId}/favorite`) as ApiResponse<{ message: string }>;
      return response;
    } catch (error: any) {
      logError('收藏AI角色失败:', error);
      throw new Error(error.message || '收藏AI角色失败');
    }
  },

  // 取消收藏AI角色
  async unfavoriteCharacter(characterId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiClient.delete(`/api/ai/characters/${characterId}/favorite`) as ApiResponse<{ message: string }>;
      return response;
    } catch (error: any) {
      logError('取消收藏AI角色失败:', error);
      throw new Error(error.message || '取消收藏AI角色失败');
    }
  }
};

// AI对话相关API
export const aiChatApi = {
  // 创建用户-AI会话
  async createAIConversation(data: CreateAIConversationRequest): Promise<ApiResponse<AIConversationResponse>> {
    try {
      const response = await apiClient.post('/api/ai/conversations/ai', data) as ApiResponse<AIConversationResponse>;
      return response;
    } catch (error: any) {
      logError('创建AI会话失败:', error);
      throw new Error(error.message || '创建AI会话失败');
    }
  },

  // 获取用户AI会话列表
  async getAIConversations(page: number = 1, limit: number = 20): Promise<ApiResponse<{ conversations: any[]; total: number; page: number; limit: number }>> {
    try {
      const response = await apiClient.get(`/api/chat/conversations/ai?page=${page}&limit=${limit}`) as ApiResponse<{ conversations: any[]; total: number; page: number; limit: number }>;
      return response;
    } catch (error: any) {
      logError('获取AI会话列表失败:', error);
      throw new Error(error.message || '获取AI会话列表失败');
    }
  },

  // 发送消息到AI角色
  async sendMessageToAI(conversationId: string, content: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post(`/api/chat/messages/ai?conversation_id=${conversationId}&content=${encodeURIComponent(content)}`) as ApiResponse<any>;
      return response;
    } catch (error: any) {
      logError('发送消息到AI失败:', error);
      throw new Error(error.message || '发送消息到AI失败');
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
