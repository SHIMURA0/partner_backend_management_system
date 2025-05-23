import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { MainLayout } from './layouts/MainLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AIChat } from './pages/AIChat';
import { SampleManagement } from './pages/SampleManagement';
import { Training } from './pages/Training';
import { ROUTES } from './constants';
import './App.css';

// 私有路由组件
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('user_token');
  return token ? <>{children}</> : <Navigate to={ROUTES.LOGIN} replace />;
};

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Routes>
          {/* 登录页面 */}
          <Route path={ROUTES.LOGIN} element={<Login />} />
          
          {/* 主应用程序路由 */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            {/* 默认重定向到仪表板 */}
            <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            
            {/* 各功能页面 */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="ai-chat" element={<AIChat />} />
            <Route path="sample-management" element={<SampleManagement />} />
            <Route path="training" element={<Training />} />
          </Route>

          {/* 404页面 */}
          <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
