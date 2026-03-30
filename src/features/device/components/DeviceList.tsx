import React, { useEffect, useState } from 'react';
import { DeviceCard } from './DeviceCard';
import denled from '../../../assets/device/denled.png';
import maybom from '../../../assets/device/maybom.png';
import { fetchDevices, overrideDevice } from '../api/deviceApi';

interface Device {
  id: number;
  type: string;
}

export const DeviceList: React.FC = () => {

  const [devices, setDevices] = useState<Device[]>([]);
  const[activeCardId, setActiveCardId] = useState<number | null>(null);

  const[deviceStatuses, setDeviceStatuses] = useState<Record<number, 'ON' | 'OFF'>>({});
  
  const [loadingIds, setLoadingIds] = useState<number[]>([]);
  

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchDevices();
      setDevices(data);
      
      const initialStatuses: Record<number, 'ON' | 'OFF'> = {};
      data.forEach((device: Device) => {
         initialStatuses[device.id] = 'OFF';
      });
      setDeviceStatuses(initialStatuses);

      if (data.length > 0) setActiveCardId(data[0].id);
    };

    loadData();
  },[]);

  const handleToggle = async (deviceId: number, currentStatus: 'ON' | 'OFF') => {
    setActiveCardId(deviceId);
    setLoadingIds(prev => [...prev, deviceId]);

    const newStatus = currentStatus === 'ON' ? 'OFF' : 'ON';

    const now = new Date();
    now.setHours(now.getHours() + 1);
    const expireTime = now.toISOString().substring(0, 19);

    try {
      await overrideDevice(deviceId, newStatus, expireTime);
      setDeviceStatuses(prev => ({
        ...prev,[deviceId]: newStatus
      }));
    } catch (error) {
      console.error("Chi tiết lỗi:", error);
      alert("Lỗi! Không thể điều khiển thiết bị.");
    } finally {
      setLoadingIds(prev => prev.filter(id => id !== deviceId)); // Tắt loading
    }
  };

  const getDeviceUI = (type: string) => {
    switch(type) {
      case 'pump': 
        return { title: 'Máy bơm', image: maybom };
      case 'light': 
        return { title: 'Đèn LED', image: denled };
      default: 
        return { title: 'Thiết bị lạ', image: denled };
    }
  };

  return (
    <div className="flex gap-6 p-8 bg-white min-h-screen">
      
      {/* Duyệt mảng và render Card */}
      {devices.map(device => {
        const ui = getDeviceUI(device.type);
        const status = deviceStatuses[device.id] || 'OFF';
        const isLoading = loadingIds.includes(device.id);

        return (
          <DeviceCard
            key={device.id}
            title={ui.title}
            image={ui.image}
            status={status}
            isActive={activeCardId === device.id}
            isLoading={isLoading}
            onToggleClick={() => handleToggle(device.id, status)}
            onDetailClick={() => console.log(`Chi tiết ${ui.title}`)}
          />
        );
      })}

      <div className="w-85 h-75 rounded-4xl bg-[#eef7ef] border-2 border-dashed border-brand-green/50 flex items-center justify-center cursor-pointer hover:bg-[#e4f3e5] transition-colors">
      </div>

    </div>
  );
};