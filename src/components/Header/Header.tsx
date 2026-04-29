// src/components/Header/Header.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, UserCircle, LogOut } from 'lucide-react';
import { SearchField } from '../SearchField/SearchField';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    () => !!localStorage.getItem('token')
  );

  const [username, setUsername] = useState<string | null>(
    () => localStorage.getItem('username')
  );

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');

    setIsLoggedIn(false);
    setUsername(null);

    window.dispatchEvent(new Event('authChange'));
    navigate('/');
  };

  const handleLogoClick = () => {
    if (isLoggedIn) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  const isLandingPage = location.pathname === '/';
  const showActions = isLoggedIn && !isLandingPage;

  return (
    <header className="bg-brand-green text-white px-14 py-2 flex items-center justify-between z-50 shadow-md">
      {/* Logo */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogoClick}>
        <div className="w-35">
          <img src="/images/logo.png" alt="Logo" />
        </div>
      </div>

      {/* Chỉ hiển thị thanh Search khi thỏa mãn điều kiện */}
      {showActions && (
        <div className="flex-1 flex justify-center px-4">
          <SearchField />
        </div>
      )}

      {/* Khu vực Nút chức năng */}
      <div className="flex items-center px-2 py-0.5 gap-6">
        {showActions && (
          <>
            {/* Thông báo */}
            <div className="bg-white rounded-full">
              <button className="p-2 text-brand-green cursor-pointer transition-colors relative flex items-center justify-center">
                <Bell size={20} strokeWidth={2.5} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-red rounded-full border border-white"></span>
              </button>
            </div>

            {/* Profile */}
            <div className="bg-white rounded-full">
              <button
                onClick={() => navigate('/profile')}
                className="px-3 py-1.5 text-brand-green cursor-pointer transition-colors flex items-center justify-center gap-2 font-bold hover:bg-gray-50 rounded-full"
              >
                <UserCircle size={22} strokeWidth={2.5} />
                {username && <span className="text-sm pb-0.5 pr-1">{username}</span>}
              </button>
            </div>

            {/* Đăng xuất */}
            <div className="bg-white rounded-full">
              <button
                className="px-4 py-1.5 text-brand-red font-bold cursor-pointer transition-colors flex items-center gap-2 hover:bg-red-50 rounded-full"
                onClick={handleLogout}
              >
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