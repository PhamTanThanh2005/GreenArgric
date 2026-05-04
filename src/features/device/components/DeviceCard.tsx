import React from 'react';
import { cn } from '../../../utils/index';

interface DeviceCardProps {
  title: string;
  image: string;
  status: 'ON' | 'OFF';
  isActive?: boolean;
  onDetailClick?: () => void;
  onToggleClick?: () => void;
  isLoading?: boolean; 
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  title,
  image,
  status,
  // isActive = false,
  onDetailClick,
  onToggleClick,
  isLoading = false,
}) => {
  const isON = status === 'ON';

  return (
    <div
      className={cn(
        'relative w-85 h-75 rounded-4xl overflow-hidden cursor-pointer transition-all duration-300'
      )}
    >
      <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover" />

      <div className="absolute top-0 right-0">
        <div className="bg-white px-4 py-3 rounded-bl-[28px] relative flex items-center justify-center">

          <div
            onClick={(e) => {
              e.stopPropagation();
              if (!isLoading && onToggleClick) onToggleClick(); 
            }}
            className={cn(
              'flex items-center justify-between gap-3 px-3 py-1.5 rounded-full cursor-pointer transition-colors',
              isON ? 'bg-brand-green' : 'bg-brand-red',
              isLoading ? 'opacity-50 cursor-not-allowed' : '' 
            )}
          >
            <span className="text-white font-extrabold text-lg tracking-wide leading-none pt-0.5">
              {status}
            </span>
            <div className="w-6 h-6 bg-white rounded-full shadow-sm"></div>
          </div>

          <div className="absolute top-0 -left-4 w-4 h-4 bg-transparent shadow-[5px_-5px_0_5px_white] rounded-tr-2xl pointer-events-none"></div>
          <div className="absolute -bottom-4 right-0 w-4 h-4 bg-transparent shadow-[5px_-5px_0_5px_white] rounded-tr-2xl pointer-events-none"></div>
        </div>
      </div>

      <div className="absolute bottom-5 left-6 right-5 flex justify-between items-end">
        <h3 className="text-white text-[32px] font-extrabold leading-none tracking-tight shadow-2xl">
          {title}
        </h3>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onDetailClick) onDetailClick();
          }}
          className="bg-white text-brand-green px-4 py-2 rounded-full font-bold text-[13px] hover:bg-gray-100 transition-colors shadow-sm"
        >
          Xem chi tiết
        </button>
      </div>
    </div>
  );
};