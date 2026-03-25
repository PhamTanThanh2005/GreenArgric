import React from 'react';
import { Outlet } from 'react-router-dom';
import { SearchField } from '../components/SearchField/SearchField';
import { Button } from '../components/Button/Button';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="bg-brand-green text-white px-14 py-2 flex items-center justify-between z-50 shadow-md">
        {/* Logo góc trái */}
        <div className="flex items-center gap-2">
          <div className="w-35">
            <img src="/images/logo.png" alt="" />
          </div>
        </div>

        {/* Search Field ở giữa */}
        <div className="flex-1 flex justify-center px-4">
          <SearchField />
        </div>

        {/* Auth links góc phải */}
        <div className="flex items-center bg-white rounded-md px-1 py-0.5">
          <Button variant="outline-gray" className="rounded-none px-4 py-2 text-brand-green font-bold">
            Đăng nhập
          </Button>
          <div className="bg-brand-green/50 w-0.5 h-4"></div>
          <Button variant="outline-gray" className="rounded-none px-4 py-2 text-brand-green font-bold">
            Hướng dẫn người dùng
          </Button>
        </div>
      </header>

      {/* Nội dung trang thay đổi ở đây */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};