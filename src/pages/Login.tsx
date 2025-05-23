import { useState } from 'react';
import { Button, Form, Input, Card, Typography, message, Spin } from 'antd';
import { UserOutlined, LockOutlined, ExperimentOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { mockApi } from '../services/mockData';
import { ROUTES, STORAGE_KEYS } from '../constants';

const { Title, Text } = Typography;

interface LoginForm {
  username: string;
  password: string;
}

export const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    try {
      const response = await mockApi.login(values.username, values.password);
      
      // 保存用户信息和token
      localStorage.setItem(STORAGE_KEYS.USER_TOKEN, response.data.token);
      localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(response.data.user));
      
      message.success('登录成功！');
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400 to-red-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative w-full max-w-md">
        <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/90">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
              <ExperimentOutlined className="text-2xl text-white" />
            </div>
            <Title level={2} className="!mb-2 !text-gray-800">
              谷禾健康
            </Title>
            <Text className="text-gray-600 text-base">
              合作方后台管理系统
            </Text>
          </div>

          <Form
            name="login"
            onFinish={onFinish}
            size="large"
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="用户名"
                className="!py-3 !px-4 rounded-lg border-gray-200 hover:border-blue-400 focus:border-blue-500"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="密码"
                className="!py-3 !px-4 rounded-lg border-gray-200 hover:border-blue-400 focus:border-blue-500"
              />
            </Form.Item>

            <Form.Item className="!mb-4">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full !h-12 !text-base !font-medium bg-gradient-to-r from-blue-500 to-purple-600 border-0 rounded-lg hover:from-blue-600 hover:to-purple-700 shadow-lg"
              >
                {loading ? <Spin size="small" /> : '登录'}
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center pt-4 border-t border-gray-100">
            <Text className="text-gray-500 text-sm">
              演示账号：partner001 / 123456
            </Text>
          </div>
        </Card>

        {/* 底部说明 */}
        <div className="text-center mt-8">
          <Text className="text-gray-600 text-sm">
            © 2024 谷禾健康科技. 专业的肠道菌群检测服务
          </Text>
        </div>
      </div>
    </div>
  );
}; 