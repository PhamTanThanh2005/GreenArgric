import React from 'react';
import { Home, Thermometer, Radio, Database, Users, Cpu, type LucideIcon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../Button/Button';
import { cn } from '../../utils';

interface NavItem {
  name: string;
  icon: LucideIcon;
  path: string;
}

const navItems: NavItem[] = [
  { name: 'TRANG CHỦ', icon: Home, path: '/dashboard' },
  { name: 'THÔNG SỐ MÔI TRƯỜNG', icon: Thermometer, path: '/environment' },
  { name: 'ĐIỀU KHIỂN THIẾT BỊ', icon: Radio, path: '/control-device' },
  { name: 'QUẢN LÝ PHÂN KHU', icon: Thermometer, path: '/manage-area' },
  { name: 'DỮ LIỆU LƯU TRỮ', icon: Database, path: '/storage' },
];

const adminNavItems: NavItem[] = [
  { name: 'TRANG CHỦ', icon: Home, path: '/admin/dashboard' },
  { name: 'QUẢN LÝ NGƯỜI DÙNG', icon: Users, path: '/admin/users' },
  { name: 'KHU VỰC VÀ THIẾT BỊ', icon: Cpu, path: '/admin/devices' }
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate(); 
  const role = localStorage.getItem('role');

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = location.pathname.includes(item.path);

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
  };

  const currentNavItems = role === 'admin' ? adminNavItems : navItems;

  return (
    <aside className="w-78 h-full flex flex-col p-6 text-white overflow-y-auto custom-scrollbar">
      <nav className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          {currentNavItems.map(renderNavItem)}
        </div>
      </nav>
    </aside>
  );
};