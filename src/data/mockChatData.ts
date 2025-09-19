import { ChatMessage, ChatUser } from '../components/common/ChatDialog';
import { ChatHistoryItem } from '../components/common/ChatHistory';

// Mock用户数据
export const mockUsers: ChatUser[] = [
  {
    id: '10000001',
    username: 'alice_wang',
    nickname: '爱丽丝',
    avatar: 'https://via.placeholder.com/100x100/667eea/ffffff?text=A',
    status: 'online',
    lastActive: '刚刚'
  },
  {
    id: '10000002',
    username: 'bob_chen',
    nickname: '鲍勃',
    avatar: 'https://via.placeholder.com/100x100/764ba2/ffffff?text=B',
    status: 'offline',
    lastActive: '2小时前'
  },
  {
    id: '10000003',
    username: 'carol_li',
    nickname: '卡罗尔',
    avatar: 'https://via.placeholder.com/100x100/f093fb/ffffff?text=C',
    status: 'online',
    lastActive: '5分钟前'
  },
  {
    id: '10000006',
    username: 'user_admin',
    nickname: '更新昵称测试',
    avatar: 'https://via.placeholder.com/100x100/4facfe/ffffff?text=U',
    status: 'online',
    lastActive: '1小时前'
  }
];

// Mock聊天消息数据
export const mockMessages: { [chatId: string]: ChatMessage[] } = {
  '10000001': [
    {
      id: 'msg_1',
      senderId: '10000001',
      senderName: '爱丽丝',
      senderAvatar: 'https://via.placeholder.com/100x100/667eea/ffffff?text=A',
      content: '你好！很高兴认识你',
      timestamp: '2024-01-15T10:30:00Z',
      type: 'text'
    },
    {
      id: 'msg_2',
      senderId: 'current_user',
      senderName: '我',
      content: '你好爱丽丝！我也很高兴认识你',
      timestamp: '2024-01-15T10:32:00Z',
      type: 'text'
    },
    {
      id: 'msg_3',
      senderId: '10000001',
      senderName: '爱丽丝',
      senderAvatar: 'https://via.placeholder.com/100x100/667eea/ffffff?text=A',
      content: '你在做什么工作呢？',
      timestamp: '2024-01-15T10:35:00Z',
      type: 'text'
    },
    {
      id: 'msg_4',
      senderId: 'current_user',
      senderName: '我',
      content: '我是一名前端开发工程师，你呢？',
      timestamp: '2024-01-15T10:37:00Z',
      type: 'text'
    },
    {
      id: 'msg_5',
      senderId: '10000001',
      senderName: '爱丽丝',
      senderAvatar: 'https://via.placeholder.com/100x100/667eea/ffffff?text=A',
      content: '我是产品经理，负责AI产品的设计',
      timestamp: '2024-01-15T10:40:00Z',
      type: 'text'
    }
  ],
  '10000002': [
    {
      id: 'msg_6',
      senderId: 'current_user',
      senderName: '我',
      content: '鲍勃，你好！',
      timestamp: '2024-01-14T15:20:00Z',
      type: 'text'
    },
    {
      id: 'msg_7',
      senderId: '10000002',
      senderName: '鲍勃',
      senderAvatar: 'https://via.placeholder.com/100x100/764ba2/ffffff?text=B',
      content: '你好！有什么可以帮助你的吗？',
      timestamp: '2024-01-14T15:25:00Z',
      type: 'text'
    },
    {
      id: 'msg_8',
      senderId: 'current_user',
      senderName: '我',
      content: '想了解一下你们的技术栈',
      timestamp: '2024-01-14T15:30:00Z',
      type: 'text'
    },
    {
      id: 'msg_9',
      senderId: '10000002',
      senderName: '鲍勃',
      senderAvatar: 'https://via.placeholder.com/100x100/764ba2/ffffff?text=B',
      content: '我们主要使用React、Node.js和Python',
      timestamp: '2024-01-14T15:35:00Z',
      type: 'text'
    }
  ],
  '10000003': [
    {
      id: 'msg_10',
      senderId: '10000003',
      senderName: '卡罗尔',
      senderAvatar: 'https://via.placeholder.com/100x100/f093fb/ffffff?text=C',
      content: '今天天气真不错！',
      timestamp: '2024-01-15T09:15:00Z',
      type: 'text'
    },
    {
      id: 'msg_11',
      senderId: 'current_user',
      senderName: '我',
      content: '是的，阳光明媚',
      timestamp: '2024-01-15T09:18:00Z',
      type: 'text'
    },
    {
      id: 'msg_12',
      senderId: '10000003',
      senderName: '卡罗尔',
      senderAvatar: 'https://via.placeholder.com/100x100/f093fb/ffffff?text=C',
      content: '要不要一起去喝咖啡？',
      timestamp: '2024-01-15T09:20:00Z',
      type: 'text'
    }
  ],
  '10000006': [
    {
      id: 'msg_13',
      senderId: '10000006',
      senderName: '更新昵称测试',
      senderAvatar: 'https://via.placeholder.com/100x100/4facfe/ffffff?text=U',
      content: '你好！我是产品经理',
      timestamp: '2024-01-15T19:50:00Z',
      type: 'text'
    },
    {
      id: 'msg_14',
      senderId: 'current_user',
      senderName: '我',
      content: '你好！很高兴认识你',
      timestamp: '2024-01-15T19:52:00Z',
      type: 'text'
    },
    {
      id: 'msg_15',
      senderId: '10000006',
      senderName: '更新昵称测试',
      senderAvatar: 'https://via.placeholder.com/100x100/4facfe/ffffff?text=U',
      content: '你喜欢创新吗？',
      timestamp: '2024-01-15T19:55:00Z',
      type: 'text'
    }
  ]
};

