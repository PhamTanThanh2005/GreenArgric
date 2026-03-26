import React from 'react';
import { Home, Thermometer, Radio, Database } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../Button/Button';
import { cn } from '../../utils';

const navItems =[
  { name: 'TRANG CHỦ', icon: Home, path: '/dashboard' },
  { name: 'THÔNG SỐ MÔI TRƯỜNG', icon: Thermometer, path: '/environment' },
  { name: 'ĐIỀU KHIỂN THIẾT BỊ', icon: Radio, path: '/control-device' },
  { name: 'DỮ LIỆU LƯU TRỮ', icon: Database, path: '/data' },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate(); 

  return (
    <aside className="w-78 h-full flex flex-col p-6 text-white">

      <nav className="flex flex-col gap-8">
        {navItems.map((item) => {
          const Icon = item.icon;

          const isActive = location.pathname === item.path;

          return (
            <Button
              key={item.name}
              variant={isActive ? 'outline-gray' : 'solid-green'}
              size="md"
              onClick={() => navigate(item.path)}
              className={cn(
                'w-full justify-start text-left gap-3 font-bold px-4 py-4 rounded-xl transition-all',
                isActive
                  ? 'bg-white text-brand-red border-4 border-brand-red font-extrabold'
                  : 'bg-white text-brand-green hover:bg-gray-50 border-4 border-transparent' 
              )}
            >
              <Icon size={24} className={cn(isActive ? 'text-brand-red' : 'text-brand-green')} />
              {item.name}
            </Button>
          );
        })}
      </nav>
      
    </aside>
  );
};