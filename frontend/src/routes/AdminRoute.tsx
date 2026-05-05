// src/routes/AdminRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const AdminRoute: React.FC = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};