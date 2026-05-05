import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header/Header';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};