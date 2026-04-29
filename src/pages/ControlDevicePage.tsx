// src/features/device/ControlDevicePage.tsx
import React, { useState, useEffect } from 'react';
import { Cpu, Zap, AlertCircle, LayoutGrid, RefreshCw } from 'lucide-react';
import { StatCard } from '../features/dashboard/components/StatCard';
import { DeviceList } from '../features/device/components/DeviceList';
import { cn } from '../utils';
import { fetchDevices } from '../features/device/api/deviceApi';
import { areaApi, type AreaData } from '../features/dashboard/api/areaApi';

export interface DeviceData {
  id: number;
  device_name: string;
  type: string;
  status: number;
  area_name: string;
  mode: 'ON' | 'OFF';
  last_updated: string;
  area_id?: number;
}

export const ControlDevicePage: React.FC = () => {
  const [zones, setZones] = useState<AreaData[]>([]);
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [selectedZone, setSelectedZone] = useState<string | number>('all');
  const [loading, setLoading] = useState(true);

  // Lấy dữ liệu API
  const loadData = async () => {
    try {
      setLoading(true);
      const [areasData, devicesData] = await Promise.all([
        areaApi.getAll(),
        fetchDevices()
      ]);
      setZones(areasData);
      setDevices(devicesData);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu Control Page:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Tính toán KPI
  const totalDevices = devices.length;
  const activeDevices = devices.filter(d => d.mode === 'ON' || d.status === 1).length;
  const errorDevices = 0;

  // Lọc thiết bị theo khu vực
  const filteredDevices = selectedZone === 'all' 
    ? devices 
    : devices.filter(d => {
        const zone = zones.find(z => z.id === selectedZone);
        return zone && d.area_name === zone.name;
    });

  const handleDeviceUpdate = (deviceId: number, newMode: 'ON' | 'OFF') => {
    setDevices(prev => prev.map(d => 
      d.id === deviceId ? { ...d, mode: newMode, status: newMode === 'ON' ? 1 : 0 } : d
    ));
  };

  return (
    <div className="p-8 flex-1 flex flex-col gap-8 bg-white overflow-y-auto">
      {/* Tiêu đề trang */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-brand-green uppercase">Điều khiển thiết bị</h2>
          <p className="text-gray-500 font-medium">Quản lý trạng thái vận hành của toàn bộ hệ thống thiết bị</p>
        </div>
        <button onClick={loadData} className="text-brand-green hover:text-green-700 bg-green-50 p-2 rounded-full">
          <RefreshCw className={cn("w-6 h-6", loading && "animate-spin")} />
        </button>
      </div>

      {/* 2. Các chỉ số cần thiết */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={Cpu} label="Tổng số thiết bị" value={totalDevices.toString()} unit="Cái" />
        <StatCard icon={Zap} label="Đang hoạt động" value={activeDevices.toString()} unit="Bật" />
        <StatCard icon={AlertCircle} label="Thiết bị gặp lỗi" value={errorDevices.toString()} unit="Lỗi" />
      </div>

      {/* Lựa chọn Khu vực */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-gray-700 font-bold">
          <LayoutGrid size={20} className="text-brand-green" />
          <h3>Chọn khu vực cần điều khiển</h3>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedZone('all')}
            className={cn(
              "px-5 py-2.5 rounded-xl text-sm font-bold transition-all border",
              selectedZone === 'all'
                ? "bg-brand-green text-white border-brand-green shadow-md scale-105"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:border-brand-green hover:text-brand-green"
            )}
          >
            Tất cả khu vực
          </button>
          
          {zones.map((zone) => (
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

      {/* Danh sách thiết bị */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
          <h3 className="text-lg font-bold text-gray-800">
            Danh sách thiết bị {selectedZone !== 'all' && `- ${zones.find(z => z.id === selectedZone)?.name}`}
          </h3>
          <span className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
            Cập nhật trạng thái thực
          </span>
        </div>
        
        <div className="min-h-75">
           {loading ? (
             <div className="flex justify-center py-10">
               <RefreshCw className="w-8 h-8 animate-spin text-brand-green" />
             </div>
           ) : filteredDevices.length === 0 ? (
             <p className="text-gray-500 text-center py-10">Không có thiết bị nào trong khu vực này.</p>
           ) : (
             <DeviceList devices={filteredDevices} onDeviceUpdate={handleDeviceUpdate} /> 
           )}
        </div>
      </div>
    </div>
  );
};