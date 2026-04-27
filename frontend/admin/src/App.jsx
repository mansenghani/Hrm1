import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Landing from '@shared/pages/Landing';
import Login from '@shared/pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import HRDashboard from './pages/hr/HRDashboard';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import Employees from './pages/admin/Employees';
import EmployeeForm from './pages/admin/EmployeeForm';
import EmployeeDetail from './pages/admin/EmployeeDetail';
import Tasks from './pages/admin/Tasks';

import Attendance from './pages/hr/Attendance';
import HRTasks from './pages/hr/HRTasks';
import LeaveManagement from './pages/hr/LeaveManagement';
import TeamManagement from './pages/hr/TeamManagement';
import HREmployees from './pages/hr/HREmployees';
import EmployeeLeave from './pages/employee/LeaveManagement';
import TimeTrackingDashboard from './pages/TimeTrackingDashboard';
import Payroll from './pages/Payroll';
import ManagerTasks from './pages/manager/ManagerTasks';
import Performance from './pages/Performance';
import Reports from './pages/Reports';
import Settings from './pages/admin/Settings';
import CreateUser from './pages/admin/CreateUser';
import MainLayout from '@shared/layouts/MainLayout';
import Profile from '@shared/pages/Profile';
import ProjectManagement from './pages/hr/ProjectManagement';
import ManagerProjects from './pages/manager/ManagerProjects';
import EmployeeProjects from './pages/employee/EmployeeProjects';

// ROUTE PROTECTION LOGIC
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('role');

  if (!token) return <Navigate to="/login" replace />;

  // ROLE SPECIFIC CHECK (ADMIN OVERRIDE)
  if (role === 'admin') return children;

  if (allowedRole && role !== allowedRole) {
    return <Navigate to={`/${role}/dashboard`} replace />;
  }

  return children;
};

const App = () => {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/* REDIRECTS FOR OLD PATHS */}
        <Route path="/select-role" element={<Navigate to="/login" replace />} />
        <Route path="/login/:role" element={<Navigate to="/login" replace />} />

        {/* ADMIN MODULE */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRole="admin">
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="employees/add" element={<EmployeeForm />} />
          <Route path="employees/edit/:id" element={<EmployeeForm />} />
          <Route path="employees/view/:id" element={<EmployeeDetail />} />
          <Route path="tasks" element={<Tasks />} />

          <Route path="leave" element={<LeaveManagement />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="time-tracker" element={<TimeTrackingDashboard />} />
          <Route path="payroll" element={<Payroll />} />
          <Route path="performance" element={<Performance />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="create-user" element={<CreateUser />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* HR MODULE */}
        <Route path="/hr" element={
          <ProtectedRoute allowedRole="hr">
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<HRDashboard />} />
          <Route path="dashboard" element={<HRDashboard />} />
          <Route path="tasks" element={<HRTasks />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="leave" element={<LeaveManagement />} />
          <Route path="employees" element={<HREmployees />} />
          <Route path="employees/view/:id" element={<EmployeeDetail />} />
          <Route path="employees/edit/:id" element={<EmployeeForm />} />
          <Route path="create-user" element={<CreateUser />} />
          <Route path="teams" element={<TeamManagement />} />
          <Route path="projects" element={<ProjectManagement />} />
          <Route path="time-tracker" element={<TimeTrackingDashboard />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* EMPLOYEE MODULE */}
        <Route path="/employee" element={
          <ProtectedRoute allowedRole="employee">
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<EmployeeDashboard />} />
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="projects" element={<EmployeeProjects />} />
          <Route path="time-tracker" element={<TimeTrackingDashboard />} />
          <Route path="leave" element={<EmployeeLeave />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* MANAGER MODULE */}
        <Route path="/manager" element={
          <ProtectedRoute allowedRole="manager">
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<ManagerDashboard />} />
          <Route path="dashboard" element={<ManagerDashboard />} />
          <Route path="tasks" element={<ManagerTasks />} />
          <Route path="projects" element={<ManagerProjects />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="leave" element={<LeaveManagement />} />
          <Route path="profile" element={<Profile />} />
          <Route path="time-tracker" element={<TimeTrackingDashboard />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