// Mock聊天历史数据
export const mockChatHistory: ChatHistoryItem[] = [
  {
    id: '10000001',
    user: {
      id: '10000001',
      username: 'alice_wang',
      nickname: '爱丽丝',
      avatar: 'https://via.placeholder.com/100x100/667eea/ffffff?text=A',
      status: 'online'
    },
    lastMessage: {
      content: '我是产品经理，负责AI产品的设计',
      timestamp: '2024-01-15T10:40:00Z',
      senderId: '10000001'
    },
    unreadCount: 0,
    isPinned: true
  },
  {
    id: '10000006',
    user: {
      id: '10000006',
      username: 'user_admin',
      nickname: '更新昵称测试',
      avatar: 'https://via.placeholder.com/100x100/4facfe/ffffff?text=U',
      status: 'online'
    },
    lastMessage: {
      content: '你喜欢创新吗？',
      timestamp: '2024-01-15T19:55:00Z',
      senderId: '10000006'
    },
    unreadCount: 1,
    isPinned: false
  },
  {
    id: '10000003',
    user: {
      id: '10000003',
      username: 'carol_li',
      nickname: '卡罗尔',
      avatar: 'https://via.placeholder.com/100x100/f093fb/ffffff?text=C',
      status: 'online'
    },
    lastMessage: {
      content: '要不要一起去喝咖啡？',
      timestamp: '2024-01-15T09:20:00Z',
      senderId: '10000003'
    },
    unreadCount: 0,
    isPinned: false
  },
  {
    id: '10000002',
    user: {
      id: '10000002',
      username: 'bob_chen',
      nickname: '鲍勃',
      avatar: 'https://via.placeholder.com/100x100/764ba2/ffffff?text=B',
      status: 'offline'
    },
    lastMessage: {
      content: '我们主要使用React、Node.js和Python',
      timestamp: '2024-01-14T15:35:00Z',
      senderId: '10000002'
    },
    unreadCount: 0,
    isPinned: false
  }
];

// 获取用户信息
export const getUserById = (userId: string): ChatUser | undefined => {
  return mockUsers.find(user => user.id === userId);
};

// 获取聊天消息
export const getChatMessages = (chatId: string): ChatMessage[] => {
  return mockMessages[chatId] || [];
};

// 添加新消息
export const addMessage = (chatId: string, message: ChatMessage): void => {
  if (!mockMessages[chatId]) {
    mockMessages[chatId] = [];
  }
  mockMessages[chatId].push(message);
};

// 获取聊天历史
export const getChatHistory = (): ChatHistoryItem[] => {
  return mockChatHistory;
};

// 创建新聊天
export const createNewChat = (user: ChatUser): string => {
  const chatId = user.id;
  
  // 如果聊天已存在，直接返回
  if (mockMessages[chatId]) {
    return chatId;
  }
  
  // 创建新的聊天记录
  mockMessages[chatId] = [];
  
  // 添加到聊天历史
  const newChatItem: ChatHistoryItem = {
    id: chatId,
    user: {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
      status: user.status
    },
    lastMessage: {
      content: '开始聊天...',
      timestamp: new Date().toISOString(),
      senderId: 'system'
    },
    unreadCount: 0,
    isPinned: false
  };
  
  // 添加到历史记录顶部
  mockChatHistory.unshift(newChatItem);
  
  return chatId;
};



