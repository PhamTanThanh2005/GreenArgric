import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { LandingPage } from '../pages/LandingPage';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { DashboardPage } from '../pages/DashboardPage';

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Lớp Public (Dành cho khách) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>
        
        {/* Lớp Dashboard (Dành cho user đã đăng nhập) */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          {/* Sau này bạn sẽ thêm các trang khác vào đây */}
          {/* <Route path="/dashboard/devices" element={<DevicesPage />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};