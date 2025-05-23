import { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Tag, 
  Typography, 
  Button, 
  Progress,
  Space,
  Avatar
} from 'antd';
import {
  ExperimentOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  DownloadOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { DashboardStats, Sample } from '../types';
import { mockApi } from '../services/mockData';
import { SAMPLE_STATUS_MAP, GENDER_MAP } from '../constants';

const { Title, Text } = Typography;

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await mockApi.getDashboardStats();
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const recentSamplesColumns = [
    {
      title: '样本编号',
      dataIndex: 'sampleCode',
      key: 'sampleCode',
      render: (text: string) => (
        <Text className="font-mono font-medium">{text}</Text>
      ),
    },
    {
      title: '患者信息',
      key: 'patient',
      render: (_: any, record: Sample) => (
        <div>
          <div className="font-medium">{record.patientName}</div>
          <Text className="text-sm text-gray-500">
            {GENDER_MAP[record.patientGender]} · {record.patientAge}岁
          </Text>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: keyof typeof SAMPLE_STATUS_MAP) => {
        const statusConfig = SAMPLE_STATUS_MAP[status];
        return (
          <Tag color={statusConfig.color} className="font-medium">
            {statusConfig.text}
          </Tag>
        );
      },
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number, record: Sample) => (
        <div className="w-24">
          <Progress 
            percent={progress} 
            size="small" 
            status={record.status === 'failed' ? 'exception' : 'normal'}
            strokeColor={
              record.status === 'completed' ? '#52c41a' :
              record.status === 'processing' ? '#1890ff' :
              record.status === 'failed' ? '#ff4d4f' : '#faad14'
            }
          />
        </div>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: Sample) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            className="!text-blue-600 hover:!text-blue-700"
          >
            查看
          </Button>
          {record.reportUrl && (
            <Button
              type="text"
              size="small"
              icon={<DownloadOutlined />}
              className="!text-green-600 hover:!text-green-700"
            >
              下载
            </Button>
          )}
        </Space>
      ),
    },
  ];

  if (!stats) return null;

  return (
    <div className="w-full h-full p-6 space-y-6">
      {/* 欢迎区域 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <Title level={2} className="!text-white !mb-2">
              欢迎回来！
            </Title>
            <Text className="text-blue-100 text-base">
              今天是个美好的一天，让我们查看您的样本检测进展
            </Text>
          </div>
          <div className="hidden md:block">
            <Avatar 
              size={64} 
              icon={<ExperimentOutlined />} 
              className="bg-white/20 border-2 border-white/30"
            />
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="!border-0 hover:shadow-xl transition-shadow">
            <Statistic
              title={
                <Text className="text-gray-600 font-medium">总样本数</Text>
              }
              value={stats.totalSamples}
              prefix={<ExperimentOutlined className="text-blue-500" />}
              valueStyle={{ color: '#1890ff', fontSize: '28px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="!border-0 shadow-lg hover:shadow-xl transition-shadow">
            <Statistic
              title={
                <Text className="text-gray-600 font-medium">已完成</Text>
              }
              value={stats.completedSamples}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              valueStyle={{ color: '#52c41a', fontSize: '28px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="!border-0 shadow-lg hover:shadow-xl transition-shadow">
            <Statistic
              title={
                <Text className="text-gray-600 font-medium">待处理</Text>
              }
              value={stats.pendingSamples}
              prefix={<ClockCircleOutlined className="text-orange-500" />}
              valueStyle={{ color: '#faad14', fontSize: '28px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="!border-0 shadow-lg hover:shadow-xl transition-shadow">
            <Statistic
              title={
                <Text className="text-gray-600 font-medium">月增长率</Text>
              }
              value={stats.monthlyGrowth}
              precision={1}
              suffix="%"
              prefix={<RiseOutlined className="text-purple-500" />}
              valueStyle={{ color: '#722ed1', fontSize: '28px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* 样本状态分布 */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <Text className="text-lg font-semibold">样本状态分布</Text>
            }
            className="!border-0 shadow-lg h-full"
          >
            <div className="space-y-4">
              {stats.statusDistribution.map((item) => {
                const statusConfig = SAMPLE_STATUS_MAP[item.status];
                const percentage = ((item.count / stats.totalSamples) * 100).toFixed(1);
                
                return (
                  <div key={item.status} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Tag color={statusConfig.color} className="font-medium">
                        {statusConfig.text}
                      </Tag>
                      <Text className="font-medium">{item.count}个 ({percentage}%)</Text>
                    </div>
                    <Progress 
                      percent={Number(percentage)} 
                      strokeColor={
                        statusConfig.color === 'green' ? '#52c41a' :
                        statusConfig.color === 'blue' ? '#1890ff' :
                        statusConfig.color === 'orange' ? '#faad14' :
                        statusConfig.color === 'red' ? '#ff4d4f' : '#d9d9d9'
                      }
                      showInfo={false}
                    />
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>

        {/* 月度样本趋势 */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <Text className="text-lg font-semibold">月度样本趋势</Text>
            }
            className="!border-0 shadow-lg h-full"
          >
            <div className="space-y-4">
              {stats.monthlyStats.map((item, index) => {
                const isLatest = index === stats.monthlyStats.length - 1;
                return (
                  <div key={item.month} className="flex justify-between items-center">
                    <Text className={`${isLatest ? 'font-semibold text-blue-600' : 'text-gray-600'}`}>
                      {item.month}
                    </Text>
                    <div className="flex items-center space-x-2">
                      <div 
                        className={`h-2 rounded-full ${isLatest ? 'bg-blue-500' : 'bg-gray-300'}`}
                        style={{ 
                          width: `${(item.samples / Math.max(...stats.monthlyStats.map(s => s.samples))) * 100}px` 
                        }}
                      />
                      <Text className={`font-medium min-w-[3rem] text-right ${isLatest ? 'text-blue-600' : ''}`}>
                        {item.samples}
                      </Text>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>

        {/* 快速统计 */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <Text className="text-lg font-semibold">快速统计</Text>
            }
            className="!border-0 shadow-lg h-full"
          >
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {stats.averageProcessingTime}天
                </div>
                <Text className="text-gray-600">平均检测时间</Text>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {((stats.completedSamples / stats.totalSamples) * 100).toFixed(1)}%
                </div>
                <Text className="text-gray-600">完成率</Text>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {stats.monthlyGrowth > 0 ? '+' : ''}{stats.monthlyGrowth}%
                </div>
                <Text className="text-gray-600">本月增长</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 最近样本 */}
      <Card 
        title={
          <div className="flex justify-between items-center">
            <Text className="text-lg font-semibold">最近样本</Text>
            <Button type="link" className="!p-0">
              查看全部 →
            </Button>
          </div>
        }
        className="!border-0 shadow-lg"
      >
        <Table
          columns={recentSamplesColumns}
          dataSource={stats.recentSamples}
          rowKey="id"
          pagination={false}
          loading={loading}
          className="!border-0"
        />
      </Card>
    </div>
  );
}; 