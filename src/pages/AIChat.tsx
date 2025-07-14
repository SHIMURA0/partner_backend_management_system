import { useState, useRef, useEffect } from 'react';
import {
  Card,
  Input,
  Button,
  Typography,
  Avatar,
  Space,
  message,
  Spin,
  Empty,
  Tag,
  Switch,
  Row,
  Col,
  Dropdown,
  Menu,
  Popover,
  List,
  Timeline
} from 'antd';
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  PaperClipOutlined,
  DownOutlined,
  ArrowLeftOutlined,
  HistoryOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  RightOutlined,
  LinkOutlined,
  CloseOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  LikeOutlined,
  DislikeOutlined,
  FilePdfOutlined
} from '@ant-design/icons';
import type { ChatMessage } from '../types';
import { mockApi, mockChatMessages } from '../services/mockData';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import guheLogo from '../assets/guhe_logo.png';
import duijiaofenImg from '../assets/duijiaofen.png';
import wechatLogo from '../assets/wechat.png'; // 路径根据实际情况调整

const { Text, Title } = Typography;
const { TextArea } = Input;

// 配置 worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

// 聊天历史记录类型
interface ChatHistoryItem {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
  messages: ChatMessage[];
}

const functions = [
  { key: '自由问答', label: '自由问答', icon: <i className="fas fa-chart-bar"></i> },
  { key: '报告解读', label: '报告解读', icon: <i className="fas fa-clipboard"></i> },
  { key: '对比分析', label: '对比分析', icon: <i className="fas fa-table"></i> },
  { key: '干预方案', label: '干预方案', icon: <i className="fas fa-check-square"></i> },
  { key: '益生菌咨询', label: '益生菌咨询', icon: <i className="fas fa-vial"></i> },
  { key: '科研查询', label: '科研查询', icon: <i className="fas fa-plus"></i> },
];

const quickQuestions = [
  '肠道菌群与免疫系统的关系？',
  '哪些食物可以增加有益菌？',
  '乳酸菌和双歧杆菌有什么区别？',
  '哪些肠道菌群和肥胖有关?'
];

const functionMenuItems = functions.map((func) => ({
  key: func.key,
  icon: func.icon,
  label: func.label,
}));

