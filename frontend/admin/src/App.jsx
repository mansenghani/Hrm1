import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from '@shared/pages/Landing';
import RoleSelection from '@shared/pages/RoleSelection';
import Login from '@shared/pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import HRDashboard from './pages/hr/HRDashboard';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import Employees from './pages/admin/Employees';
import EmployeeForm from './pages/admin/EmployeeForm';
import EmployeeDetail from './pages/admin/EmployeeDetail';
import Tasks from './pages/admin/Tasks';
import Departments from './pages/Departments';
import Attendance from './pages/hr/Attendance';
import HRTasks from './pages/hr/HRTasks';
import LeaveManagement from './pages/hr/LeaveManagement';
import EmployeeLeave from './pages/employee/LeaveManagement';
import TimeTracker from './pages/employee/TimeTracker';
import SmartTimeTracker from './pages/SmartTimeTracker';
import Payroll from './pages/Payroll';
import ManagerTasks from './pages/manager/ManagerTasks';
import Performance from './pages/Performance';
import Reports from './pages/Reports';
import Settings from './pages/admin/Settings';
import CreateUser from './pages/admin/CreateUser';
import MainLayout from '@shared/layouts/MainLayout';
import Profile from '@shared/pages/Profile';

// ROUTE PROTECTION LOGIC
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('role');

  if (!token) return <Navigate to="/select-role" replace />;

  // ADMIN OVERRIDE
  if (role === 'admin') return children;

  // ROLE SPECIFIC CHECK
  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<Landing />} />
      <Route path="/select-role" element={<RoleSelection />} />
      <Route path="/login/:role" element={<Login />} />

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
        <Route path="departments" element={<Departments />} />
        <Route path="leave" element={<LeaveManagement />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="time-tracker" element={<SmartTimeTracker />} />
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
        <Route path="profile" element={<Profile />} />
        <Route path="time-tracker" element={<SmartTimeTracker />} />
      </Route>

      {/* EMPLOYEE MODULE */}
      <Route path="/employee" element={
        <ProtectedRoute allowedRole="employee">
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<EmployeeDashboard />} />
        <Route path="dashboard" element={<EmployeeDashboard />} />
        <Route path="time-tracker" element={<SmartTimeTracker />} />
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
        <Route path="attendance" element={<Attendance />} />
        <Route path="leave" element={<LeaveManagement />} />
        <Route path="profile" element={<Profile />} />
        <Route path="time-tracker" element={<SmartTimeTracker />} />
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
