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
  Menu
} from 'antd';
import { 
  SendOutlined, 
  RobotOutlined, 
  UserOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  PaperClipOutlined,
  DownOutlined
} from '@ant-design/icons';
import type { ChatMessage } from '../types';
import { mockApi, mockChatMessages } from '../services/mockData';

const { Text, Title } = Typography;
const { TextArea } = Input;

const functions = [
  { key: '自由问答', label: '自由问答', icon: <i className="fas fa-chart-bar"></i> },
  { key: '报告总结', label: '报告总结', icon: <i className="fas fa-clipboard"></i> },
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);
    setShowChat(true);

    try {
      const response = await mockApi.sendChatMessage(inputValue.trim());
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      message.error('发送失败，请重试');
    } finally {
      setLoading(false);
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
    const file = e.target.files?.[0];
    if (file) {
      message.success(`已选择文件: ${file.name}`);
      // 这里可以添加上传逻辑
    }
    // 重置input以便连续上传同一文件
    e.target.value = '';
  };

  if (showChat) {
    return (
        <div className="w-full h-screen flex items-center justify-center bg-white">
          {/* 主容器 - 固定宽度白色圆角矩形 */}
          <div className="flex flex-col w-[800px] h-[90vh] bg-gray-100 rounded-lg shadow-sm mx-auto overflow-hidden">
            {/* 内容区 - 占据除了页脚外的所有空间 */}
            <div className="flex-1 flex flex-col overflow-hidden pt-4">

              {/* 聊天记录区域（可滚动） */}
              <div className="flex-1 overflow-y-auto min-h-0" ref={messagesEndRef}>
                <div className="max-w-3xl mx-auto space-y-6 py-4 px-0">
                  {messages.map((message) => (
                      <div
                          key={message.id}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.role !== 'user' ? (
                            <div className="flex flex-col space-y-1">
                              {/* AI消息：头像与名称在同一行 */}
                              <div className="flex items-center space-x-2 mb-1">
                                <Avatar
                                    size={28}
                                    icon={<RobotOutlined />}
                                    className="bg-gradient-to-r from-purple-500 to-blue-500"
                                />
                                <div className="text-sm font-medium text-gray-700 ml-3">谷禾菌</div>
                              </div>
                              {/* AI消息内容 */}
                              <div className="ml-10"> {/* 缩进，与头像+名称对齐 */}
                                <div className="inline-block p-4 rounded-2xl bg-gray-100 text-gray-800">
                                  <Text className="text-gray-800 whitespace-pre-line">
                                    {message.content}
                                  </Text>
                                </div>
                                <div className="mt-1 text-xs text-gray-500">
                                  {message.timestamp.toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                        ) : (
                            /* 用户消息不变 */
                            <div className="text-right">
                              <div className="inline-block p-4 rounded-2xl bg-gray-200 text-white">
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

                  {/* 加载状态显示 */}
                  {loading && (
                      <div className="flex justify-start">
                        <div className="flex flex-col space-y-1">
                          {/* 头像和名称水平排列 */}
                          <div className="flex items-center space-x-2 mb-1">
                            <Avatar
                                size={28}
                                icon={<RobotOutlined />}
                                className="bg-gradient-to-r from-purple-500 to-blue-500"
                            />
                            <div className="text-sm font-medium text-gray-700">谷禾菌</div>
                          </div>
                          {/* 思考中状态，缩进对齐 */}
                          <div className="ml-10">
                            <div className="bg-gray-100 rounded-2xl p-4">
                              <Space>
                                <Spin size="small" />
                                <Text className="text-gray-600">AI正在思考中...</Text>
                              </Space>
                            </div>
                          </div>
                        </div>
                      </div>
                  )}
                </div>
              </div>

              {/* 输入区域 */}
              <div className="bg-gray-200 border-t border-gray-100">
                <div className="w-full relative">
                  <div className="bg-white rounded-lg border-1 border-gray-100 w-[800px] px-4 pt-1 pb-2 mx-auto">
                    {/* 输入框 */}
                    <textarea
                        ref={textareaRef}
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        placeholder="例如：肠道菌群检测的原理是什么？拟杆菌门与健康的关系如何？..."
                        className="w-full rounded-xl py-3 text-base placeholder-neutral-400 focus:outline-none resize-none min-h-[10px] max-h-60"
                        rows={2}
                        style={{ minHeight: 32, maxHeight: 240, height: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                    />
                    {/* 按钮区：深度思考、功能选择、文件上传、发送 */}
                    <div className="flex flex-row items-center gap-2 mt-0">
                      {/* 深度思考按钮，固定高度 */}
                      <div className="flex items-center bg-gray-50 rounded-lg p-2">
                        <ThunderboltOutlined className="mr-1 text-neutral-700" />
                        <span className="text-left text-xs text-neutral-700 mr-1">深度思考</span>
                        <Switch
                            checked={deepThinking}
                            onChange={setDeepThinking}
                            size="small"
                            className="!bg-cyan-500"
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
                      {/* 文件上传和发送按钮放最右侧 */}
                      <div className="flex items-center gap-2 ml-auto">
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
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
                            className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white flex items-center justify-center transition-all duration-300 ml-1 w-7 h-7 aspect-square"
                            onClick={handleSend}
                            disabled={!inputValue.trim()}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/*/!* 页脚 - 固定在底部 *!/*/}
            {/*<footer className="px-4 py-2 text-center border-t border-gray-100">*/}
            {/*  <div className="flex justify-center items-center space-x-4 text-xs text-neutral-400">*/}
            {/*    <a href="#" className="hover:text-primary-500">用户协议</a>*/}
            {/*    <div className="h-3 w-px bg-neutral-300"></div>*/}
            {/*    <a href="#" className="hover:text-primary-500">隐私政策</a>*/}
            {/*    <div className="h-3 w-px bg-neutral-300"></div>*/}
            {/*    <div>备案号：Beijing-ZhiHaiTuAI-20231016</div>*/}
            {/*    <div className="h-3 w-px bg-neutral-300"></div>*/}
            {/*    <a href="#" className="hover:text-primary-500">© 2025 谷禾健康</a>*/}
            {/*  </div>*/}
            {/*</footer>*/}
          </div>
        </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-white overflow-hidden">
      <div className="w-full mx-auto flex flex-col items-center">
        {/* 标题区 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">探微知健，肠识新生</h1>
            <span className="ml-3 px-2 py-0.5 bg-gradient-to-r from-sky-500 to-emerald-500 text-white text-xs rounded-lg">Beta</span>
          </div>
          <div className="text-gray-400 text-sm">融合AI科技与微生物组学，解析肠道菌群的健康密码</div>
        </div>
        {/* 输入区 */}
        <div className="w-full mb-6 relative">
          <div className="bg-white rounded-lg border-1 border-gray-100 w-[800px] px-4 pt-1 pb-2 mx-auto">
            {/* 输入框 */}
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="例如：肠道菌群检测的原理是什么？拟杆菌门与健康的关系如何？..."
              className="w-full rounded-xl py-3 text-base placeholder-neutral-400 focus:outline-none resize-none min-h-[10px] max-h-60"
              rows={2}
              style={{ minHeight: 32, maxHeight: 240, height: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            />
            {/* 按钮区：深度思考、功能选择、文件上传、发送 */}
            <div className="flex flex-row items-center gap-2 mt-0">
              {/* 深度思考按钮，固定高度 */}
              <div className="flex items-center bg-gray-50 rounded-lg p-2">
                <ThunderboltOutlined className="mr-1 text-neutral-700" />
                <span className="text-left text-xs text-neutral-700 mr-1">深度思考</span>
                <Switch
                  checked={deepThinking}
                  onChange={setDeepThinking}
                  size="small"
                  className="!bg-cyan-500"
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
              {/* 文件上传和发送按钮放最右侧 */}
              <div className="flex items-center gap-2 ml-auto">
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
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
                  className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white flex items-center justify-center transition-all duration-300 ml-1 w-7 h-7 aspect-square"
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                />
              </div>
            </div>
          </div>
        </div>
        {/* 推荐问题 */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 w-[500px] mx-auto mt-2">
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
  );
}; 