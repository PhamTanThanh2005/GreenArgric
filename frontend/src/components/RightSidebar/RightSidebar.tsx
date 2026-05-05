import React, { useEffect, useState } from 'react';
import { RefreshCw, Clock, CircleDashed, MapPin } from 'lucide-react';
import { Calendar } from './Calendar';
import { NotificationItem } from './NotificationItem';
import { cn } from '../../utils';

// Import các API (Bạn nhớ kiểm tra lại đường dẫn import areaApi cho khớp với project của bạn nhé)
import { notificationApi, type AppNotification } from '../../features/notification/notificationApi';
import { taskApi, type AppTask } from '../../features/task/taskApi';
import { areaApi, type AreaData } from '../../features/dashboard/api/areaApi';

export const RightSidebar: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [tasks, setTasks] = useState<AppTask[]>([]);
  const [areas, setAreas] = useState<AreaData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [notifData, taskData, areaData] = await Promise.all([
          notificationApi.getAll(),
          taskApi.getAll(),
          areaApi.getAll()
        ]);

        setNotifications(notifData);
        setTasks(taskData);
        setAreas(areaData); // <-- Lưu Area vào state
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu RightSidebar:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadNotifs = notifications
    .filter(n => !n.is_read)
    .slice(0, 6);

  const activeTasks = tasks
    .filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS')
    .slice(0, 5);

  const getAreaName = (areaId: number) => {
    const area = areas.find(a => a.id === areaId);
    return area ? area.name : `Khu ${areaId}`;
  };

  return (
    <aside className="w-90 flex flex-col p-6 text-white border-l-3 border-brand-green/50 gap-8 bg-white overflow-y-auto shrink-0 shadow-sm">
      <Calendar />

      {/* KHU VỰC CÔNG VIỆC */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-brand-green border-b-2 border-brand-green/20 pb-2">
          CÔNG VIỆC
        </h3>

        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="flex justify-center py-2">
              <RefreshCw className="animate-spin text-brand-green w-5 h-5" />
            </div>
          ) : activeTasks.length === 0 ? (
            <p className="text-gray-400 text-sm italic text-center py-3 border-2 border-dashed border-gray-100 rounded-xl">
              Tuyệt vời! Bạn không có công việc nào đang tồn đọng.
            </p>
          ) : (
            activeTasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  "rounded-xl p-3 flex items-start gap-3 border border-gray-100 shadow-sm bg-white transition-all hover:shadow-md",
                  task.status === 'IN_PROGRESS' && "border-l-4 border-l-brand-green"
                )}
              >
                <div className="mt-0.5">
                  {task.status === 'IN_PROGRESS' ? (
                    <CircleDashed size={18} className="text-brand-green animate-[spin_3s_linear_infinite]" />
                  ) : (
                    <Clock size={18} className="text-brand-green" />
                  )}
                </div>

                <div className="flex-1 flex flex-col gap-1.5">
                  <p className="text-sm text-gray-800 font-semibold line-clamp-2 leading-tight">
                    {task.title}
                  </p>

                  <div className="flex items-center gap-2 text-xs font-medium">
                    <span className="flex items-center gap-1 bg-brand-green/10 text-brand-green px-1.5 py-0.5 rounded-md truncate max-w-30">
                      <MapPin size={10} className="shrink-0" />
                      <span className="truncate">{getAreaName(task.area_id)}</span>
                    </span>

                    <span className="text-gray-500 shrink-0">
                      {new Date(task.scheduled_at).toLocaleString('vi-VN', {
                        hour: '2-digit', minute: '2-digit', hour12: false,
                        timeZone: 'UTC', day: '2-digit', month: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* KHU VỰC THÔNG BÁO */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-brand-green border-b-2 border-brand-green/20 pb-2">
          THÔNG BÁO MỚI
        </h3>

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
                  hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
                })}
              />
            ))
          )}
        </div>
      </div>

    </aside>
  );
};