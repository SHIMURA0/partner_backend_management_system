import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Input,
  Select,
  Space,
  Typography,
  Progress,
  Tooltip,
  Modal,
  Descriptions,
  DatePicker,
  Row,
  Col,
  Statistic,
  message
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  EyeOutlined,
  ReloadOutlined,
  CalendarOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import type { Sample, PaginatedResponse } from '../types';
import { mockApi } from '../services/mockData';
import { SAMPLE_STATUS_MAP, GENDER_MAP, PAGINATION_CONFIG } from '../constants';
import dayjs, { type Dayjs } from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export const SampleManagement = () => {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
    total: 0,
  });

  const fetchSamples = async (page = 1, pageSize = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE) => {
    setLoading(true);
    try {
      const response = await mockApi.getSamples(page, pageSize);
      setSamples(response.data.data);
      setPagination({
        current: page,
        pageSize,
        total: response.data.total,
      });
    } catch (error) {
      message.error('获取样本数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSamples();
  }, []);

  const handleTableChange = (newPagination: any) => {
    fetchSamples(newPagination.current, newPagination.pageSize);
  };

  const handleViewDetail = (sample: Sample) => {
    setSelectedSample(sample);
    setModalVisible(true);
  };

  const handleDownloadReport = (sample: Sample) => {
    if (sample.reportUrl) {
      // 模拟下载
      message.success(`正在下载 ${sample.sampleCode} 的检测报告...`);
    } else {
      message.warning('报告还未生成，请稍后再试');
    }
  };

  const filteredSamples = samples.filter(sample => {
    const matchesSearch = !searchText || 
      sample.sampleCode.toLowerCase().includes(searchText.toLowerCase()) ||
      sample.patientName.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = !statusFilter || sample.status === statusFilter;
    
    const matchesDateRange = !dateRange || (
      dayjs(sample.collectionDate).isAfter(dateRange[0]) &&
      dayjs(sample.collectionDate).isBefore(dateRange[1])
    );

    return matchesSearch && matchesStatus && matchesDateRange;
  });

  const columns = [
    {
      title: '样本编号',
      dataIndex: 'sampleCode',
      key: 'sampleCode',
      width: 120,
      render: (text: string) => (
        <Text className="font-mono font-medium text-blue-600">{text}</Text>
      ),
    },
    {
      title: '患者信息',
      key: 'patient',
      width: 150,
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
      title: '采集日期',
      dataIndex: 'collectionDate',
      key: 'collectionDate',
      width: 110,
      render: (date: Date) => dayjs(date).format('MM-DD'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
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
      title: '检测进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 120,
      render: (progress: number, record: Sample) => (
        <Tooltip title={`${progress}% 完成`}>
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
        </Tooltip>
      ),
    },
    {
      title: '预计完成',
      dataIndex: 'estimatedCompletionDate',
      key: 'estimatedCompletionDate',
      width: 110,
      render: (date?: Date) => date ? dayjs(date).format('MM-DD') : '-',
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: Sample) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
              className="!text-blue-600 hover:!text-blue-700"
            />
          </Tooltip>
          {record.reportUrl && (
            <Tooltip title="下载报告">
              <Button
                type="text"
                size="small"
                icon={<DownloadOutlined />}
                onClick={() => handleDownloadReport(record)}
                className="!text-green-600 hover:!text-green-700"
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const statusOptions = Object.entries(SAMPLE_STATUS_MAP).map(([key, value]) => ({
    label: value.text,
    value: key,
  }));

  // 统计数据
  const stats = {
    total: filteredSamples.length,
    completed: filteredSamples.filter(s => s.status === 'completed').length,
    processing: filteredSamples.filter(s => s.status === 'processing').length,
    pending: filteredSamples.filter(s => s.status === 'pending').length,
  };

  return (
    <div className="w-full h-full p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <Title level={3} className="!mb-2">样本管理</Title>
          <Text className="text-gray-600">管理和跟踪所有样本的检测进度</Text>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => fetchSamples(pagination.current, pagination.pageSize)}
          loading={loading}
        >
          刷新
        </Button>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={6}>
          <Card className="!border-0 shadow-sm text-center">
            <Statistic
              title="总样本"
              value={stats.total}
              prefix={<ExperimentOutlined className="text-blue-500" />}
              valueStyle={{ color: '#1890ff', fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="!border-0 shadow-sm text-center">
            <Statistic
              title="已完成"
              value={stats.completed}
              valueStyle={{ color: '#52c41a', fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="!border-0 shadow-sm text-center">
            <Statistic
              title="检测中"
              value={stats.processing}
              valueStyle={{ color: '#1890ff', fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="!border-0 shadow-sm text-center">
            <Statistic
              title="待处理"
              value={stats.pending}
              valueStyle={{ color: '#faad14', fontSize: '20px' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索和筛选 */}
      <Card className="!border-0 shadow-lg">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8}>
            <Input
              placeholder="搜索样本编号或患者姓名"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={6}>
            <Select
              placeholder="选择状态"
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
              className="w-full"
              options={statusOptions}
            />
          </Col>
          <Col xs={24} sm={8}>
            <RangePicker
              placeholder={['开始日期', '结束日期']}
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)}
              className="w-full"
            />
          </Col>
          <Col xs={24} sm={2}>
            <Button
              icon={<FilterOutlined />}
              onClick={() => {
                setSearchText('');
                setStatusFilter('');
                setDateRange(null);
              }}
            >
              重置
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 样本表格 */}
      <Card className="!border-0 shadow-lg">
        <Table
          columns={columns}
          dataSource={filteredSamples}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            pageSizeOptions: [...PAGINATION_CONFIG.PAGE_SIZE_OPTIONS],
          }}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
          className="!border-0"
        />
      </Card>

      {/* 详情模态框 */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <ExperimentOutlined className="text-blue-500" />
            <span>样本详情</span>
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            关闭
          </Button>,
          selectedSample?.reportUrl && (
            <Button
              key="download"
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadReport(selectedSample)}
              className="bg-gradient-to-r from-green-500 to-green-600 border-0"
            >
              下载报告
            </Button>
          ),
        ]}
      >
        {selectedSample && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="样本编号" span={2}>
              <Text className="font-mono font-medium">{selectedSample.sampleCode}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="患者姓名">
              {selectedSample.patientName}
            </Descriptions.Item>
            <Descriptions.Item label="年龄性别">
              {selectedSample.patientAge}岁 / {GENDER_MAP[selectedSample.patientGender]}
            </Descriptions.Item>
            <Descriptions.Item label="采集日期">
              {dayjs(selectedSample.collectionDate).format('YYYY-MM-DD')}
            </Descriptions.Item>
            <Descriptions.Item label="接收日期">
              {dayjs(selectedSample.receivedDate).format('YYYY-MM-DD')}
            </Descriptions.Item>
            <Descriptions.Item label="当前状态">
              <Tag color={SAMPLE_STATUS_MAP[selectedSample.status].color}>
                {SAMPLE_STATUS_MAP[selectedSample.status].text}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="检测进度">
              <Progress percent={selectedSample.progress} size="small" />
            </Descriptions.Item>
            {selectedSample.estimatedCompletionDate && (
              <Descriptions.Item label="预计完成日期" span={2}>
                <Space>
                  <CalendarOutlined />
                  {dayjs(selectedSample.estimatedCompletionDate).format('YYYY-MM-DD')}
                </Space>
              </Descriptions.Item>
            )}
            {selectedSample.notes && (
              <Descriptions.Item label="备注" span={2}>
                {selectedSample.notes}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="创建时间">
              {dayjs(selectedSample.createdAt).format('YYYY-MM-DD HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {dayjs(selectedSample.updatedAt).format('YYYY-MM-DD HH:mm')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}; 