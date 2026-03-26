import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { cn } from '../../utils';

const menuItems = [
  'Trang chủ',
  'Thông số môi trường',
  'Điều khiển thiết bị',
  'Dữ liệu môi trường',
];

export const SubNav: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Trang chủ');

  return (
    <nav className="w-full flex items-stretch h-12 bg-[#f0f2f5]">
      
      <button className="flex items-center justify-center px-6 hover:bg-gray-200 transition-colors">
        <Menu size={28} className="text-brand-green stroke-[2.5px]" />
      </button>


      <div className="flex flex-1 items-stretch">
        {menuItems.map((item, index) => {
          const isActive = activeTab === item;

          return (
            <React.Fragment key={item}>
              <button
                onClick={() => setActiveTab(item)}
                className={cn(
                  "px-8 flex items-center justify-center text-[15px] font-bold transition-colors cursor-pointer",
                  isActive
                    ? "bg-white text-brand-red"
                    : "bg-transparent text-brand-green hover:bg-gray-200"
                )}
              >
                {item}
              </button>
            
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};