// src/components/Header/Header.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, UserCircle, LogOut } from 'lucide-react';
import { SearchField } from '../SearchField/SearchField';
// import { Button } from '../Button/Button';

// import { Modal } from '../Modal/Modal';
// import { LoginForm } from '../../features/auth/components/LoginForm';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    () => !!localStorage.getItem('token')
  );
  // const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);

      if (token) {
        // setIsLoginModalOpen(false);
      }
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

    window.dispatchEvent(new Event('authChange'));
    navigate('/');
  };

  return (
    <header className="bg-brand-green text-white px-14 py-2 flex items-center justify-between z-50 shadow-md">
      {/* Logo */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-35">
          <img src="/images/logo.png" alt="Logo" />
        </div>
      </div>

      <div className="flex-1 flex justify-center px-4">
        <SearchField />
      </div>

      <div className="flex items-center px-2 py-0.5 gap-6">
        {isLoggedIn ? (
          <>
            <div className="bg-white rounded-full">
              <button className="p-2 text-brand-green cursor-pointer transition-colors relative flex items-center justify-center">
                <Bell size={20} strokeWidth={2.5} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-red rounded-full border border-white"></span>
              </button>
            </div>
            <div className="bg-white rounded-full">
              <button className="px-3 py-2 text-brand-green cursor-pointer transition-colors flex items-center justify-center gap-2">
                <UserCircle size={22} strokeWidth={2.5} />
              </button>
            </div>
            <div className="bg-white rounded-full">
              <button className="px-4 py-2 text-brand-red font-bold cursor-pointer transition-colors flex items-center gap-2" onClick={handleLogout}>
                <LogOut size={18} strokeWidth={2.5} />
                <span>Đăng xuất</span>
              </button>
            </div>

          </>
        ) : (
          <>
            {/* <Button
              variant="outline-gray"
              className=" px-10 py-2 text-brand-green font-bold border-0 bg-white rounded-2xl"
              onClick={() => setIsLoginModalOpen(true)}
            >
              Đăng nhập
            </Button> */}
          </>
        )}
      </div>

      {/* <Modal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        className="w-180"
      >
        <LoginForm role="owner" />
      </Modal> */}
    </header>
  );
};