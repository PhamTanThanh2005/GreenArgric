import React from 'react';
import { MapPin, CloudSun } from 'lucide-react';
import weather from "../../../assets/weather.png"

export const WeatherCard: React.FC = () => {
  return (
    <div className="relative rounded-2xl overflow-hidden shadow-lg h-72">
      <img
        src={weather}
        alt="Weather Background"
        className="w-full h-full object-cover"
      />

      <div className="absolute top-6 right-6 flex items-center gap-2 bg-white backdrop-blur-sm text-[#0f4a27] px-4 py-1.5 rounded-full font-semibold">
        <MapPin size={18} />
        <span>Tp. Đà Lạt</span>
      </div>
      
      {/* Icon Weather */}
      <div className="absolute top-20 right-20 bg-white p-4 rounded-full flex items-center justify-center">
         <CloudSun size={60} className='text-brand-green'/>
      </div>
      
      {/* Text "Weather" lớn */}
      <div className="absolute bottom-2 left-6">
        <h1 className="text-white text-7xl font-extrabold tracking-tight">Weather</h1>
      </div>
    </div>
  );
};