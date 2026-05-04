import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Calendar } from './Calendar';
import { NotificationItem } from './NotificationItem';
import { notificationApi, type AppNotification } from '../../features/notification/notificationApi'; 

export const RightSidebar: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const data = await notificationApi.getAll();
        setNotifications(data);
      } catch (error) {
        console.error("Lỗi khi tải thông báo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifs();

    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadNotifs = notifications
    .filter(n => !n.is_read)
    .slice(0, 6);

  return (
    <aside className="w-90 flex flex-col p-6 text-white border-l-3 border-brand-green/50 gap-8 bg-white overflow-y-auto shrink-0">
      
      <Calendar />

      <div className="flex flex-col gap-6 justify-center">
        <h3 className="text-xl font-bold text-brand-green">THÔNG BÁO</h3>
        
        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="flex justify-center py-4">
               <RefreshCw className="animate-spin text-brand-green w-6 h-6" />
            </div>
          ) : unreadNotifs.length === 0 ? (
            <p className="text-gray-400 text-sm italic text-center py-4 border-2 border-dashed border-gray-100 rounded-xl">
              Không có thông báo mới nào.
            </p>
          ) : (
            unreadNotifs.map((notif) => (
              <NotificationItem 
                key={notif.id} 
                type={notif.type === 'INFO' ? 'info' : 'warning'}
                message={notif.message}
                time={new Date(notif.created_at).toLocaleString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              />
            ))
          )}
        </div>
      </div>

    </aside>
  );
};