// src/features/device/components/DeviceList.tsx
import React, { useState } from 'react';
import { DeviceCard } from './DeviceCard';
import denled from '../../../assets/device/denled.png';
import maybom from '../../../assets/device/maybom.png';
import { overrideDevice } from '../api/deviceApi';
import { type DeviceData } from '../../../pages/ControlDevicePage';

interface DeviceListProps {
  devices: DeviceData[];
  onDeviceUpdate: (deviceId: number, newMode: 'ON' | 'OFF') => void;
}

export const DeviceList: React.FC<DeviceListProps> = ({ devices, onDeviceUpdate }) => {
  const [activeCardId, setActiveCardId] = useState<number | null>(null);
  const [loadingIds, setLoadingIds] = useState<number[]>([]);

  const handleToggle = async (deviceId: number, currentMode: 'ON' | 'OFF') => {
    setActiveCardId(deviceId);
    setLoadingIds(prev => [...prev, deviceId]);

    const newMode = currentMode === 'ON' ? 'OFF' : 'ON';

    // Tạo thời gian expire mặc định
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const expireTime = now.toISOString().substring(0, 19);

    try {
      await overrideDevice(deviceId, newMode, expireTime);
      onDeviceUpdate(deviceId, newMode);
    } catch (error) {
      console.error("Chi tiết lỗi:", error);
      alert("Lỗi! Không thể điều khiển thiết bị. Hãy kiểm tra kết nối MQTT.");
    } finally {
      setLoadingIds(prev => prev.filter(id => id !== deviceId));
    }
  };

  const getDeviceUI = (type: string) => {
    switch(type) {
      case 'pump': 
        return { image: maybom };
      case 'light': 
        return { image: denled };
      default: 
        return { image: denled };
    }
  };

  return (
    <div className="flex flex-wrap gap-6 py-4 bg-white">
      
      {/* Duyệt mảng và render Card */}
      {devices.map(device => {
        const ui = getDeviceUI(device.type);
        const isLoading = loadingIds.includes(device.id);

        return (
          <DeviceCard
            key={device.id}
            title={device.device_name}
            image={ui.image}
            status={device.mode}
            isActive={activeCardId === device.id}
            isLoading={isLoading}
            onToggleClick={() => handleToggle(device.id, device.mode)}
            onDetailClick={() => console.log(`Chi tiết: ${device.device_name}`)}
          />
        );
      })}
      
      <div className="w-85 h-75 rounded-4xl bg-[#eef7ef] border-2 border-dashed border-brand-green/50 flex items-center justify-center cursor-pointer hover:bg-[#e4f3e5] transition-colors">
        <span className="text-brand-green font-bold">+ Thêm thiết bị</span>
      </div>

    </div>
  );
};