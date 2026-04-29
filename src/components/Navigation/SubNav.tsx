// src/components/Navigation/SubNav.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Menu, ChevronRight, Map, ChevronDown } from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { cn } from '../../utils';
import { areaApi, type AreaData } from '../../features/dashboard/api/areaApi';

export const SubNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [areas, setAreas] = useState<AreaData[]>([]);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const data = await areaApi.getAll();
        setAreas(data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách khu vực ở SubNav:", error);
      }
    };
    fetchAreas();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getCurrentPageName = () => {
    const path = location.pathname;
    
    if (path.includes('/control-device')) return 'Điều khiển thiết bị';
    
    const matchedZone = areas.find(z => path.includes(`/zone/${z.id}`));
    if (matchedZone) return matchedZone.name;

    return 'Tổng quan Nông trại';
  };

  return (
    <nav className="w-full flex items-center justify-between h-12 bg-[#f0f2f5] pr-6 border-b border-gray-200">
      
      {/* KHU VỰC TRÁI: Nút Menu & Breadcrumbs */}
      <div className="flex items-center h-full">
        {/* Nút Hamburger Menu */}
        <button className="flex items-center justify-center h-full px-6 hover:bg-gray-200 transition-colors">
          <Menu size={28} className="text-brand-green stroke-[2.5px]" />
        </button>

        {/* Breadcrumbs */}
        <div className="flex items-center px-4 text-sm font-semibold text-gray-500">
          <Link 
            to="/dashboard" 
            className="hover:text-brand-green transition-colors"
          >
            Trang chủ
          </Link>
          
          <ChevronRight size={16} className="mx-2 text-gray-400" />
          
          <span className="text-brand-green">
            {getCurrentPageName()}
          </span>
        </div>
      </div>

      {/* KHU VỰC PHẢI: Dropdown Chọn Khu Vực */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={cn(
            "flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-colors",
            isDropdownOpen 
              ? "bg-brand-green text-white" 
              : "bg-white text-brand-green border border-brand-green hover:bg-brand-green/10"
          )}
        >
          <Map size={18} />
          <span>Chuyển khu vực</span>
          <ChevronDown size={16} className={cn("transition-transform", isDropdownOpen && "rotate-180")} />
        </button>

        {/* Menu thả xuống - Render động từ API */}
        {isDropdownOpen && (
          <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border-2 border-brand-green py-2 z-50 overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-50 mb-1">
              <p className="text-sm font-bold text-brand-green uppercase tracking-wider">Danh sách phân khu</p>
            </div>
            
            {areas.length === 0 ? (
              <p className="px-4 py-2 text-sm text-gray-400">Đang tải...</p>
            ) : (
              areas.map((zone) => {
                const isActive = location.pathname.includes(`/zone/${zone.id}`) || location.pathname.includes(`/zones/${zone.id}`);
                return (
                  <button
                    key={zone.id}
                    onClick={() => {
                      navigate(`/zones/${zone.id}`); 
                      setIsDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50",
                      isActive ? "text-brand-green bg-brand-green/5" : "text-gray-700"
                    )}
                  >
                    {zone.name}
                  </button>
                )
              })
            )}
          </div>
        )}
      </div>

    </nav>
  );
};