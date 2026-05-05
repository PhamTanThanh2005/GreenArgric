import React from 'react';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({ title, children }) => {
  return (
    <div className="bg-white rounded-xl border-3 border-brand-green/10 p-6 h-full flex flex-col gap-4 shadow-sm">
      <h3 className="text-xl font-bold text-brand-green">{title}</h3>
      <div className="flex-1 w-full h-full">
        {children}
      </div>
    </div>
  );
};