import type { User, Sample, DashboardStats, TrainingCourse, ChatMessage } from '../types';

// 模拟用户数据
export const mockUser: User = {
  id: '1',
  username: 'partner001',
  email: 'partner@example.com',
  companyName: '上海健康医疗有限公司',
  role: 'partner',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  status: 'active',
  createdAt: new Date('2024-01-01'),
  lastLoginAt: new Date(),
};

// 模拟样本数据
export const mockSamples: Sample[] = [
  {
    id: '1',
    sampleCode: 'GM001234',
    partnerId: '1',
    partnerName: '上海健康医疗有限公司',
    patientName: '张三',
    patientAge: 35,
    patientGender: 'male',
    collectionDate: new Date('2024-01-15'),
    receivedDate: new Date('2024-01-16'),
    status: 'completed',
    reportUrl: '/reports/GM001234.pdf',
    notes: '样本质量良好',
    progress: 100,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '2',
    sampleCode: 'GM001235',
    partnerId: '1',
    partnerName: '上海健康医疗有限公司',
    patientName: '李四',
    patientAge: 28,
    patientGender: 'female',
    collectionDate: new Date('2024-01-16'),
    receivedDate: new Date('2024-01-17'),
    status: 'processing',
    progress: 65,
    estimatedCompletionDate: new Date('2024-01-25'),
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-22'),
  },
  {
    id: '3',
    sampleCode: 'GM001236',
    partnerId: '1',
    partnerName: '上海健康医疗有限公司',
    patientName: '王五',
    patientAge: 42,
    patientGender: 'male',
    collectionDate: new Date('2024-01-18'),
    receivedDate: new Date('2024-01-19'),
    status: 'pending',
    progress: 0,
    estimatedCompletionDate: new Date('2024-01-28'),
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: '4',
    sampleCode: 'GM001237',
    partnerId: '1',
    partnerName: '上海健康医疗有限公司',
    patientName: '赵六',
    patientAge: 31,
    patientGender: 'female',
    collectionDate: new Date('2024-01-20'),
    receivedDate: new Date('2024-01-21'),
    status: 'completed',
    reportUrl: '/reports/GM001237.pdf',
    progress: 100,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-23'),
  },
];

// 模拟仪表板数据
export const mockDashboardStats: DashboardStats = {
  totalSamples: 156,
  completedSamples: 142,
  pendingSamples: 8,
  monthlyGrowth: 12.5,
  averageProcessingTime: 7.2,
  recentSamples: mockSamples.slice(0, 5),
  statusDistribution: [
    { status: 'completed', count: 142 },
    { status: 'processing', count: 6 },
    { status: 'pending', count: 8 },
    { status: 'failed', count: 0 },
    { status: 'cancelled', count: 0 },
  ],
  monthlyStats: [
    { month: '2023-09', samples: 28 },
    { month: '2023-10', samples: 32 },
    { month: '2023-11', samples: 35 },
    { month: '2023-12', samples: 29 },
    { month: '2024-01', samples: 32 },
  ],
};

// 模拟培训课程数据
export const mockTrainingCourses: TrainingCourse[] = [
  {
    id: '1',
    title: '肠道菌群基础知识',
    description: '了解肠道菌群的基本构成、功能以及与人体健康的关系',
    duration: 60,
    difficulty: 'beginner',
    videoUrl: 'https://example.com/video1.mp4',
    documents: ['肠道菌群基础.pdf', '菌群分类学.pdf'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    title: '肠道菌群检测报告解读',
    description: '学习如何正确解读肠道菌群检测报告，理解各项指标的意义',
    duration: 90,
    difficulty: 'intermediate',
    videoUrl: 'https://example.com/video2.mp4',
    documents: ['报告解读指南.pdf', '指标参考范围.pdf'],
    createdAt: new Date('2024-01-05'),
  },
  {
    id: '3',
    title: '肠道菌群与疾病关联',
    description: '深入了解肠道菌群与各种疾病的关联性，掌握临床应用要点',
    duration: 120,
    difficulty: 'advanced',
    videoUrl: 'https://example.com/video3.mp4',
    documents: ['疾病关联研究.pdf', '临床应用指南.pdf'],
    createdAt: new Date('2024-01-10'),
  },
];

// 模拟聊天数据
export const mockChatMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'user',
    content: '肠道菌群失调会导致哪些健康问题？',
    timestamp: new Date('2024-01-22T10:00:00'),
  },
  {
    id: '2',
    role: 'assistant',
    content: '肠道菌群失调可能导致多种健康问题：\n\n1. **消化系统问题**：腹泻、便秘、腹胀、肠易激综合征等\n2. **免疫系统异常**：免疫力下降、过敏反应增加\n3. **代谢异常**：肥胖、糖尿病、代谢综合征\n4. **心理健康影响**：抑郁、焦虑等情绪问题\n5. **炎症性疾病**：炎症性肠病、关节炎等\n\n建议通过饮食调节、益生菌补充等方式维护肠道菌群平衡。',
    timestamp: new Date('2024-01-22T10:00:30'),
  },
  {
    id: '3',
    role: 'user',
    content: '如何通过饮食改善肠道菌群？',
    timestamp: new Date('2024-01-22T10:05:00'),
  },
  {
    id: '4',
    role: 'assistant',
    content: '通过饮食改善肠道菌群的方法：\n\n**增加有益菌**：\n- 发酵食品：酸奶、酸菜、泡菜、味噌\n- 益生菌补充剂\n\n**提供益生元**：\n- 膳食纤维：全谷物、豆类、蔬菜\n- 低聚糖：洋葱、大蒜、香蕉\n\n**避免有害因素**：\n- 减少加工食品\n- 限制抗生素使用\n- 控制糖分摄入\n\n**多样化饮食**：\n- 每周摄入30种以上不同植物性食物\n- 保持饮食规律',
    timestamp: new Date('2024-01-22T10:05:45'),
  },
];

// API模拟函数
export const mockApi = {
  login: async (username: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟网络延迟
    if (username === 'partner001' && password === '123456') {
      return { success: true, data: { user: mockUser, token: 'mock-jwt-token' } };
    }
    throw new Error('用户名或密码错误');
  },

  getDashboardStats: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, data: mockDashboardStats };
  },

  getSamples: async (page: number = 1, pageSize: number = 10) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedSamples = mockSamples.slice(startIndex, endIndex);
    
    return {
      success: true,
      data: {
        data: paginatedSamples,
        total: mockSamples.length,
        page,
        pageSize,
        totalPages: Math.ceil(mockSamples.length / pageSize),
      },
    };
  },

  getTrainingCourses: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, data: mockTrainingCourses };
  },

  sendChatMessage: async (message: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const response = `这是对"${message}"的AI回复。我是谷禾菌识AI助手，专门为您解答肠道菌群相关问题。`;
    return { success: true, data: { response } };
  },
}; 