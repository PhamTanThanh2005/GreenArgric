import React from 'react';
import { DeviceCard } from '../features/device/components/DeviceTitle';
import { DeviceList } from '../features/device/components/DeviceList';

export const ControlDevicePage: React.FC = () => {
  return (
    <div className="p-8 flex-1 flex flex-col gap-6 bg-white">
      <h2 className="text-2xl font-medium text-black font-playwrite">Điều khiển thiết bị</h2>
      <DeviceCard />

      <div className="">
        <DeviceList />
      </div>
    </div>
  );
};