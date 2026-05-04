// src/features/dashboard/components/SensorCard.tsx

import React from 'react';
import { ArrowUpRight, type LucideIcon } from 'lucide-react';

interface SensorCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: LucideIcon;
  imageSrc: string;
  valueColor?: string;
}

export const SensorCard: React.FC<SensorCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  imageSrc,
  valueColor = "text-brand-red"
}) => {
  return (
    <div className=" rounded-2xl overflow-hidden flex h-40 shadow-sm border border-brand-green/10 relative group hover:shadow-md transition-shadow cursor-pointer">
      <div className="w-[45%] h-full overflow-hidden">
        <img 
          src={imageSrc} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      <div className="w-[55%] p-4 flex flex-col justify-center items-center relative">
        <div className="absolute top-3 right-3 text-brand-green opacity-60 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight size={22} strokeWidth={2.5} />
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Icon size={20} className="text-brand-green" strokeWidth={2.5} />
          <span className="text-brand-green font-bold text-lg tracking-wide">
            {title}
          </span>
        </div>

        <div className="flex items-baseline gap-2 mt-1">
          <span className={`text-5xl font-extrabold tracking-tighter ${valueColor}`}>
            {value}
          </span>
          <span className="text-brand-red font-medium text-xl">
            {unit}
          </span>
        </div>

      </div>
      
    </div>
  );
};