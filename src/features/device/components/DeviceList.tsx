import React, { useState } from 'react';
import { DeviceCard } from './DeviceCard';
import denled from '../../../assets/device/denled.png';
import maybom from '../../../assets/device/maybom.png';
import { useAdafruitFeed } from '../../../hooks/useAdafruitFeed';

export const DeviceList: React.FC = () => {

  const [activeCard, setActiveCard] = useState<string>('may-bom');

  const pump = useAdafruitFeed('may-bom-feed'); 
  const led = useAdafruitFeed('den-led-feed');

  return (
    <div className="flex gap-6 p-8 bg-white min-h-screen">
      
      <DeviceCard
        title="Máy bơm"
        image= {maybom}
        status={pump.status}
        isActive={activeCard === 'may-bom'}
        onToggleClick={() => {
          setActiveCard('may-bom');
          pump.toggleDevice();      // Gọi API lên Adafruit
        }}
        onDetailClick={() => console.log('Chi tiết Máy bơm')}
      />

      <DeviceCard
        title="Đèn LED"
        image= {denled}
        status={led.status}
        isActive={activeCard === 'den-led'}
        onToggleClick={() => {
          setActiveCard('den-led');
          led.toggleDevice();       // Gọi API lên Adafruit
        }}
        onDetailClick={() => console.log('Chi tiết Đèn LED')}
      />

      <div className="w-85 h-75 rounded-4xl bg-white border-2 border-dashed border-brand-green/50 flex items-center justify-center cursor-pointer hover:bg-white transition-colors">
      </div>

    </div>
  );
};