import React from 'react';

export const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="bg-white px-8 py-8 rounded-3xl shadow-2xl border-brand-green/40 border-6 max-w-lg w-full mx-auto flex flex-col items-center z-10 relative">
      {children}
    </div>
  );
};