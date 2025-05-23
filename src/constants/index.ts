// 路由常量
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  AI_CHAT: '/ai-chat',
  SAMPLE_MANAGEMENT: '/sample-management',
  TRAINING: '/training',
  TRAINING_COURSES: '/training/courses',
  TRAINING_PROGRESS: '/training/progress',
  TRAINING_CERTIFICATES: '/training/certificates',
} as const;

// 样本状态映射
export const SAMPLE_STATUS_MAP = {
  pending: { text: '待处理', color: 'orange' },
  processing: { text: '检测中', color: 'blue' },
  completed: { text: '已完成', color: 'green' },
  failed: { text: '检测失败', color: 'red' },
  cancelled: { text: '已取消', color: 'gray' },
} as const;

// 培训课程难度映射
export const DIFFICULTY_MAP = {
  beginner: { text: '初级', color: 'green' },
  intermediate: { text: '中级', color: 'orange' },
  advanced: { text: '高级', color: 'red' },
} as const;

// 性别映射
export const GENDER_MAP = {
  male: '男',
  female: '女',
} as const;

// API端点
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
  },
  SAMPLES: {
    LIST: '/api/samples',
    DETAIL: '/api/samples/:id',
    DOWNLOAD_REPORT: '/api/samples/:id/report',
  },
  DASHBOARD: {
    STATS: '/api/dashboard/stats',
  },
  TRAINING: {
    COURSES: '/api/training/courses',
    PROGRESS: '/api/training/progress',
    QUIZ: '/api/training/quiz',
  },
  AI_CHAT: {
    SEND_MESSAGE: '/api/ai-chat/send',
    GET_HISTORY: '/api/ai-chat/history',
  },
} as const;

// 本地存储键
export const STORAGE_KEYS = {
  USER_TOKEN: 'user_token',
  USER_INFO: 'user_info',
  CHAT_HISTORY: 'chat_history',
} as const;

// 分页默认配置
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: ['10', '20', '50', '100'],
} as const;

// 表格配置
export const TABLE_CONFIG = {
  SCROLL_Y: 'calc(100vh - 300px)',
} as const; 