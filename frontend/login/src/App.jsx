import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '@shared/pages/Login';
import ForgotPassword from '@shared/pages/ForgotPassword';
import ResetPassword from '@shared/pages/ResetPassword';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
