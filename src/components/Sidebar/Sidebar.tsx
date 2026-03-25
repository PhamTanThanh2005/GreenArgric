import React from 'react';
import { Home, Thermometer, Radio, Database } from 'lucide-react';
import { Button } from '../Button/Button';
import { cn } from '../../utils';

// Danh sách các mục điều hướng
const navItems = [
  { name: 'TRANG CHỦ', icon: Home, active: true },
  { name: 'THÔNG SỐ MÔI TRƯỜNG', icon: Thermometer },
  { name: 'ĐIỀU KHIỂN THIẾT BỊ', icon: Radio },
  { name: 'DỮ LIỆU LƯU TRỮ', icon: Database },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className=" w-78 h-full flex flex-col p-6 text-white">

      {/* Danh sách các nút điều hướng */}
      <nav className="flex flex-col gap-8">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.name}
              variant={item.active ? 'outline-gray' : 'solid-green'}
              size="md"
              className={cn(
                'w-full justify-start text-left gap-3 font-bold px-4 py-4 rounded-xl',
                item.active
                  ? 'bg-white text-brand-red border-4 border-brand-red font-extrabold'
                  : 'bg-white text-brand-green hover:bg-gray-50'
              )}
            >
              <Icon size={24} className={cn(item.active ? 'text-brand-red' : 'text-brand-green')} />
              {item.name}
            </Button>
          );
        })}
      </nav>
    </aside>
  );
};