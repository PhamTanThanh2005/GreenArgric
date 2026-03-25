import React from 'react';
import { Bell, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils';

interface NotificationItemProps {
  type: 'success' | 'alert';
  message: string;
  time: string;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ type, message, time }) => {
  const Icon = type === 'success' ? Bell : AlertTriangle;
  return (
    <div className={cn(
        "rounded-xl shadow-md p-5 flex items-start gap-4 border",
        type === 'success' ? 'bg-[#f0fdf4] border-[#86efac]' : 'bg-[#fef2f2] border-[#fca5a5]'
    )}>
      <div className={cn(
          "rounded-full p-2 flex items-center justify-center shrink-0",
          type === 'success' ? 'bg-[#d1fae5]' : 'bg-[#fee2e2]'
      )}>
         <Icon size={20} className={cn(
             type === 'success' ? 'text-[#166534]' : 'text-[#b91c1c]'
         )}/>
      </div>
      <div className="flex-1 flex flex-col gap-1">
         <p className="text-base text-gray-800 font-medium leading-relaxed">{message}</p>
         <span className="text-sm text-gray-500 font-semibold">{time}</span>
      </div>
    </div>
  );
};