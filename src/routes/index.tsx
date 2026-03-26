import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { LandingPage } from '../pages/LandingPage';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { DashboardPage } from '../pages/DashboardPage';
import {FunctionLayout} from '../layouts/FunctionLayout';
import { ControlDevicePage } from '../pages/ControlDevicePage';

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Lớp Public */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>
        
        {/* Lớp Dashboard (đăng nhập) */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
        <Route element={<FunctionLayout />}>
          <Route path="/control-device" element={< ControlDevicePage/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};