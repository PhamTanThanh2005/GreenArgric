import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, UserCircle, LogOut } from 'lucide-react';
import { SearchField } from '../SearchField/SearchField';
import { Button } from '../Button/Button';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token'); 
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
    window.location.reload(); 
  };

  return (
    <header className="bg-brand-green text-white px-14 py-2 flex items-center justify-between z-50 shadow-md">
      {/* Logo  */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-35">
          <img src="/images/logo.png" alt="Logo" />
        </div>
      </div>

      {/* Search Field */}
      <div className="flex-1 flex justify-center px-4">
        <SearchField />
      </div>

      <div className="flex items-center bg-white rounded-md px-1 py-0.5 shadow-sm">
        
        {/*  LOGIC HIỂN THỊ */}
        {isLoggedIn ? (
          // --- GIAO DIỆN KHI ĐÃ ĐĂNG NHẬP ---
          <>
            <button 
              className="p-2 text-[#1b5e3a] hover:bg-green-50 rounded-md transition-colors relative flex items-center justify-center"
              title="Thông báo"
            >
              <Bell size={20} strokeWidth={2.5} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>

            <div className="bg-[#1b5e3a]/20 w-[1.5px] h-5 mx-1"></div>
            
            <button 
              className="p-2 text-[#1b5e3a] hover:bg-green-50 rounded-md transition-colors flex items-center justify-center"
              title="Hồ sơ cá nhân"
            >
              <UserCircle size={22} strokeWidth={2.5} />
            </button>

            <div className="bg-[#1b5e3a]/20 w-[1.5px] h-5 mx-1"></div>

            <button 
              className="px-4 py-2 text-brand-red font-bold hover:bg-red-50 rounded-md transition-colors flex items-center gap-2"
              onClick={handleLogout}
              title="Đăng xuất"
            >
              <LogOut size={18} strokeWidth={2.5} />
              <span>Đăng xuất</span>
            </button>
          </>
        ) : (
          // --- GIAO DIỆN KHI CHƯA ĐĂNG NHẬP ---
          <>
            <Button 
              variant="outline-gray" 
              className="rounded-none px-4 py-2 text-brand-green font-bold border-0 hover:bg-green-50"
            >
              Đăng nhập
            </Button>

            <div className="bg-brand-green/50 w-0.5 h-4 mx-1"></div>
            
            <Button 
              variant="outline-gray" 
              className="rounded-none px-4 py-2 text-brand-green font-bold border-0 hover:bg-green-50"
            >
              Hướng dẫn người dùng
            </Button>
          </>
        )}

      </div>
    </header>
  );
};