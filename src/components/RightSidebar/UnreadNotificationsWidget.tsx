import React, { useEffect, useState } from 'react';
import { notificationApi, type AppNotification } from '../../features/notification/notificationApi';
import { NotificationItem } from './NotificationItem'; // File của bạn
import { RefreshCw } from 'lucide-react';

export const UnreadNotificationsList: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const data = await notificationApi.getAll();
        setNotifications(data);
      } catch (error) {
        console.error("Lỗi", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifs();
  }, []);

  // LỌC CHỈ LẤY TIN CHƯA ĐỌC
  const unreadNotifs = notifications.filter(n => !n.is_read);

  if (loading) return <RefreshCw className="animate-spin text-brand-green" />;

  if (unreadNotifs.length === 0) {
    return <p className="text-gray-500 italic">Không có cảnh báo mới nào.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {unreadNotifs.map(notif => (
        <NotificationItem 
          key={notif.id}
          // Chuyển đổi type từ DB sang type của component bạn viết
          type={notif.type === 'SUCCESS' ? 'success' : 'alert'} 
          message={notif.message}
          time={new Date(notif.created_at).toLocaleString('vi-VN')}
        />
      ))}
    </div>
  );
};