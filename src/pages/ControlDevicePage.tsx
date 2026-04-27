import React, { useState } from 'react';
import { Cpu, Zap, AlertCircle, LayoutGrid } from 'lucide-react';
import { StatCard } from '../features/dashboard/components/StatCard';
import { DeviceList } from '../features/device/components/DeviceList';
import { cn } from '../utils';

// Khai báo danh sách khu vực để lựa chọn
const ZONES = [
  { id: 'all', name: 'Tất cả khu vực' },
  { id: 'zone-a', name: 'Khu A - Dưa lưới' },
  { id: 'zone-b', name: 'Khu B - Cà chua' },
  { id: 'zone-c', name: 'Khu C - Rau mầm' },
  { id: 'zone-d', name: 'Khu D - Dâu tây' },
];

export const ControlDevicePage: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState('all');

  return (
    <div className="p-8 flex-1 flex flex-col gap-8 bg-white overflow-y-auto">
      {/* 1. Tiêu đề trang */}
      <div>
        <h2 className="text-3xl font-bold text-brand-green uppercase">Điều khiển thiết bị</h2>
        <p className="text-gray-500 font-medium">Quản lý trạng thái vận hành của toàn bộ hệ thống thiết bị</p>
      </div>

      {/* 2. Các chỉ số cần thiết (KPI thiết bị) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={Cpu} 
          label="Tổng số thiết bị" 
          value="12" 
          unit="Cái" 
        />
        <StatCard 
          icon={Zap} 
          label="Đang hoạt động" 
          value="8" 
          unit="Bật" 
        />
        <StatCard 
          icon={AlertCircle} 
          label="Thiết bị gặp lỗi" 
          value="1" 
          unit="Lỗi" 
          // Bạn có thể thêm logic đổi màu đỏ nếu value > 0 ở StatCard
        />
      </div>

      {/* 3. Lựa chọn Khu vực (Zone Selection) */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-gray-700 font-bold">
          <LayoutGrid size={20} className="text-brand-green" />
          <h3>Chọn khu vực cần điều khiển</h3>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {ZONES.map((zone) => (
            <button
              key={zone.id}
              onClick={() => setSelectedZone(zone.id)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-sm font-bold transition-all border",
                selectedZone === zone.id
                  ? "bg-brand-green text-white border-brand-green shadow-md scale-105"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:border-brand-green hover:text-brand-green"
              )}
            >
              {zone.name}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Danh sách thiết bị */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
          <h3 className="text-lg font-bold text-gray-800">
            Danh sách thiết bị {selectedZone !== 'all' && `- ${ZONES.find(z => z.id === selectedZone)?.name}`}
          </h3>
          <span className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
            Cập nhật trạng thái thực
          </span>
        </div>
        
        <div className="min-h-75">
           {/* Sau này bạn sẽ truyền selectedZone vào DeviceList để lọc dữ liệu từ API */}
           <DeviceList /> 
        </div>
      </div>
    </div>
  );
};