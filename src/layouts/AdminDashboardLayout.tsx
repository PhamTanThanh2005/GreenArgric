import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from "../components/Header/Header";
import { SubNav } from '../components/Navigation/SubNav';
import { Sidebar } from "../components/Sidebar/Sidebar";

export const AdminDashboardLayout: React.FC = () => {
  return (
    // Giữ nguyên thiết kế nền xanh đồng nhất với toàn hệ thống
    <div className="bg-linear-to-t from-brand-green from-70% to-second-green flex flex-col h-screen overflow-hidden">
      <Header />
      <SubNav />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        {/* Nội dung chính của Admin: Chiếm toàn bộ không gian còn lại (Không có RightSidebar) */}
        <main className="flex-1 flex flex-col bg-white overflow-y-auto rounded-tl-[60px] shadow-inner">
            <Outlet />
        </main>

      </div>
    </div>
  );
};