export const AIChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [deepThinking, setDeepThinking] = useState(true);
  const [activeFunction, setActiveFunction] = useState(functions[0].key);
  const [showChat, setShowChat] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [expandedSources, setExpandedSources] = useState<{[key: string]: boolean}>({});
  const [showSourcesSidebar, setShowSourcesSidebar] = useState(false);
  const [isChatFocused, setIsChatFocused] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<{[key: string]: boolean}>({});
  const [aiProcessing, setAiProcessing] = useState<{
    organizing: boolean;
    generating: boolean;
    completed: boolean;
    finalAnswer: string;
  }>({
    organizing: false,
    generating: false,
    completed: false,
    finalAnswer: ''
  });
  const [showReferencesPanel, setShowReferencesPanel] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [feedbackStates, setFeedbackStates] = useState<{[key: string]: 'like' | 'dislike' | null}>({});
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfNumPages, setPdfNumPages] = useState<number>(0);
  const [pdfDragOver, setPdfDragOver] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const pdfPreviewRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [showAskAI, setShowAskAI] = useState(false);
  const [askAIPos, setAskAIPos] = useState({ x: 0, y: 0 });

  // 模拟历史聊天记录
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([
    {
      id: '1',
      title: '肠道菌群与免疫系统的关系',
      lastMessage: '谢谢您的详细解答，我对肠道菌群有了更深的理解。',
      timestamp: new Date('2024-01-15 14:30'),
      messageCount: 8,
      messages: [] as ChatMessage[] // 模拟数据暂时为空，实际使用时会有完整消息
    },
    {
      id: '2',
      title: '益生菌的选择和使用',
      lastMessage: '请问双歧杆菌和乳酸菌哪个更适合我？',
      timestamp: new Date('2024-01-14 10:20'),
      messageCount: 12,
      messages: [] as ChatMessage[]
    },
    {
      id: '3',
      title: '肠道菌群检测报告解读',
      lastMessage: '我的拟杆菌门比例偏低，应该如何调理？',
      timestamp: new Date('2024-01-13 16:45'),
      messageCount: 15,
      messages: [] as ChatMessage[]
    },
    {
      id: '4',
      title: '饮食对肠道菌群的影响',
      lastMessage: '原来发酵食品对肠道健康这么重要！',
      timestamp: new Date('2024-01-12 09:15'),
      messageCount: 6,
      messages: [] as ChatMessage[]
    }
  ]);

  // 模拟公众号资源数据
  const mockSources = [
    {
      id: '1',
      title: '谷禾健康',
      description: '谷禾健康',
      followers: '12万',
      category: '健康科普',
      url: 'https://mp.weixin.qq.com/s/Euie7ALaGP59bP0I8GJYng?poc_token=HLm2cGijH23CLxHMdQNpljaQerS_-rxZzplBdvOz'
    },
    {
      id: '2',
      title: '肠道微生态',
      description: '肠道菌群研究前沿资讯',
      followers: '8.5万',
      category: '科研资讯',
      url: 'https://mp.weixin.qq.com/s/example2'
    },
    {
      id: '3',
      title: '益生菌科学',
      description: '益生菌与健康科学知识分享',
      followers: '6.2万',
      category: '科普教育',
      url: 'https://mp.weixin.qq.com/s/example3'
    },
    {
      id: '4',
      title: '微生物组学',
      description: '微生物组学研究与应用',
      followers: '4.8万',
      category: '学术研究',
      url: 'https://mp.weixin.qq.com/s/example4'
    }
  ];

  // 参考文献数据
  const references = [
    {
      id: '1',
      title: '肠道菌群与免疫系统相互作用的研究进展',
      authors: '张明, 李华, 王强',
      journal: '微生物学报',
      year: '2023',
      doi: '10.13344/j.microbiol.china.2023.001',
      abstract: '本文综述了肠道菌群与免疫系统之间的复杂相互作用机制，包括菌群对免疫细胞分化的影响以及免疫系统对菌群结构的调节作用。'
    },
    {
      id: '2',
      title: '益生菌在肠道健康中的作用机制',
      authors: '陈静, 刘伟, 赵敏',
      journal: '营养学报',
      year: '2023',
      doi: '10.13344/j.nutr.china.2023.002',
      abstract: '探讨了益生菌通过调节肠道菌群结构、增强肠道屏障功能、调节免疫反应等多种途径促进肠道健康的机制。'
    },
    {
      id: '3',
      title: '肠道菌群与代谢性疾病的关系',
      authors: '孙丽, 吴刚, 郑华',
      journal: '中华医学杂志',
      year: '2022',
      doi: '10.13344/j.med.china.2022.003',
      abstract: '系统分析了肠道菌群失调与肥胖、糖尿病等代谢性疾病发生发展的关系，为疾病预防和治疗提供新思路。'
    },
    {
      id: '4',
      title: '微生物组学技术在肠道菌群研究中的应用',
      authors: '林涛, 周红, 马超',
      journal: '生物技术通报',
      year: '2022',
      doi: '10.13344/j.biotech.china.2022.004',
      abstract: '介绍了16S rRNA测序、宏基因组学等先进技术在肠道菌群研究中的应用，为菌群研究提供技术支撑。'
    },
    {
      id: '5',
      title: '饮食对肠道菌群的影响及其健康意义',
      authors: '黄敏, 徐伟, 何芳',
      journal: '食品科学',
      year: '2023',
      doi: '10.13344/j.food.china.2023.005',
      abstract: '分析了不同饮食模式对肠道菌群结构的影响，探讨了饮食干预在菌群调节和健康维护中的作用。'
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [inputValue]);

  // 防止文件在页面其他地方被拖拽打开
  useEffect(() => {
    const handleGlobalDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleGlobalDrop = (e: DragEvent) => {
      e.preventDefault();
    };

    // 全局点击事件，点击聊天框外部时取消焦点
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as Element;
      const chatContainer = document.querySelector('[data-chat-container]');
      if (chatContainer && !chatContainer.contains(target)) {
        setIsChatFocused(false);
      }
    };

    document.addEventListener('dragover', handleGlobalDragOver);
    document.addEventListener('drop', handleGlobalDrop);
    document.addEventListener('click', handleGlobalClick);

    return () => {
      document.removeEventListener('dragover', handleGlobalDragOver);
      document.removeEventListener('drop', handleGlobalDrop);
      document.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    // 立即清理任何残留状态，防止冲突
    setLoading(true);
    setAiProcessing({
      organizing: false,
      generating: false,
      completed: false,
      finalAnswer: ''
    });

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setShowChat(true);

    try {
      // 第一阶段：整理资料
      setTimeout(() => {
        setAiProcessing(prev => ({
          ...prev,
          organizing: true
        }));
      }, 1000);

      // 第二阶段：生成回答
      setTimeout(() => {
        setAiProcessing(prev => ({
          ...prev,
          generating: true
        }));
      }, 3000);

      const response = await mockApi.sendChatMessage(inputValue.trim());

      // 完成所有阶段并创建Timeline消息
      const timelineMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date(),
        isTimelineMessage: true,
        timelineData: {
          organizing: true,
          generating: true,
          completed: true,
          finalAnswer: response.data.response
        }
      };

      setMessages(prev => [...prev, timelineMessage]);
      setLoading(false);
      setAiProcessing({
        organizing: false,
        generating: false,
        completed: false,
        finalAnswer: ''
      });

    } catch (error) {
      message.error('发送失败，请重试');
      setLoading(false);
      setAiProcessing({
        organizing: false,
        generating: false,
        completed: false,
        finalAnswer: ''
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    setActiveFunction(key);
  };

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setUploadedFiles(prev => [...prev, ...files]);
      files.forEach(file => {
        message.success(`已选择文件: ${file.name}`);
      });
    }
    // 重置input以便连续上传同一文件
    e.target.value = '';
  };

  const handleHistoryClick = (historyItem: ChatHistoryItem) => {
    // 加载选中的聊天记录
    if (historyItem.messages) {
      setMessages(historyItem.messages);
      setShowChat(true);
      message.success(`已加载聊天记录: ${historyItem.title}`);
    } else {
      message.info(`聊天记录: ${historyItem.title}`);
    }
    setHistoryVisible(false);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  };

  // 拖拽上传处理函数
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // 设置拖拽效果为复制，显示绿色加号
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // 检查是否真的离开了拖拽区域（避免子元素触发）
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // 设置拖拽效果为复制，保持绿色加号
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setUploadedFiles(prev => [...prev, ...files]);
      files.forEach(file => {
        message.success(`已上传文件: ${file.name}`);
      });
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // 删除单条历史记录
  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发点击加载
    setChatHistory(prev => prev.filter(item => item.id !== id));
    message.success('已删除聊天记录');
  };

  // 删除所有历史记录
  const deleteAllHistory = () => {
    setChatHistory([]);
    message.success('已清空所有聊天记录');
  };

  // 保存当前聊天记录
  const saveCurrentChat = () => {
    if (messages.length === 0) return;

    // 生成聊天标题（取第一条用户消息的前20个字符）
    const firstUserMessage = messages.find(msg => msg.role === 'user');
    const title = firstUserMessage
      ? firstUserMessage.content.slice(0, 20) + (firstUserMessage.content.length > 20 ? '...' : '')
      : '新的对话';

    // 获取最后一条消息作为预览
    const lastMessage = messages[messages.length - 1];
    const lastMessagePreview = lastMessage.content.slice(0, 50) + (lastMessage.content.length > 50 ? '...' : '');

    // 创建新的聊天记录
    const newChatRecord: ChatHistoryItem = {
      id: Date.now().toString(),
      title,
      lastMessage: lastMessagePreview,
      timestamp: new Date(),
      messageCount: messages.length,
      messages: [...messages] // 保存完整的消息记录
    };

    // 添加到历史记录（最新的在前面）
    setChatHistory(prev => [newChatRecord, ...prev]);
    message.success('聊天记录已保存');
  };

  // 返回首页并保存聊天记录
  const handleBackToHome = () => {
    saveCurrentChat();
    // 立即重置所有相关状态，避免动画
    setMessages([]); // 清空当前消息
    setShowChat(false); // 返回首页
    setActiveFunction(functions[0].key); // 重置为默认功能
    setPdfFile(null);
    setPdfUrl(null);
    setPdfNumPages(0);
    setPdfLoading(false);
    setPdfDragOver(false);
    setSelectedText('');
    setShowAskAI(false);
    setAskAIPos({ x: 0, y: 0 });
    // 重置AI处理状态
    setAiProcessing({
      organizing: false,
      generating: false,
      completed: false,
      finalAnswer: ''
    });
    // 重置其他状态
    setExpandedNodes({});
    setExpandedSources({});
    setShowSourcesSidebar(false);
    setShowReferencesPanel(false);
    setIsChatFocused(false);
    setHistoryVisible(false);
    setIsDragOver(false);
    setUploadedFiles([]);
    setFeedbackStates({});
  };

  // 切换来源展开状态
  const toggleSourceExpansion = (messageId: string) => {
    setShowSourcesSidebar(!showSourcesSidebar);
    setShowReferencesPanel(!showReferencesPanel);
  };

  // 切换节点展开/收起状态
  const toggleNodeExpansion = (nodeKey: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeKey]: !prev[nodeKey]
    }));
  };

  // 聊天框点击处理
  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡到全局点击处理器
    setIsChatFocused(true);
  };

  // 聊天框失焦处理
  const handleChatBlur = () => {
    setIsChatFocused(false);
  };

  // 历史记录弹出内容
  const historyContent = (
    <div className="w-80">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
        <Text strong className="text-gray-800">聊天记录</Text>
        <div className="flex items-center gap-2">
          <Text className="text-xs text-gray-500">{chatHistory.length} 条对话</Text>
          {chatHistory.length > 0 && (
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={deleteAllHistory}
              title="删除所有记录"
            >
              清空
            </Button>
          )}
        </div>
      </div>
      <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {chatHistory.length > 0 ? (
          <List
            size="small"
            dataSource={chatHistory}
            renderItem={(item) => (
              <List.Item
                className="!px-0 !py-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group"
                onClick={() => handleHistoryClick(item)}
              >
                <div className="w-full px-2 flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <Text className="text-sm font-medium text-gray-800 line-clamp-1 flex-1 mr-2">
                        {item.title}
                      </Text>
                      <Text className="text-xs text-gray-400 whitespace-nowrap">
                        {formatDate(item.timestamp)}
                      </Text>
                    </div>
                    <Text className="text-xs text-gray-500 line-clamp-2 mb-1">
                      {item.lastMessage}
                    </Text>
                    <Text className="text-xs text-gray-400">
                      {item.messageCount} 条消息
                    </Text>
                  </div>
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0"
                    onClick={(e) => deleteHistoryItem(item.id, e)}
                    title="删除此记录"
                  />
                </div>
              </List.Item>
            )}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无聊天记录"
            className="py-4"
          />
        )}
      </div>
    </div>
  );

  const handleFeedback = (messageId: string, feedback: 'like' | 'dislike') => {
    setFeedbackStates(prev => ({
      ...prev,
      [messageId]: prev[messageId] === feedback ? null : feedback
    }));
  };

  function onPdfLoadSuccess({ numPages }: { numPages: number }) {
    setPdfNumPages(numPages);
    setPdfLoading(false);
  }

  const handlePdfDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setPdfDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      setPdfLoading(true);
      setTimeout(() => {
        setPdfLoading(false);
      }, 1000);
    } else {
      message.error('请上传PDF文件');
    }
  };

  const handlePdfDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setPdfDragOver(true);
  };

  const handlePdfDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setPdfDragOver(false);
  };

  const handlePdfInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      setPdfLoading(true);
      setTimeout(() => {
        setPdfLoading(false);
      }, 1000);
    } else {
      message.error('请上传PDF文件');
    }
  };

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  useEffect(() => {
    if (activeFunction === '报告解读') {
      setPdfFile(null);
      setPdfUrl(null);
      setPdfNumPages(0);
      setPdfLoading(false);
    }
    // eslint-disable-next-line
  }, [activeFunction]);

  useEffect(() => {
    if (pdfUrl && pdfPreviewRef.current) {
      pdfPreviewRef.current.scrollTop = 0;
    }
  }, [pdfUrl, pdfNumPages]);

  useEffect(() => {
    if (!pdfUrl || !pdfPreviewRef.current) return;
    const handleScroll = () => {
      const container = pdfPreviewRef.current;
      if (!container) return;
      const scrollTop = container.scrollTop;
      let pageIdx = 0;
      for (let i = 0; i < pageRefs.current.length; i++) {
        const el = pageRefs.current[i];
        if (el && el.offsetTop <= scrollTop + 10) {
          pageIdx = i;
        }
      }
      setCurrentPage(pageIdx + 1);
    };
    const container = pdfPreviewRef.current;
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [pdfUrl, pdfNumPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [pdfUrl, pdfNumPages]);

  useEffect(() => {
    const pdfArea = pdfPreviewRef.current;
    if (!pdfArea) return;
    const handleMouseUp = (e: MouseEvent) => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim() && pdfPreviewRef.current) {
        const text = selection.toString().trim();
        setSelectedText(text);
        try {
          const rect = selection.getRangeAt(0).getBoundingClientRect();
          const containerRect = pdfPreviewRef.current.getBoundingClientRect();
          setAskAIPos({
            x: rect.left - containerRect.left + (rect.right - rect.left) / 2,
            y: rect.top - containerRect.top
          });
        } catch {}
        setShowAskAI(true);
      } else {
        setShowAskAI(false);
      }
    };
    pdfArea.addEventListener('mouseup', handleMouseUp);
    return () => pdfArea.removeEventListener('mouseup', handleMouseUp);
  }, [pdfUrl, pdfNumPages]);

  const handleAskAI = () => {
    setInputValue(selectedText);
    setShowAskAI(false);
    textareaRef.current?.focus();
  };

  if (!showChat) {
    return (
      <div className="h-screen w-full flex items-center justify-center  bg-white overflow-hidden relative gap-3">
        {/* 报告解读区 - 带动画 */}
        <div
          className={`
            transition-all duration-300 ease-in-out
            ${activeFunction === '报告解读'
              ? 'w-3/4 opacity-100 translate-x-0'
              : 'w-0 opacity-0 -translate-x-full'
            }
            flex flex-col items-center justify-center h-full bg-gray-50 rounded-lg mr-1
          `}
          style={{ minWidth: 0 }}
        >
          {/* 加载动画优先显示 */}
          {pdfLoading ? (
            <div className="w-3/4 mx-auto mt-8 mb-4 p-6 flex items-center justify-center min-h-[180px]">
              <Spin size="large" tip="PDF加载中..." />
            </div>
          ) : pdfUrl ? (
            <div className="w-full flex flex-col items-center mt-2">
              {/* 悬浮AI解读按钮 */}
              {showAskAI && (
                <button
                  style={{
                    position: 'absolute',
                    left: askAIPos.x,
                    top: askAIPos.y + 50,
                    transform: 'translateX(-50%)',
                    zIndex: 9999
                  }}
                  className="bg-blue-500 text-white px-3 py-1 rounded shadow hover:bg-blue-600 transition-colors"
                  onClick={handleAskAI}
                >
                  AI解读
                </button>
              )}
              <div
                ref={pdfPreviewRef}
                className="bg-white rounded-lg p-1 min-h-[700px] w-[720px] max-h-[800px] overflow-y-auto relative"
              >
                <Document file={pdfUrl} onLoadSuccess={onPdfLoadSuccess} loading={<span className='text-gray-400'>加载中...</span>}>
                  {Array.from({ length: pdfNumPages }, (_, idx) => (
                    <div key={idx} ref={el => { pageRefs.current[idx] = el; }} className="mb-6">
                      <Page pageNumber={idx + 1} width={720} />
                    </div>
                  ))}
                </Document>
              </div>
              <div className="text-xs text-gray-500 text-center mt-2">第 {currentPage} 页 / 共 {pdfNumPages || '--'} 页</div>
            </div>
          ) : (
            <div
              className={`w-3/4 mx-auto mt-8 mb-4 p-6 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${pdfDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-white/60'}`}
              onDrop={handlePdfDrop}
              onDragOver={handlePdfDragOver}
              onDragLeave={handlePdfDragLeave}
              onClick={() => document.getElementById('pdf-upload-input')?.click()}
              style={{ minHeight: 160 }}
            >
              <input
                id="pdf-upload-input"
                type="file"
                accept="application/pdf"
                style={{ display: 'none' }}
                onChange={handlePdfInputChange}
              />
              <span className="text-2xl text-blue-400 mb-2"><FilePdfOutlined /></span>
              <span className="text-gray-700 font-medium">拖拽或点击上传PDF报告</span>
              <span className="text-xs text-gray-400 mt-1">仅支持PDF格式</span>
            </div>
          )}
        </div>
        <div className='w-[800px] h-[90vh] mx-auto'>
          {/* 右侧白色圆角主容器 */}
          <div className='w-full h-full bg-transparent rounded-lg flex flex-col'>
            {/* 输入区 */}
            <div
              className="w-full flex-1 flex flex-col items-center justify-center bg-transparent"
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleChatClick}
              onBlur={handleChatBlur}
              tabIndex={0}
              data-chat-container
            >
                {/* 标题区 */}
                <div className="text-center bg-transparent mb-8 mt-8">
                    <div className="flex items-center justify-center mb-2">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">探微知健，肠识新生</h1>
                        <span className="ml-3 px-2 py-0.5 bg-gradient-to-r from-sky-500 to-emerald-500 text-white text-xs rounded-lg">Beta</span>
                    </div>
                    <div className="text-gray-400 text-sm">融合AI科技与微生物组学，解析肠道菌群的健康密码</div>
                </div>
              {/* 拖拽覆盖层 - 只覆盖输入区域 */}
              {isDragOver && (
                <div className="absolute inset-0 bg-blue-50 bg-opacity-90 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center z-50">
                  <div className="text-center">
                    <CloudUploadOutlined className="text-4xl text-blue-500 mb-2" />
                    <div className="text-lg font-medium text-blue-600">拖拽文件到此处上传</div>
                    <div className="text-sm text-blue-400">支持多种文件格式</div>
                  </div>
                </div>
              )}
              {/* 已上传文件显示区域 */}
              {uploadedFiles.length > 0 && (
                <div className="w-full mx-auto mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <CloudUploadOutlined className="text-blue-500 mr-2" />
                      <Text className="text-sm font-medium text-gray-700">已上传文件 ({uploadedFiles.length})</Text>
                    </div>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-white rounded px-3 py-2">
                          <div className="flex items-center">
                            <PaperClipOutlined className="text-gray-400 mr-2" />
                            <Text className="text-sm text-gray-700">{file.name}</Text>
                            <Text className="text-xs text-gray-400 ml-2">({(file.size / 1024).toFixed(1)} KB)</Text>
                          </div>
                          <Button
                            type="text"
                            size="small"
                            className="text-gray-400 hover:text-red-500"
                            onClick={() => removeFile(index)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div
                className="bg-transparent border-1 border-gray-200 rounded-lg w-full px-4 pt-1 pb-2 mx-auto relative"
                onClick={handleChatClick}
              >
                {/* 输入框 */}
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  onClick={handleChatClick}
                  placeholder="例如：肠道菌群检测的原理是什么？拟杆菌门与健康的关系如何？..."
                  className="w-full rounded-xl py-3 text-base placeholder-neutral-400 focus:outline-none resize-none min-h-[10px] max-h-60"
                  rows={2}
                  style={{ minHeight: 32, maxHeight: 240, height: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                />
                {/* 按钮区：深度思考、功能选择、文件上传、发送 */}
                <div className="flex flex-row items-center gap-2 mt-0">
                  {/* 深度思考按钮，固定高度 */}
                  <div className="flex items-center bg-gray-50 rounded-lg p-2">
                    <ThunderboltOutlined className="mr-1 text-purple-500" />
                    <span className="text-left text-xs text-neutral-700 mr-1">深度思考</span>
                    <Switch
                      checked={deepThinking}
                      onChange={setDeepThinking}
                      size="small"
                      style={{
                        backgroundColor: deepThinking ? '#06b6d4' : '#d1d5db',
                      }}
                    />
                  </div>
                  {/* 功能选择按钮，单层灰色容器，和深度思考高度一致 */}
                  <Dropdown
                    menu={{
                      items: functionMenuItems,
                      onClick: handleMenuClick,
                      selectedKeys: [activeFunction],
                    }}
                    trigger={['click']}
                  >
                    <Button className="flex items-center !p-2 rounded-lg !border-none !shadow-none !bg-gray-50 hover:!bg-gray-200">
                      <span className="text-xs mr-1">{functions.find(f => f.key === activeFunction)?.label}</span>
                      <DownOutlined style={{ fontSize: 12 }} />
                    </Button>
                  </Dropdown>
                  {/* 历史记录按钮 */}
                  <Popover
                    content={historyContent}
                    title={null}
                    trigger="click"
                    open={historyVisible}
                    onOpenChange={setHistoryVisible}
                    placement="topLeft"
                    overlayClassName="history-popover"
                  >
                    <Button
                      icon={<HistoryOutlined />}
                      className="flex items-center !p-2 rounded-lg !border-none !shadow-none !bg-gray-50 hover:!bg-gray-200"
                    />
                  </Popover>
                  {/* 文件上传和发送按钮放最右侧 */}
                  <div className="flex items-center gap-2 ml-auto">
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                      multiple
                    />
                    <Button
                      icon={<PaperClipOutlined />}
                      shape="circle"
                      className="!border-none !bg-neutral-100 !text-neutral-500 hover:!bg-neutral-200"
                      onClick={handleFileUploadClick}
                    />
                    <Button
                      type="primary"
                      shape="circle"
                      icon={<SendOutlined />}
                      className="!border-none bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white flex items-center justify-center ml-1 w-7 h-7 aspect-square"
                      onClick={handleSend}
                      disabled={!inputValue.trim()}
                    />
                  </div>
                </div>
              </div>
              {/* 推荐问题 */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-2 w-[500px] mx-auto mt-4">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    className="px-4 py-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 text-sm rounded-lg transition-colors text-center cursor-pointer"
                    onClick={() => setInputValue(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex items-center justify-center bg-transparent overflow-hidden relative">
      <div className="flex w-full h-full">
        {/* 主聊天区域 */}
        <div className={`flex items-center justify-center w-full`}>
          <div className="w-full mx-auto flex flex-col items-center">
            {/* 返回按钮 - 主容器左上角 */}
            <div className="absolute top-4 left-4 z-10">
              <Button
                icon={<ArrowLeftOutlined />}
                shape="circle"
                className="!border-none !bg-gray-100 hover:!bg-gray-200 !text-gray-600"
                onClick={handleBackToHome}
              />
            </div>
            {/* 主容器 - 固定宽度白色圆角矩形 */}
            <div className={
              `flex flex-row w-[900px] h-[90vh] bg-transparent rounded-lg mx-auto overflow-hidden relative transition-transform duration-300 ${
                showReferencesPanel ? '-translate-x-40' : 'translate-x-0'
              }`
            }>
              {/* 左侧灰色容器，仅报告解读时显示 */}
              <div
                className={`
                  transition-all duration-300 ease-in-out
                  ${activeFunction === '报告解读'
                    ? 'w-2/3 opacity-100 translate-x-0'
                    : 'w-0 opacity-0 -translate-x-full'
                  }
                  flex items-center justify-center h-full bg-gray-50 border-r overflow-hidden
                `}
                style={{ minWidth: 0 }}
              >
                {activeFunction === '报告解读' && (
                  <span className="text-gray-400">报告解读区</span>
                )}
              </div>
              {/* 右侧AI聊天区 */}
              <div className={activeFunction === '报告解读' ? 'flex-1 h-full' : 'w-full h-full'}>
                {/* 聊天主区域内容 */}
                <div className="flex flex-col w-full h-full">
                  {/* 拖拽覆盖层 - 只覆盖主容器区域 */}
                  {isDragOver && (
                    <div className="absolute inset-0 bg-blue-50 bg-opacity-90 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center z-50">
                      <div className="text-center">
                        <CloudUploadOutlined className="text-4xl text-blue-500 mb-2" />
                        <div className="text-lg font-medium text-blue-600">拖拽文件到此处上传</div>
                        <div className="text-sm text-blue-400">支持多种文件格式</div>
                      </div>
                    </div>
                  )}

                  {/* 内容区 - 占据除了页脚外的所有空间 */}
                  <div className="flex-1 flex flex-col overflow-hidden pt-0">
                    {/* 聊天记录区域（可滚动） */}
                    <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
                      <div className="w-full mx-auto space-y-10 py-4 px-4">
                        {messages.map((message) => (
                          <div
                              key={message.id}
                              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            {message.role !== 'user' ? (
                                <div className="flex flex-col space-y-2">
                                  {/* AI消息：头像与名称在同一行 */}
                                  <div className="flex items-center space-x-2 mb-6">
                                    <Avatar
                                        size={20}
                                        icon={<RobotOutlined />}
                                        className="bg-gradient-to-r from-purple-500 to-blue-500"
                                    />
                                    <div className="text-sm font-medium text-gray-700 ml-3">生成回答中</div>
                                  </div>

                                  {/* 根据消息类型渲染不同格式 */}
                                  <div className="ml-1 w-full mx-auto"> {/* 缩进，与头像+名称对齐 */}
                                    {message.isTimelineMessage && message.timelineData ? (
                                      // Timeline格式的消息
                                      <div className=" rounded-lg p-0">
                                        <Timeline
                                          items={[
                                            {
                                              dot: <CheckCircleOutlined className="text-green-500" />,
                                              children: (
                                                <div>
                                                  <div
                                                    className="flex items-center justify-center mb-4 cursor-pointer hover:bg-gray-50 rounded-lg -m-1"
                                                    onClick={() => toggleNodeExpansion(`saved-organizing-${message.id}`)}
                                                  >
                                                    {/*<FileTextOutlined className="mr-2 text-blue-500" />*/}
                                                    <span className="text-sm font-bold text-gray-600">
                                                      整理资料
                                                    </span>
                                                    <Button
                                                      type="text"
                                                      size="small"
                                                      icon={expandedNodes[`saved-organizing-${message.id}`] === false ? <RightOutlined /> : <DownOutlined />}
                                                      className="text-gray-400 hover:text-gray-600 p-0 h-auto ml-auto"
                                                    />
                                                  </div>
                                                  {expandedNodes[`saved-organizing-${message.id}`] !== false && (
                                                    <div className="mt-2">
                                                      {/* 横向资源列表和展开按钮 */}
                                                      <div className="flex items-center gap-2">
                                                        <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1">
                                                          {mockSources.slice(0, 3).map((source, index) => (
                                                            <div
                                                              key={source.id}
                                                              className="flex-shrink-0 bg-gray-100 rounded-lg p-2 min-w-[120px] min-h-[120px] flex flex-col items-center justify-center hover:bg-blue-100 cursor-pointer transition-colors"
                                                              onClick={() => window.open(source.url, '_blank')}
                                                            >
                                                              {index === 0 ? (
                                                                <div className="flex flex-col items-center w-60">
                                                                  <img
                                                                    src={duijiaofenImg}
                                                                    alt="对甲酚"
                                                                    className="w-full h-24 object-cover rounded-lg mb-2"
                                                                  />
                                                                  <div className="flex items-center w-full justify-start ml-2">
                                                                      <div className="flex items-center mr-auto mr-2">
                                                                          <img src={wechatLogo} alt="wechat" className="w-4 h-4 mr-1" />
                                                                          <span className="text-xs text-green-600">公众号</span>
                                                                      </div>
                                                                    <img src={guheLogo} alt="logo" className="w-4 h-4 mr-1 bg-transparent inline-block align-middle" />
                                                                    <span className="!text-xs font-bold text-gray-800 truncate mr-2">{source.title}</span>

                                                                  </div>
                                                                </div>
                                                              ) : (
                                                                <div className="flex items-center">
                                                                  {/*<span className="text-blue-600 font-medium text-xs mr-1">{index + 1}</span>*/}
                                                                  <Text className="text-xs font-medium text-gray-800 truncate">{source.title}</Text>
                                                                </div>
                                                              )}
                                                              {/*<Text className="text-xs text-gray-600 line-clamp-3">{source.description}</Text>*/}
                                                            </div>
                                                          ))}
                                                        </div>
                                                        <Button
                                                          type="text"
                                                          size="small"
                                                          icon={showSourcesSidebar ? <DownOutlined /> : <RightOutlined />}
                                                          onClick={() => toggleSourceExpansion(message.id)}
                                                          className="text-gray-500 hover:text-gray-700 p-1 h-auto flex-shrink-0"
                                                        />
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              )
                                            },
                                            {
                                              dot: <CheckCircleOutlined className="text-green-500" />,
                                              children: (
                                                <div className="flex items-center">
                                                  <span className="text-sm text-green-600">
                                                    生成最终回答
                                                  </span>
                                                </div>
                                              )
                                            }
                                          ]}
                                        />

                                        {/* 独立的最终回答容器 */}
                                        {message.timelineData?.completed && message.timelineData?.finalAnswer && (
                                            <div className="w-[800px] bg-transparent rounded-lg py-0 px-0 -mt-10">
                                                <Text className="text-gray-800 whitespace-pre-line">
                                                  {message.timelineData.finalAnswer}
                                                </Text>
                                                <div className="w-full mx-auto mt-3 text-xs text-gray-500 flex items-center justify-between">
                                                  <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-2">
                                                      {new Date().toLocaleTimeString('zh-CN', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                      })}
                                                      <span className="text-gray-400">·</span>
                                                      <span className="text-gray-400">AI生成的内容仅供参考</span>
                                                    </div>
                                                  </div>
                                                  <div className="flex items-center gap-2 ml-auto">
                                                    <button
                                                      className={`flex items-center gap-1 px-2 py-1 rounded transition-colors cursor-pointer ${
                                                        feedbackStates[message.id] === 'like' 
                                                          ? 'text-blue-600 bg-blue-50' 
                                                          : 'text-gray-400 hover:text-blue-500'
                                                      }`}
                                                      onClick={() => handleFeedback(message.id, 'like')}
                                                    >
                                                      <LikeOutlined className="text-sm" />
                                                      <span className="text-xs">有帮助</span>
                                                    </button>
                                                    <button
                                                      className={`flex items-center gap-1 px-2 py-1 rounded transition-colors cursor-pointer ${
                                                        feedbackStates[message.id] === 'dislike' 
                                                          ? 'text-red-600 bg-red-50' 
                                                          : 'text-gray-400 hover:text-red-500'
                                                      }`}
                                                      onClick={() => handleFeedback(message.id, 'dislike')}
                                                    >
                                                      <DislikeOutlined className="text-sm" />
                                                      <span className="text-xs">待改进</span>
                                                    </button>
                                                  </div>
                                                </div>
                                             </div>
                                        )}
                                      </div>
                                    ) : (
                                      // 普通格式的消息
                                      <div>
                                        <div className="inline-block px-0 py-0 rounded-lg bg-transparent text-gray-800">
                                          <Text className="text-gray-800 whitespace-pre-line">
                                            {message.content}
                                          </Text>
                                        </div>
                                        <div className="mt-2 text-xs text-gray-500">
                                          {message.timestamp.toLocaleTimeString()}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                            ) : (
                                /* 用户消息不变 */
                                <div className="text-right">
                                  <div className="inline-block px-4 py-2 rounded-lg bg-gray-100 text-white">
                                    <Text className="text-white whitespace-pre-line">
                                      {message.content}
                                    </Text>
                                  </div>
                                  <div className="mt-1 text-xs text-gray-500 text-right">
                                    {message.timestamp.toLocaleTimeString()}
                                  </div>
                                </div>
                            )}
                          </div>
                        ))}

                        {/* Timeline加载状态显示 - 只在loading且有AI处理状态时显示 */}
                        {loading && (
                            <div className="flex justify-start">
                              <div className="flex flex-col space-y-1">
                                {/* 头像和名称水平排列 */}
                                <div className="flex items-center space-x-2 mb-5">
                                  <Avatar
                                      size={20}
                                      icon={<RobotOutlined />}
                                      className="bg-gradient-to-r from-purple-500 to-blue-500"
                                  />
                                  <div className="text-sm font-medium text-gray-700 ml-3">生成答案中</div>
                                </div>
                                {/* AI处理过程，缩进对齐 */}
                                <div className="ml-1">
                                  <div className="bg-transparent rounded-2xl p-0">
                                    <Timeline
                                      items={[
                                        {
                                          dot: aiProcessing.organizing ?
                                            <CheckCircleOutlined className="text-green-500" /> :
                                            <LoadingOutlined spin className="text-blue-500" />,
                                          children: (
                                            <div>
                                              <div
                                                className="flex items-center mb-2 cursor-pointer hover:bg-gray-50 rounded-lg p-1 -m-1"
                                                onClick={() => toggleNodeExpansion('organizing')}
                                              >
                                                {/*<FileTextOutlined className="mr-2 text-blue-500" />*/}
                                                <span className={`text-sm ${aiProcessing.organizing ? 'text-gray-600' : 'text-gray-600'}`}>
                                                  整理资料
                                                </span>
                                                {!aiProcessing.organizing && <Spin size="small" className="ml-2" />}
                                                {aiProcessing.organizing && (
                                                  <Button
                                                    type="text"
                                                    size="small"
                                                    icon={expandedNodes['organizing'] === false ? <RightOutlined /> : <DownOutlined />}
                                                    className="text-gray-400 hover:text-gray-600 p-0 h-auto ml-auto"
                                                  />
                                                )}
                                              </div>
                                              {aiProcessing.organizing && expandedNodes['organizing'] !== false && (
                                                <div className="ml-6 mt-2">
                                                  <div className="flex items-center mb-2">
                                                    <span className="text-sm font-medium text-gray-700">整理来源</span>
                                                  </div>

                                                  {/* 横向资源列表和展开按钮 */}
                                                  <div className="flex items-center gap-2">
                                                    <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1">
                                                      {mockSources.slice(0, 3).map((source, index) => (
                                                        <div key={source.id} className="flex-shrink-0 bg-blue-50 rounded-lg p-3 min-w-[120px] min-h-[80px]">
                                                          <div className="flex items-center mb-2">
                                                            <span className="text-blue-600 font-medium text-xs mr-1">{index + 1}</span>
                                                            <Text className="text-xs font-medium text-gray-800 truncate">{source.title}</Text>
                                                          </div>
                                                          <Text className="text-xs text-gray-600 line-clamp-3">{source.description}</Text>
                                                        </div>
                                                      ))}
                                                    </div>
                                                    <Button
                                                      type="text"
                                                      size="small"
                                                      icon={showSourcesSidebar ? <DownOutlined /> : <RightOutlined />}
                                                      onClick={() => toggleSourceExpansion('timeline')}
                                                      className="text-gray-500 hover:text-gray-700 p-0 h-auto flex-shrink-0"
                                                    />
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          )
                                        },
                                        // 只有第一个节点完成后才显示第二个节点
                                        ...(aiProcessing.organizing ? [{
                                          dot: aiProcessing.completed ?
                                            <CheckCircleOutlined className="text-green-500" /> :
                                            aiProcessing.generating ?
                                            <LoadingOutlined spin className="text-blue-500" /> :
                                            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>,
                                          children: (
                                            <div className="flex items-center">
                                              {/*<BulbOutlined className="mr-2 text-purple-500" />*/}
                                              <span className={`text-sm ${
                                                aiProcessing.completed ? 'text-green-600' : 
                                                aiProcessing.generating ? 'text-gray-600' : 'text-gray-400'
                                              }`}>
                                                生成最终回答
                                              </span>
                                              {aiProcessing.generating && !aiProcessing.completed && <Spin size="small" className="ml-2" />}
                                            </div>
                                          )
                                        }] : [])
                                      ]}
                                    />
                                  </div>
                                </div>

                              </div>
                            </div>
                        )}

                        {/* 滚动锚点 - 始终在消息列表底部 */}
                        <div ref={messagesEndRef} />
                      </div>
                    </div>

                    {/* 输入区域 */}
                    <div className="bg-transparent border-gray-100">
                      {/* 已上传文件显示区域 */}
                      {uploadedFiles.length > 0 && (
                        <div className="w-full mx-auto mb-2 px-4">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center mb-2">
                              <CloudUploadOutlined className="text-blue-500 mr-2" />
                              <Text className="text-sm font-medium text-gray-700">已上传文件 ({uploadedFiles.length})</Text>
                            </div>
                            <div className="space-y-2">
                              {uploadedFiles.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-white rounded px-3 py-2">
                                  <div className="flex items-center">
                                    <PaperClipOutlined className="text-gray-400 mr-2" />
                                    <Text className="text-sm text-gray-700">{file.name}</Text>
                                    <Text className="text-xs text-gray-400 ml-2">({(file.size / 1024).toFixed(1)} KB)</Text>
                                  </div>
                                  <Button
                                    type="text"
                                    size="small"
                                    className="text-gray-400 hover:text-red-500"
                                    onClick={() => removeFile(index)}
                                  >
                                    ×
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="bg-transparent border-1 border-gray-200 rounded-lg w-full px-4 pt-1 pb-2 mx-auto relative">
                        {/* 输入框 */}
                        <textarea
                          ref={textareaRef}
                          value={inputValue}
                          onChange={e => setInputValue(e.target.value)}
                          onKeyDown={handleKeyPress}
                          onClick={handleChatClick}
                          placeholder="例如：肠道菌群检测的原理是什么？拟杆菌门与健康的关系如何？..."
                          className="w-full rounded-xl py-3 text-base placeholder-neutral-400 focus:outline-none resize-none min-h-[10px] max-h-60"
                          rows={2}
                          style={{ minHeight: 32, maxHeight: 240, height: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                        />
                        {/* 按钮区：深度思考、功能选择、文件上传、发送 */}
                        <div className="flex flex-row items-center gap-2 mt-0">
                          {/* 深度思考按钮，固定高度 */}
                          <div className="flex items-center bg-gray-50 rounded-lg p-2">
                            <ThunderboltOutlined className="mr-1 text-purple-500" />
                            <span className="text-left text-xs text-neutral-700 mr-1">深度思考</span>
                            <Switch
                              checked={deepThinking}
                              onChange={setDeepThinking}
                              size="small"
                              style={{
                                backgroundColor: deepThinking ? '#06b6d4' : '#d1d5db',
                              }}
                            />
                          </div>
                          {/* 功能选择按钮，单层灰色容器，和深度思考高度一致 */}
                          <Dropdown
                            menu={{
                              items: functionMenuItems,
                              onClick: handleMenuClick,
                              selectedKeys: [activeFunction],
                            }}
                            trigger={['click']}
                          >
                            <Button className="flex items-center !p-2 rounded-lg !border-none !shadow-none !bg-gray-50 hover:!bg-gray-200">
                              <span className="text-xs mr-1">{functions.find(f => f.key === activeFunction)?.label}</span>
                              <DownOutlined style={{ fontSize: 12 }} />
                            </Button>
                          </Dropdown>
                          {/* 历史记录按钮 */}
                          <Popover
                            content={historyContent}
                            title={null}
                            trigger="click"
                            open={historyVisible}
                            onOpenChange={setHistoryVisible}
                            placement="topLeft"
                            overlayClassName="history-popover"
                          >
                            <Button
                              icon={<HistoryOutlined />}
                              className="flex items-center !p-2 rounded-lg !border-none !shadow-none !bg-gray-50 hover:!bg-gray-200"
                            />
                          </Popover>
                          {/* 文件上传和发送按钮放最右侧 */}
                          <div className="flex items-center gap-2 ml-auto">
                            <input
                              type="file"
                              ref={fileInputRef}
                              style={{ display: 'none' }}
                              onChange={handleFileChange}
                              multiple
                            />
                            <Button
                              icon={<PaperClipOutlined />}
                              shape="circle"
                              className="!border-none !bg-neutral-100 !text-neutral-500 hover:!bg-neutral-200"
                              onClick={handleFileUploadClick}
                            />
                            <Button
                              type="primary"
                              shape="circle"
                              icon={<SendOutlined />}
                              className="!border-none bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white flex items-center justify-center ml-1 w-7 h-7 aspect-square"
                              onClick={handleSend}
                              disabled={!inputValue.trim()}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 参考文献面板 - 右侧弹出 */}
        {showReferencesPanel && (
          <div className="fixed right-8 top-8 bottom-8 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-gray-100">
              <Text className="text-base font-medium text-gray-800">参考文献</Text>
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={() => setShowReferencesPanel(false)}
                className="text-gray-400 hover:text-gray-600"
              />
            </div>
            <div className="h-full overflow-y-auto p-3 space-y-2">
              {references.map((reference) => (
                <div
                  key={reference.id}
                  className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="mb-2">
                    <Text className="text-xs font-medium text-gray-800 line-clamp-2">
                      {reference.title}
                    </Text>
                  </div>
                  <div>
                    <Text className="text-xs text-gray-600 line-clamp-3">
                      {reference.abstract}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 