import React, { useState, useRef, useEffect } from 'react';
import { Menu, ChevronRight, Map, ChevronDown } from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { cn } from '../../utils';

// Danh sách các khu vực để render Dropdown
const ZONES = [
  { id: 'zone-a', name: 'Khu A - Dưa lưới' },
  { id: 'zone-b', name: 'Khu B - Cà chua' },
  { id: 'zone-c', name: 'Khu C - Rau mầm' },
  { id: 'zone-d', name: 'Khu D - Dâu tây' },
];

export const SubNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Xử lý click ra ngoài để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Hàm phụ trợ tạo tên Breadcrumb dựa vào URL hiện tại
  const getCurrentPageName = () => {
    const path = location.pathname;
    
    if (path.includes('/control-device')) return 'Điều khiển thiết bị';
    
    // Kiểm tra xem có đang ở trang chi tiết khu vực nào không
    const matchedZone = ZONES.find(z => path.includes(`/zones/${z.id}`));
    if (matchedZone) return matchedZone.name;

    return 'Tổng quan Nông trại'; // Mặc định cho /dashboard
  };

  return (
    <nav className="w-full flex items-center justify-between h-12 bg-[#f0f2f5] pr-6 border-b border-gray-200">
      
      {/* KHU VỰC TRÁI: Nút Menu & Breadcrumbs */}
      <div className="flex items-center h-full">
        {/* Nút Hamburger Menu (Giữ nguyên) */}
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

        {/* Menu thả xuống */}
        {isDropdownOpen && (
          <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-50 mb-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Danh sách phân khu</p>
            </div>
            
            {ZONES.map((zone) => (
              <button
                key={zone.id}
                onClick={() => {
                  navigate(`/zones/${zone.id}`);
                  setIsDropdownOpen(false);
                }}
                className={cn(
                  "w-full text-left px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50",
                  location.pathname.includes(zone.id) ? "text-brand-green bg-brand-green/5" : "text-gray-700"
                )}
              >
                {zone.name}
              </button>
            ))}
          </div>
        )}
      </div>

    </nav>
  );
};