import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '@shared/layouts/MainLayout';
import { LayoutDashboard, Users, UserCheck, CalendarDays, ClipboardCheck } from 'lucide-react';
import useAuthStore from '@shared/store/authStore';
import Dashboard from './pages/Dashboard';

function App() {
  const { user, logout } = useAuthStore();

  const navItems = [
    { label: 'Overview', icon: <LayoutDashboard size={22} />, path: '/' },
    { label: 'Team Members', icon: <Users size={22} />, path: '/team' },
    { label: 'Leave Approvals', icon: <UserCheck size={22} />, path: '/leave-approvals' },
    { label: 'Attendance Monitor', icon: <CalendarDays size={22} />, path: '/attendance-monitoring' },
    { label: 'Performance Reviews', icon: <ClipboardCheck size={22} />, path: '/performance' },
  ];

  return (
    <MainLayout 
      navItems={navItems} 
      userRole="HR / Manager" 
      userName={user?.profile?.firstName || 'HR Manager'}
      onLogout={logout}
    >
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/team" element={<div className="p-8 font-black text-2xl">My Team Management</div>} />
        <Route path="/leave-approvals" element={<div className="p-8 font-black text-2xl">Pending Approvals</div>} />
        <Route path="/attendance-monitoring" element={<div className="p-8 font-black text-2xl">Daily Monitoring</div>} />
        <Route path="/performance" element={<div className="p-8 font-black text-2xl">Team Reviews</div>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
