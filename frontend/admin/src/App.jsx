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
import EmployeePayslips from './pages/employee/EmployeePayslips';
import EmployeeDocuments from './pages/employee/EmployeeDocuments';
import EmployeePerformance from './pages/employee/EmployeePerformance';
import TimeTrackingDashboard from './pages/TimeTrackingDashboard';
import Payroll from './pages/Payroll';
import ManagerTasks from './pages/manager/ManagerTasks';
import Performance from './pages/Performance';
import Reports from './pages/Reports';
import Recruitment from './pages/Recruitment';
import Settings from './pages/admin/Settings';
import CreateUser from './pages/admin/CreateUser';
import MainLayout from '@shared/layouts/MainLayout';
import Profile from '@shared/pages/Profile';
import ProjectManagement from './pages/hr/ProjectManagement';
import ManagerProjects from './pages/manager/ManagerProjects';
import EmployeeProjects from './pages/employee/EmployeeProjects';
import Screenshots from './pages/Screenshots';
import Chat from '@shared/pages/Chat';
import TaskManagement from './pages/TaskManagement';
import TaskCreate from './pages/TaskCreate';
import TaskUpdate from './pages/TaskUpdate';

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
          <Route path="task-management" element={<TaskManagement />} />
          <Route path="task-management/create" element={<TaskCreate />} />
          <Route path="task-management/update/:id" element={<TaskUpdate />} />

          <Route path="leave" element={<LeaveManagement />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="time-tracker" element={<TimeTrackingDashboard />} />
          <Route path="payroll" element={<Payroll />} />
          <Route path="performance" element={<Performance />} />
          <Route path="reports" element={<Reports />} />
          <Route path="recruitment" element={<Recruitment />} />
          <Route path="settings" element={<Settings />} />
          <Route path="create-user" element={<CreateUser />} />
          <Route path="chat" element={<Chat />} />
          <Route path="screenshots" element={<Screenshots />} />
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
          <Route path="task-management" element={<TaskManagement />} />
          <Route path="task-management/create" element={<TaskCreate />} />
          <Route path="task-management/update/:id" element={<TaskUpdate />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="leave" element={<LeaveManagement />} />
          <Route path="employees" element={<HREmployees />} />
          <Route path="employees/view/:id" element={<EmployeeDetail />} />
          <Route path="employees/edit/:id" element={<EmployeeForm />} />
          <Route path="create-user" element={<CreateUser />} />
          <Route path="teams" element={<TeamManagement />} />
          <Route path="recruitment" element={<Recruitment />} />
          <Route path="performance" element={<Performance />} />
          <Route path="reports" element={<Reports />} />
          <Route path="projects" element={<ProjectManagement />} />
          <Route path="time-tracker" element={<TimeTrackingDashboard />} />
          <Route path="chat" element={<Chat />} />
          <Route path="screenshots" element={<Screenshots />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* EMPLOYEE MODULE */}
        <Route path="/employee" element={
          <ProtectedRoute allowedRole="employee">
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="task-management" element={<TaskManagement />} />
          <Route path="task-management/create" element={<TaskCreate />} />
          <Route path="task-management/update/:id" element={<TaskUpdate />} />
          <Route path="projects" element={<EmployeeProjects />} />
          <Route path="time-tracker" element={<TimeTrackingDashboard />} />
          <Route path="leave" element={<EmployeeLeave />} />
          <Route path="payslips" element={<EmployeePayslips />} />
          <Route path="documents" element={<EmployeeDocuments />} />
          <Route path="performance" element={<EmployeePerformance />} />
          <Route path="recruitment" element={<Recruitment />} />
          <Route path="reports" element={<Reports />} />
          <Route path="chat" element={<Chat />} />
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
          <Route path="task-management" element={<TaskManagement />} />
          <Route path="task-management/create" element={<TaskCreate />} />
          <Route path="task-management/update/:id" element={<TaskUpdate />} />
          <Route path="projects" element={<ManagerProjects />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="leave" element={<LeaveManagement />} />
          <Route path="chat" element={<Chat />} />
          <Route path="screenshots" element={<Screenshots />} />
          <Route path="recruitment" element={<Recruitment />} />
          <Route path="performance" element={<Performance />} />
          <Route path="reports" element={<Reports />} />
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
