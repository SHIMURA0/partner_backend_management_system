// 用户类型
export interface User {
  id: string;
  username: string;
  email: string;
  companyName: string;
  role: 'admin' | 'partner';
  avatar?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  lastLoginAt?: Date;
}

// 样本状态
export type SampleStatus = 
  | 'pending'       // 待处理
  | 'processing'    // 检测中
  | 'completed'     // 已完成
  | 'failed'        // 检测失败
  | 'cancelled';    // 已取消

// 样本类型
export interface Sample {
  id: string;
  sampleCode: string;
  partnerId: string;
  partnerName: string;
  patientName: string;
  patientAge: number;
  patientGender: 'male' | 'female';
  collectionDate: Date;
  receivedDate: Date;
  status: SampleStatus;
  reportUrl?: string;
  notes?: string;
  progress: number; // 0-100
  estimatedCompletionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// AI聊天消息
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: string[];
}

// 培训课程
export interface TrainingCourse {
  id: string;
  title: string;
  description: string;
  duration: number; // 分钟
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  videoUrl?: string;
  documents: string[];
  quiz?: Quiz;
  completionCertificate?: string;
  createdAt: Date;
}

// 培训测验
export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  passingScore: number; // 及格分数
  timeLimit?: number; // 时间限制（分钟）
}

// 测验题目
export interface QuizQuestion {
  id: string;
  question: string;
  type: 'single' | 'multiple' | 'text';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
}

// 培训进度
export interface TrainingProgress {
  userId: string;
  courseId: string;
  progress: number; // 0-100
  completed: boolean;
  score?: number;
  certificateIssued: boolean;
  startedAt: Date;
  completedAt?: Date;
}

// 仪表板统计数据
export interface DashboardStats {
  totalSamples: number;
  completedSamples: number;
  pendingSamples: number;
  monthlyGrowth: number;
  averageProcessingTime: number;
  recentSamples: Sample[];
  statusDistribution: {
    status: SampleStatus;
    count: number;
  }[];
  monthlyStats: {
    month: string;
    samples: number;
  }[];
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// 分页类型
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 菜单项类型
export interface MenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
  path?: string;
} 