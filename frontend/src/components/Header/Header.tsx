import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, UserCircle, LogOut, CheckCircle } from 'lucide-react';
import { SearchField } from '../SearchField/SearchField';
import { notificationApi, type AppNotification } from '../../features/notification/notificationApi'; // Thay đường dẫn cho đúng
import { cn } from '../../utils';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!localStorage.getItem('token'));
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem('username'));

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
      setUsername(localStorage.getItem('username'));
    };
    checkAuthStatus();
    window.addEventListener('storage', checkAuthStatus);
    window.addEventListener('authChange', checkAuthStatus);
    return () => {
      window.removeEventListener('storage', checkAuthStatus);
      window.removeEventListener('authChange', checkAuthStatus);
    };
  }, [location]);

  useEffect(() => {
    if (isLoggedIn) {
      const fetchNotifs = async () => {
        try {
          const data = await notificationApi.getAll();
          setNotifications(data);
        } catch (error) {
          console.error("Lỗi lấy thông báo", error);
        }
      };
      fetchNotifs();
      const interval = setInterval(fetchNotifs, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUsername(null);
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
  };

  const handleReadNotification = async (id: number, isRead: boolean | number) => {
    if (isRead) return;
    try {
      await notificationApi.markAsRead(id);

      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );

    } catch (error) {
      console.error("Lỗi đánh dấu đã đọc:", error);

      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.error || "Không thể đánh dấu đã đọc. Vui lòng thử lại!");
      } else {
        alert("Đã xảy ra lỗi không xác định. Vui lòng thử lại!");
      }
    }
  };

  const isLandingPage = location.pathname === '/';
  const showActions = isLoggedIn && !isLandingPage;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="bg-brand-green text-white px-14 py-2 flex items-center justify-between z-50 shadow-md relative">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(isLoggedIn ? '/dashboard' : '/')}>
        <div className="w-35"><img src="/images/logo.png" alt="Logo" /></div>
      </div>

      {showActions && (
        <div className="flex-1 flex justify-center px-4">
          <SearchField />
        </div>
      )}

      <div className="flex items-center px-2 py-0.5 gap-6">
        {showActions && (
          <>
            <div className="relative" ref={notifRef}>
              <div className="bg-white rounded-full">
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="p-2 text-brand-green cursor-pointer transition-colors relative flex items-center justify-center"
                >
                  <Bell size={20} strokeWidth={2.5} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-brand-red rounded-full border border-white"></span>
                  )}
                </button>
              </div>

              {isNotifOpen && (
                <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-gray-800 font-bold">Thông báo</h3>
                    {unreadCount > 0 && <span className="bg-brand-green text-white text-xs px-2 py-0.5 rounded-full">{unreadCount} mới</span>}
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">Chưa có thông báo nào</div>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => handleReadNotification(notif.id, notif.is_read)}
                          className={cn(
                            "px-4 py-3 border-b border-gray-50 cursor-pointer transition-colors flex gap-3",
                            notif.is_read ? "bg-gray-100 opacity-70" : "bg-white hover:bg-green-50"
                          )}
                        >
                          <div className="mt-1">
                            {notif.is_read ? <CheckCircle size={16} className="text-gray-400" /> : <span className="w-2.5 h-2.5 bg-brand-green rounded-full block mt-1.5"></span>}
                          </div>
                          <div className="flex-1">
                            <p className={cn("text-sm mb-1", notif.is_read ? "text-gray-600" : "text-gray-800 font-bold")}>{notif.title}</p>
                            <p className="text-xs text-gray-500 line-clamp-2">{notif.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{new Date(notif.created_at).toLocaleString('vi-VN')}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-full">
              <button onClick={() => navigate('/profile')} className="px-3 py-1.5 text-brand-green cursor-pointer transition-colors flex items-center justify-center gap-2 font-bold hover:bg-gray-50 rounded-full">
                <UserCircle size={22} strokeWidth={2.5} />
                {username && <span className="text-sm pb-0.5 pr-1">{username}</span>}
              </button>
            </div>

            <div className="bg-white rounded-full">
              <button className="px-4 py-1.5 text-brand-red font-bold cursor-pointer transition-colors flex items-center gap-2 hover:bg-red-50 rounded-full" onClick={handleLogout}>
                <LogOut size={18} strokeWidth={2.5} />
                <span className="text-sm pb-0.5">Đăng xuất</span>
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};