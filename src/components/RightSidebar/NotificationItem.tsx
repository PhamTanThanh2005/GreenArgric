import React from 'react';
import { Bell, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils';

interface NotificationItemProps {
  type: 'info' | 'warning' | 'error';
  message: string;
  time: string;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ type, message, time }) => {
  const Icon = type === 'info' ? Bell : AlertTriangle;
  return (
    <div className={cn(
        "rounded-xl shadow-md p-5 flex items-start gap-4 border-2",
        type === 'info' ? 'bg-white border-brand-green' : 'bg-[#fef2f2] border-brand-red'
    )}>
      <div className={cn(
          "rounded-full p-2 flex items-center justify-center shrink-0",
          type === 'info' ? 'bg-second-green' : 'bg-[#ecc8c8]'
      )}>
         <Icon size={20} className={cn(
             type === 'info' ? 'text-brand-green' : 'text-brand-red'
         )}/>
      </div>
      <div className="flex-1 flex flex-col gap-1">
         <p className="text-base text-gray-800 font-medium leading-relaxed">{message}</p>
         <span className="text-sm text-gray-500 font-semibold">{time}</span>
      </div>
    </div>
  );
};