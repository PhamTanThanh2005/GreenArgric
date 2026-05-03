import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { LandingPage } from '../pages/LandingPage';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ZoneDashboardPage } from '../pages/ZoneDashboardPage';
import { GlobalDashboardPage } from '../pages/GlobalDashboardPage';
import { FunctionLayout } from '../layouts/FunctionLayout';
import { ControlDevicePage } from '../pages/ControlDevicePage';
import { ProfilePage } from '../pages/ProfilePage';
import { EnvironmentParametersPage } from '../pages/EnvironmentParametersPage';
import { DataStoragePage } from '../pages/DataStoragePage';

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>
        
        {/* Dashboard */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<GlobalDashboardPage />} />
          <Route path="/zones/:zoneId" element={<ZoneDashboardPage />} /> 
        </Route>

        <Route element={<FunctionLayout />}>
          <Route path="/control-device" element={<ControlDevicePage/>} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/environment" element={<EnvironmentParametersPage />} />
          <Route path="/storage" element={<DataStoragePage />} />
        </Route>

        
        
        {/* Bắt lỗi 404 - Redirect về home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};