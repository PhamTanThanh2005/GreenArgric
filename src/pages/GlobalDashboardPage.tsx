import React from 'react';
import { Sprout, AlertTriangle, Activity, Cpu } from 'lucide-react';
import { StatCard } from '../features/dashboard/components/StatCard';
import { ZoneCard } from '../features/dashboard/components/ZoneCard';

export const GlobalDashboardPage: React.FC = () => {
  return (
    <div className="p-8 flex-1 flex flex-col gap-6 bg-gray-50 overflow-y-auto">
      {/* 1. Header */}
      <div>
        <h2 className="text-4xl font-bold text-brand-green uppercase">Tổng quan Nông trại</h2>
        <p className="text-gray-500">Giám sát trạng thái toàn bộ hệ thống GREEN ARGRIC</p>
      </div>

      {/* 2. Dãy KPI Cards (4 cột) */}
      <div className="grid grid-cols-2 gap-6">
        <StatCard icon={Sprout} label="Tổng số Khu vực" value="4" unit="Khu" />
        <StatCard icon={Cpu} label="Thiết bị đang chạy" value="12" unit="Thiết bị" />
        <StatCard icon={AlertTriangle} label="Cảnh báo hiện tại" value="2" unit="Lỗi" />
        <StatCard icon={Activity} label="Nhiệt độ TB" value="32.5" unit="°C"/>
      </div>

      <div className="">
        <div className="flex flex-col gap-6">
          <div className="">
            <h3 className="text-2xl font-bold text-white mb-4 bg-brand-green rounded-2xl p-1 text-center">Trạng thái các phân khu</h3>
          
            <div className="grid grid-cols-1 gap-4">
               <ZoneCard 
                  id="zone-a" 
                  name="Khu A - Dưa lưới" 
                  temp={35} 
                  humidity={85} 
                  status="normal"
               />
               
               {/* Các khu còn lại: KHÔNG truyền hình ảnh để test Default Image */}
               <ZoneCard id="zone-b" name="Khu B - Cà chua" temp={38} humidity={60} status="warning" />
               <ZoneCard id="zone-c" name="Khu C - Rau mầm" temp={28} humidity={90} status="normal" />
               <ZoneCard id="zone-d" name="Khu D - Dâu tây" temp={22} humidity={75} status="error" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white bg-brand-green rounded-2xl p-1 text-center">Biểu đồ mô tả</h3>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">So sánh Nhiệt độ (24h qua)</h3>
            <div className="h-64 w-full bg-gray-50 rounded flex items-center justify-center text-gray-400">
              {/* <GlobalTrendChart /> */}
              [Khu vực hiển thị Recharts LineChart]
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};