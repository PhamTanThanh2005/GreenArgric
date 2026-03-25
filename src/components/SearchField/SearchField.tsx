import React from 'react';
import { Search } from 'lucide-react';

export const SearchField: React.FC = () => {
  return (
    <div className="flex items-center bg-white rounded-md overflow-hidden p-1 px-2 shadow-sm w-full max-w-md">
      <div className="text-white bg-brand-green p-1 rounded-sm items-center">
        <Search size={18} className=""/>
      </div>
      <input 
        type="text" 
        placeholder="Tìm kiếm" 
        className="flex-1 outline-none text-sm py-1 px-2 text-gray-700"
      />
      <button className="bg-brand-green text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-[#14472b] transition-colors">
        Tìm kiếm
      </button>
    </div>
  );
};