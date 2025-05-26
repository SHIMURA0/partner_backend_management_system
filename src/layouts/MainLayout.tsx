import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ExperimentOutlined, MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined } from '@ant-design/icons';
import { Menu, Avatar, Dropdown, Typography, Button } from 'antd';
import type { MenuItem, User } from '../types';
import { ROUTES, STORAGE_KEYS } from '../constants';

const { Text } = Typography;

export const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userInfo = localStorage.getItem(STORAGE_KEYS.USER_INFO);
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    } else {
      navigate(ROUTES.LOGIN);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    navigate(ROUTES.LOGIN);
  };

  const menuItems: MenuItem[] = [
    {
      key: ROUTES.DASHBOARD,
      icon: <ExperimentOutlined />,
      label: '工作台',
      path: ROUTES.DASHBOARD,
    },
    {
      key: ROUTES.AI_CHAT,
      icon: <ExperimentOutlined />,
      label: '谷禾菌识',
      path: ROUTES.AI_CHAT,
    },
    {
      key: ROUTES.SAMPLE_MANAGEMENT,
      icon: <ExperimentOutlined />,
      label: '样本管理',
      path: ROUTES.SAMPLE_MANAGEMENT,
    },
    {
      key: ROUTES.TRAINING,
      icon: <ExperimentOutlined />,
      label: '解读培训',
      path: ROUTES.TRAINING,
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
    },
    {
      key: 'logout',
      icon: <UserOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  if (!user) return null;

  return (
    <div className="h-screen w-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className={`transition-all duration-300 h-full bg-gray-100 flex flex-col flex-shrink-0 ${collapsed ? 'w-16' : 'w-[250px]'}`}>
        {/* Collapse/Expand Button */}
        <div className="p-3 flex">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="!w-8 !h-8 flex items-center justify-center hover:!bg-neutral-100"
          />
        </div>
        {/* Brand */}
        <div className="px-4 pb-3">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white font-semibold text-base">
              谷
            </div>
            {!collapsed && (
              <div className="ml-3">
                <span className="text-2xl font-semibold text-primary-500">谷禾健康</span>
              </div>
            )}
          </div>
        </div>
        {/* Menu */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin">
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            className="!border-0 !bg-transparent"
            style={{ fontSize: '14px', background: 'transparent' }}
            inlineCollapsed={collapsed}
          />
        </nav>
        {/* User Info */}
        <div className="mt-auto px-4 py-3">
          <Dropdown menu={{ items: userMenuItems }} placement="topLeft" trigger={['click']}>
            <div className="flex items-center cursor-pointer hover:bg-neutral-100 rounded-lg p-2">
              <Avatar size={32} src={user.avatar} icon={<UserOutlined />} />
              {!collapsed && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-neutral-700">{user.companyName}</p>
                  <p className="text-xs text-neutral-500">{user.username}</p>
                </div>
              )}
            </div>
          </Dropdown>
        </div>
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <main className="flex-1 flex flex-col justify-center p-4 overflow-auto">
          <div className="bg-white rounded-lg mx-auto w-full h-full flex flex-col relative">
            <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-auto">
              <Outlet />
            </div>
            {/* Footer */}
            <footer className="mb-4 flex flex-row items-center justify-center space-x-4 text-xs text-neutral-400">
              <a href="#" className="hover:text-primary-500">用户协议</a>
              <div className="h-3 w-px bg-neutral-300"></div>
              <a href="#" className="hover:text-primary-500">隐私政策</a>
              <div className="h-3 w-px bg-neutral-300"></div>
              <div>备案号：Beijing-ZhiHaiTuAI-20231016</div>
              <div className="h-3 w-px bg-neutral-300"></div>
              <a href="#" className="hover:text-primary-500">© 2025 谷禾健康</a>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}; 