import React from 'react';
import AttendanceDashboard from '@shared/components/AttendanceDashboard';

const Attendance = () => {
  const role = sessionStorage.getItem('role') || 'hr';
  return <AttendanceDashboard userRole={role} />;
};

export default Attendance;
