import React from 'react';
import {CloudSun, Sprout } from 'lucide-react';
import weatherBg from "../../../assets/weather.png";

interface ZoneBannerCardProps {
  zoneName?: string;
  cropType?: string;
  image?: string;
}

export const ZoneBannerCard: React.FC<ZoneBannerCardProps> = ({
  zoneName = "Khu vực nhà kính",
  cropType = "Đang cập nhật...",
  image = weatherBg
}) => {
  return (
    <div className="relative rounded-2xl overflow-hidden shadow-lg h-full min-h-50">
      <img
        src={image}
        alt="Zone Background"
        className="absolute inset-0 w-full h-full object-cover brightness-80"
      />

      <div className="absolute top-6 right-6 flex items-center gap-2 bg-white/95 backdrop-blur-sm text-brand-green px-4 py-1.5 rounded-full font-semibold shadow-sm">
        <Sprout size={18} />
        <span>{cropType}</span>
      </div>

      <div className="absolute top-20 right-6 bg-white/90 p-3 rounded-full flex items-center justify-center shadow-md">
        <CloudSun size={40} className="text-brand-green" />
      </div>

      <div className="absolute bottom-2 left-6 right-6">
        <h1 className="text-white text-5xl font-extrabold tracking-tight drop-shadow-lg leading-tight">
          {zoneName}
        </h1>
      </div>
    </div>
  );
};