import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Progress,
  Tag,
  Avatar,
  Space,
  Tabs,
  List,
  Badge,
  Modal,
  Descriptions,
  message,
  Empty
} from 'antd';
import {
  PlayCircleOutlined,
  BookOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  CheckCircleOutlined,
  StarOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import type { TrainingCourse, TrainingProgress } from '../types';
import { mockApi, mockTrainingCourses } from '../services/mockData';
import { DIFFICULTY_MAP } from '../constants';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export const Training = () => {
  const [courses, setCourses] = useState<TrainingCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<TrainingCourse | null>(null);
  const [courseModalVisible, setCourseModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('courses');

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await mockApi.getTrainingCourses();
        setCourses(response.data);
      } catch (error) {
        message.error('获取培训课程失败');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleStartCourse = (course: TrainingCourse) => {
    setSelectedCourse(course);
    setCourseModalVisible(true);
  };

  const handleStartLearning = () => {
    message.success('开始学习！即将跳转到视频播放页面...');
    setCourseModalVisible(false);
  };

  // 模拟进度数据
  const mockProgress: TrainingProgress[] = [
    {
      userId: '1',
      courseId: '1',
      progress: 100,
      completed: true,
      score: 85,
      certificateIssued: true,
      startedAt: new Date('2024-01-10'),
      completedAt: new Date('2024-01-15'),
    },
    {
      userId: '1',
      courseId: '2',
      progress: 60,
      completed: false,
      certificateIssued: false,
      startedAt: new Date('2024-01-16'),
    },
  ];

  const getProgressForCourse = (courseId: string) => {
    return mockProgress.find(p => p.courseId === courseId);
  };

  const getCourseStatus = (course: TrainingCourse) => {
    const progress = getProgressForCourse(course.id);
    if (!progress) return 'not-started';
    if (progress.completed) return 'completed';
    return 'in-progress';
  };

  const completedCourses = mockProgress.filter(p => p.completed).length;
  const totalCourses = courses.length;
  const certificates = mockProgress.filter(p => p.certificateIssued).length;

  return (
    <div className="w-full h-full p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <Title level={3} className="!mb-2">解读培训</Title>
          <Text className="text-gray-600">提升肠道菌群报告解读能力，获得专业资质认证</Text>
        </div>
      </div>

      {/* 统计概览 */}
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card className="!border-0 shadow-lg text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4">
              <BookOutlined className="text-2xl text-white" />
            </div>
            <Title level={4} className="!mb-2">{completedCourses}/{totalCourses}</Title>
            <Text className="text-gray-600">已完成课程</Text>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="!border-0 shadow-lg text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full mx-auto mb-4">
              <TrophyOutlined className="text-2xl text-white" />
            </div>
            <Title level={4} className="!mb-2">{certificates}</Title>
            <Text className="text-gray-600">获得证书</Text>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="!border-0 shadow-lg text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mx-auto mb-4">
              <StarOutlined className="text-2xl text-white" />
            </div>
            <Title level={4} className="!mb-2">
              {mockProgress.reduce((acc, p) => acc + (p.score || 0), 0) / mockProgress.filter(p => p.score).length || 0}%
            </Title>
            <Text className="text-gray-600">平均成绩</Text>
          </Card>
        </Col>
      </Row>

      {/* 主要内容 */}
      <Card className="!border-0 shadow-lg">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="课程学习" key="courses">
            <Row gutter={[24, 24]}>
              {courses.map(course => {
                const status = getCourseStatus(course);
                const progress = getProgressForCourse(course.id);
                
                return (
                  <Col xs={24} lg={12} xl={8} key={course.id}>
                    <Card 
                      className="h-full hover:shadow-xl transition-shadow !border-0 shadow-md"
                      actions={[
                        <Button
                          key="start"
                          type="primary"
                          icon={status === 'not-started' ? <PlayCircleOutlined /> : <BookOutlined />}
                          onClick={() => handleStartCourse(course)}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 border-0"
                        >
                          {status === 'not-started' ? '开始学习' : status === 'completed' ? '重新学习' : '继续学习'}
                        </Button>
                      ]}
                    >
                      <div className="space-y-4">
                        {/* 课程状态标识 */}
                        <div className="flex items-center justify-between">
                          <Tag color={DIFFICULTY_MAP[course.difficulty].color}>
                            {DIFFICULTY_MAP[course.difficulty].text}
                          </Tag>
                          {status === 'completed' && (
                            <Badge count={<CheckCircleOutlined className="text-green-500" />} />
                          )}
                          {status === 'in-progress' && (
                            <Badge count={<ClockCircleOutlined className="text-orange-500" />} />
                          )}
                        </div>

                        {/* 课程标题 */}
                        <Title level={5} className="!mb-2">
                          {course.title}
                        </Title>

                        {/* 课程描述 */}
                        <Text className="text-gray-600 text-sm line-clamp-2">
                          {course.description}
                        </Text>

                        {/* 课程信息 */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <Space>
                              <ClockCircleOutlined />
                              <span>{course.duration}分钟</span>
                            </Space>
                            <Space>
                              <FileTextOutlined />
                              <span>{course.documents.length}份资料</span>
                            </Space>
                          </div>

                          {/* 学习进度 */}
                          {progress && (
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <Text className="text-sm text-gray-600">学习进度</Text>
                                <Text className="text-sm font-medium">{progress.progress}%</Text>
                              </div>
                              <Progress 
                                percent={progress.progress} 
                                size="small"
                                strokeColor={
                                  progress.completed ? '#52c41a' : '#1890ff'
                                }
                              />
                            </div>
                          )}

                          {/* 成绩显示 */}
                          {progress?.score && (
                            <div className="flex justify-between items-center">
                              <Text className="text-sm text-gray-600">测验成绩</Text>
                              <Text className={`text-sm font-medium ${
                                progress.score >= 80 ? 'text-green-600' : 
                                progress.score >= 60 ? 'text-orange-600' : 'text-red-600'
                              }`}>
                                {progress.score}分
                              </Text>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </TabPane>

          <TabPane tab="学习进度" key="progress">
            <List
              dataSource={mockProgress}
              renderItem={progress => {
                const course = courses.find(c => c.id === progress.courseId);
                if (!course) return null;

                return (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          size={48} 
                          icon={<BookOutlined />}
                          className={`${
                            progress.completed ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                        />
                      }
                      title={
                        <div className="flex items-center justify-between">
                          <Text className="font-medium">{course.title}</Text>
                          <Space>
                            {progress.completed && (
                              <Tag color="green" icon={<CheckCircleOutlined />}>
                                已完成
                              </Tag>
                            )}
                            {!progress.completed && (
                              <Tag color="processing" icon={<ClockCircleOutlined />}>
                                学习中
                              </Tag>
                            )}
                          </Space>
                        </div>
                      }
                      description={
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Text className="text-sm text-gray-600">
                              开始时间：{progress.startedAt.toLocaleDateString()}
                            </Text>
                            {progress.completedAt && (
                              <Text className="text-sm text-gray-600">
                                完成时间：{progress.completedAt.toLocaleDateString()}
                              </Text>
                            )}
                          </div>
                          <div className="w-64">
                            <Progress 
                              percent={progress.progress} 
                              size="small"
                              strokeColor={progress.completed ? '#52c41a' : '#1890ff'}
                            />
                          </div>
                          {progress.score && (
                            <Text className="text-sm text-gray-600">
                              测验成绩：
                              <span className={`font-medium ml-1 ${
                                progress.score >= 80 ? 'text-green-600' : 
                                progress.score >= 60 ? 'text-orange-600' : 'text-red-600'
                              }`}>
                                {progress.score}分
                              </span>
                            </Text>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          </TabPane>

          <TabPane tab="我的证书" key="certificates">
            <Row gutter={[24, 24]}>
              {mockProgress.filter(p => p.certificateIssued).map(progress => {
                const course = courses.find(c => c.id === progress.courseId);
                if (!course) return null;

                return (
                  <Col xs={24} md={12} lg={8} key={progress.courseId}>
                    <Card className="!border-0 shadow-md hover:shadow-xl transition-shadow">
                      <div className="text-center space-y-4">
                        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mx-auto">
                          <TrophyOutlined className="text-2xl text-white" />
                        </div>
                        
                        <div>
                          <Title level={5} className="!mb-1">
                            {course.title}
                          </Title>
                          <Text className="text-gray-600 text-sm">
                            完成证书
                          </Text>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm text-gray-600">
                            完成日期：{progress.completedAt?.toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-600">
                            成绩：<span className="font-medium text-green-600">{progress.score}分</span>
                          </div>
                        </div>

                        <Button 
                          type="primary" 
                          icon={<DownloadOutlined />}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 border-0"
                          onClick={() => message.success('证书下载功能开发中...')}
                        >
                          下载证书
                        </Button>
                      </div>
                    </Card>
                  </Col>
                );
              })}
              
              {mockProgress.filter(p => p.certificateIssued).length === 0 && (
                <Col span={24}>
                  <Empty
                    image={<TrophyOutlined className="text-6xl text-gray-300" />}
                    description={
                      <div className="text-center">
                        <Text className="text-gray-500">
                          您还没有获得任何证书
                        </Text>
                        <br />
                        <Text className="text-gray-400 text-sm">
                          完成课程学习并通过测验即可获得证书
                        </Text>
                      </div>
                    }
                  />
                </Col>
              )}
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      {/* 课程详情模态框 */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <BookOutlined className="text-blue-500" />
            <span>课程详情</span>
          </div>
        }
        open={courseModalVisible}
        onCancel={() => setCourseModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setCourseModalVisible(false)}>
            取消
          </Button>,
          <Button
            key="start"
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={handleStartLearning}
            className="bg-gradient-to-r from-blue-500 to-purple-600 border-0"
          >
            开始学习
          </Button>,
        ]}
      >
        {selectedCourse && (
          <div className="space-y-6">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="课程名称">
                {selectedCourse.title}
              </Descriptions.Item>
              <Descriptions.Item label="课程描述">
                {selectedCourse.description}
              </Descriptions.Item>
              <Descriptions.Item label="难度等级">
                <Tag color={DIFFICULTY_MAP[selectedCourse.difficulty].color}>
                  {DIFFICULTY_MAP[selectedCourse.difficulty].text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="学习时长">
                <Space>
                  <ClockCircleOutlined />
                  {selectedCourse.duration}分钟
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="课程资料">
                <div className="space-y-2">
                  {selectedCourse.documents.map((doc, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <FileTextOutlined className="text-blue-500" />
                      <Text>{doc}</Text>
                    </div>
                  ))}
                </div>
              </Descriptions.Item>
              {selectedCourse.videoUrl && (
                <Descriptions.Item label="视频链接">
                  <Space>
                    <VideoCameraOutlined className="text-red-500" />
                    <Text className="text-blue-600">点击开始学习观看视频</Text>
                  </Space>
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* 学习进度 */}
            {(() => {
              const progress = getProgressForCourse(selectedCourse.id);
              if (progress) {
                return (
                  <Card title="学习进度" className="!border-gray-200">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Text>完成进度</Text>
                          <Text className="font-medium">{progress.progress}%</Text>
                        </div>
                        <Progress 
                          percent={progress.progress} 
                          strokeColor={progress.completed ? '#52c41a' : '#1890ff'}
                        />
                      </div>
                      
                      {progress.score && (
                        <div className="flex justify-between items-center">
                          <Text>测验成绩</Text>
                          <Text className={`font-medium ${
                            progress.score >= 80 ? 'text-green-600' : 
                            progress.score >= 60 ? 'text-orange-600' : 'text-red-600'
                          }`}>
                            {progress.score}分
                          </Text>
                        </div>
                      )}

                      {progress.completed && (
                        <Tag color="green" icon={<CheckCircleOutlined />} className="mt-2">
                          课程已完成
                        </Tag>
                      )}
                    </div>
                  </Card>
                );
              }
              return null;
            })()}
          </div>
        )}
      </Modal>
    </div>
  );
}; 