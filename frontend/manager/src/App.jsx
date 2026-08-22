import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '@shared/layouts/MainLayout';
import ErrorBoundary from '@shared/components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';
import {
  LayoutDashboard,
  CheckSquare,
  Layers,
  Calendar,
  Users,
  MessageSquare
} from 'lucide-react';

const ManagerDashboard = lazy(() => import('./pages/ManagerDashboard'));
const ManagerTasks = lazy(() => import('./pages/ManagerTasks'));
const ManagerProjects = lazy(() => import('./pages/ManagerProjects'));
const LeaveManagement = lazy(() => import('./pages/LeaveManagement'));
const Profile = lazy(() => import('@shared/pages/Profile'));
const Chat = lazy(() => import('@shared/pages/Chat'));

const RouteLoadingFallback = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
    <div style={{
      width: 32, height: 32, borderRadius: '50%',
      border: '3px solid rgba(0,167,107,0.2)', borderTopColor: '#00a76b',
      animation: 'spin 0.7s linear infinite'
    }} />
    <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
  </div>
);

function App() {
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const token = sessionStorage.getItem('token');

  React.useEffect(() => {
    if (!token) {
      window.location.href = '/';
    }
  }, [token]);

  if (!token) return null;

  const handleLogout = () => {
    sessionStorage.clear();
    window.location.href = '/';
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'Tasks', icon: CheckSquare, path: '/tasks' },
    { label: 'Projects', icon: Layers, path: '/projects' },
    { label: 'Leave Approvals', icon: Calendar, path: '/leaves' },
    { label: 'Team Chat', icon: MessageSquare, path: '/chat' },
  ];

  return (
    <ErrorBoundary>
      <Toaster position="top-right" />
      <MainLayout
        navItems={navItems}
        userRole="manager"
        userName={user?.name || user?.email || 'Manager'}
        onLogout={handleLogout}
      >
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            <Route path="/" element={<ManagerDashboard />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/tasks" element={<ManagerTasks />} />
            <Route path="/projects" element={<ManagerProjects />} />
            <Route path="/leaves" element={<LeaveManagement />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </MainLayout>
    </ErrorBoundary>
  );
}

export default App;
