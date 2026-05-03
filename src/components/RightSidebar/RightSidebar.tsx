import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Calendar } from './Calendar';
import { NotificationItem } from './NotificationItem';
// Đảm bảo đường dẫn này trỏ đúng đến file api của bạn
import { notificationApi, type AppNotification } from '../../features/notification/notificationApi'; 

export const RightSidebar: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // Gọi API lấy dữ liệu thông báo
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

    fetchNotifs(); // Gọi lần đầu khi component mount

    // Tự động cập nhật thông báo mỗi 30 giây (Rất cần thiết cho Sidebar)
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  // BỘ LỌC: Chỉ lấy những thông báo CÓ is_read == false (hoặc 0)
  const unreadNotifs = notifications
    .filter(n => !n.is_read)
    .slice(0, 6);

  return (
    <aside className="w-90 flex flex-col p-6 text-white border-l-3 border-brand-green/50 gap-8 bg-white overflow-y-auto shrink-0">
      
      {/* Lịch */}
      <Calendar />
      
      {/* Khu vực Thông báo */}
      <div className="flex flex-col gap-6 justify-center">
        <h3 className="text-xl font-bold text-brand-green">THÔNG BÁO</h3>
        
        <div className="flex flex-col gap-4">
          {/* Trạng thái đang tải */}
          {loading ? (
            <div className="flex justify-center py-4">
               <RefreshCw className="animate-spin text-brand-green w-6 h-6" />
            </div>
          ) : unreadNotifs.length === 0 ? (
            /* Trạng thái không có thông báo chưa đọc */
            <p className="text-gray-400 text-sm italic text-center py-4 border-2 border-dashed border-gray-100 rounded-xl">
              Không có thông báo mới nào.
            </p>
          ) : (
            /* Render danh sách thông báo chưa đọc */
            unreadNotifs.map((notif) => (
              <NotificationItem 
                key={notif.id} 
                // Map dữ liệu type từ DB (Ví dụ 'SUCCESS', 'WARNING') sang type của Component ('success', 'alert')
                type={notif.type === 'SUCCESS' ? 'success' : 'alert'}
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