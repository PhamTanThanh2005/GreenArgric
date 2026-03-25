import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from "../components/Header/Header";
import { SubNav } from '../components/Navigation/SubNav';
import { Sidebar } from "../components/Sidebar/Sidebar";
import { RightSidebar } from "../components/RightSidebar/RightSidebar";

export const DashboardLayout: React.FC = () => {
  return (
    <div className=" bg-linear-to-t from-brand-green from-70% to-second-green flex flex-col">
      <Header />
      <SubNav />

      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 flex flex-col bg-white overflow-y-auto rounded-tl-[60px]">
            <Outlet />
        </main>

        <RightSidebar />
      </div>
    </div>
  );
};