import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Sprout, Cpu, Loader2 } from 'lucide-react';
import { areaApi, type AreaData } from '../../features/dashboard/api/areaApi';
import { fetchDevices } from '../../features/device/api/deviceApi';
import { cn } from '../../utils';

interface DeviceData {
  id: number;
  device_name: string;
  type: string;
  status: number;
  area_name: string;
  mode: 'ON' | 'OFF';
}

export const SearchField: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [areas, setAreas] = useState<AreaData[]>([]);
  const [devices, setDevices] = useState<DeviceData[]>([]);
  
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadSearchData = async () => {
      setIsLoading(true);
      try {
        const [areasData, devicesData] = await Promise.all([
          areaApi.getAll().catch(() => []),
          fetchDevices().catch(() => []) as Promise<DeviceData[]>
        ]);
        setAreas(areasData);
        setDevices(devicesData);
      } catch (error) {
        console.error("Lỗi tải dữ liệu tìm kiếm:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSearchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const filteredResults = useMemo(() => {
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return { areas: [], devices: [] };

    return {
      areas: areas.filter(a => 
        a.name.toLowerCase().includes(lowerQuery) || 
        (a.description && a.description.toLowerCase().includes(lowerQuery))
      ),
      devices: devices.filter(d => 
        d.device_name.toLowerCase().includes(lowerQuery) || 
        d.area_name.toLowerCase().includes(lowerQuery)
      )
    };
  }, [query, areas, devices]);

  const hasResults = filteredResults.areas.length > 0 || filteredResults.devices.length > 0;

  const handleSelectArea = (areaId: number) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/zones/${areaId}`);
  };

  const handleSelectDevice = (areaName: string) => {
    setIsOpen(false);
    setQuery('');
    const targetArea = areas.find(a => a.name === areaName);
    if (targetArea) {
      navigate(`/zones/${targetArea.id}`);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      {/* Thanh Input */}
      <div className={cn(
        "flex items-center bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-2 transition-all",
        isOpen ? "bg-white text-gray-800 shadow-lg" : "text-white hover:bg-white/30"
      )}>
        <Search size={18} className={isOpen ? "text-brand-green" : "text-white"} />
        <input
          type="text"
          placeholder="Tìm kiếm khu vực, thiết bị..."
          className="bg-transparent border-none outline-none w-full px-3 text-sm placeholder:text-white/70 focus:placeholder:text-gray-400"
          style={{ color: isOpen ? '#1f2937' : 'inherit' }}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {isLoading && <Loader2 size={16} className="animate-spin text-white/70" />}
        {query && !isLoading && (
          <button onClick={() => { setQuery(''); setIsOpen(false); }} className="p-1 hover:bg-gray-100/20 rounded-full">
            <X size={16} className={isOpen ? "text-gray-400" : "text-white"} />
          </button>
        )}
      </div>

      {/* Dropdown Kết quả */}
      {isOpen && query.trim() !== '' && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-96 flex flex-col">
          {!hasResults ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              Không tìm thấy kết quả nào cho "{query}"
            </div>
          ) : (
            <div className="overflow-y-auto custom-scrollbar p-2">
              
              {/* Kết quả: Khu vực */}
              {filteredResults.areas.length > 0 && (
                <div className="mb-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase px-3 py-1 tracking-wider">Phân khu</h4>
                  {filteredResults.areas.map(area => (
                    <div 
                      key={`area-${area.id}`} 
                      onClick={() => handleSelectArea(area.id)}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-green-50 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="p-2 bg-green-100 text-brand-green rounded-lg">
                        <Sprout size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{area.name}</p>
                        <p className="text-xs text-gray-500">{area.description || 'Không có mô tả'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Kết quả: Thiết bị */}
              {filteredResults.devices.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase px-3 py-1 tracking-wider">Thiết bị</h4>
                  {filteredResults.devices.map(device => (
                    <div 
                      key={`device-${device.id}`} 
                      onClick={() => handleSelectDevice(device.area_name)}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <Cpu size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-800">{device.device_name}</p>
                        <p className="text-xs text-gray-500">Khu vực: {device.area_name}</p>
                      </div>
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-bold",
                        device.mode === 'ON' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      )}>
                        {device.mode}
                      </span>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}
        </div>
      )}
    </div>
  );
};