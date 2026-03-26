import React from 'react';
import { Outlet } from 'react-router-dom';
import { SearchField } from '../components/SearchField/SearchField';
import { Button } from '../components/Button/Button';
import { Header } from '../components/Header/Header';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />

      {/* Nội dung trang */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};