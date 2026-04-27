import React from 'react';
import { Calendar } from './Calendar';
import { NotificationItem } from './NotificationItem';

// Dữ liệu mock cho thông báo
const notifications = [
  { type: 'success', message: 'Máy bơm đã hoạt động trong vòng 75s vào 15:33 hôm nay', time: '15:33 hôm nay' },
  { type: 'alert', message: 'Nhiệt độ của môi trường vượt ngưỡng vào lúc 15:32 hôm nay', time: '15:32 hôm nay' },
  { type: 'success', message: 'Máy bơm đã hoạt động trong vòng 75s vào 15:33 hôm nay', time: '15:33 hôm nay' },
  { type: 'alert', message: 'Nhiệt độ của môi trường vượt ngưỡng vào lúc 15:32 hôm nay', time: '15:32 hôm nay' },
] as const;

export const RightSidebar: React.FC = () => {
  return (
    <aside className="w-90 flex flex-col p-6 text-white border-l-3 border-brand-green/50 gap-8 bg-white overflow-y-auto shrink-0">
      <Calendar />
      <div className="flex flex-col gap-6 justify-center">
        <h3 className="text-xl font-bold text-brand-green">THÔNG BÁO</h3>
        <div className="flex flex-col gap-4">
          {notifications.map((notif, index) => (
            <NotificationItem key={index} {...notif} />
          ))}
        </div>
      </div>
    </aside>
  );
};