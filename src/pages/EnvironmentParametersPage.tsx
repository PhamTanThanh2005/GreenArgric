// src/pages/EnvironmentParametersPage.tsx

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Thermometer, Droplets, Sprout, Sun, ChevronDown, RefreshCw } from 'lucide-react';

// Import Components của bạn
import { ZoneBannerCard } from '../features/dashboard/components/ZoneBannerCard';
import { ChartCard } from '../features/dashboard/components/ChartCard';
import { SensorCard } from '../features/dashboard/components/SensorCard'; 

// Import APIs
import { areaApi, type AreaData } from '../features/dashboard/api/areaApi';
import { sensorApi } from '../features/dashboard/api/sensorApi';
import { cn } from '../utils';

// Import hình ảnh minh họa cho SensorCard
import imgTemp from '../assets/sensors/temp.png';
import imgSoil from '../assets/sensors/soil.png';
import imgHumid from '../assets/sensors/humid.png';
import imgLight from '../assets/sensors/light.png';

export const EnvironmentParametersPage: React.FC = () => {
  const [areas, setAreas] = useState<AreaData[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [sensorValues, setSensorValues] = useState({
    temp: '--',
    soil_moisture: '--',
    moisture: '--',
    light: '--'
  });

  // Mock data cho Biểu đồ
  const mockChartData = [
    { time: '08:00', temp: 22 }, { time: '10:00', temp: 25 },
    { time: '12:00', temp: 32 }, { time: '14:00', temp: 35 },
    { time: '16:00', temp: 30 }, { time: '18:00', temp: 26 },
  ];

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const data = await areaApi.getAll();
        setAreas(data);
        if (data.length > 0) setSelectedAreaId(data[0].id);
      } catch (error) {
        console.error("Lỗi tải danh sách khu vực:", error);
      }
    };
    fetchAreas();
  }, []);

  useEffect(() => {
    if (!selectedAreaId) return;

    const fetchSensorData = async () => {
      try {
        setLoading(true);
        const data = await sensorApi.getLatestByArea(selectedAreaId.toString());

        const newValues = { temp: '--', soil_moisture: '--', moisture: '--', light: '--' };

        if (data && data.length > 0) {
          data.forEach(sensor => {
            if (sensor.type === 'temp') newValues.temp = sensor.value.toString();
            if (sensor.type === 'soil_moisture') newValues.soil_moisture = sensor.value.toString();
            if (sensor.type === 'moisture') newValues.moisture = sensor.value.toString();
            if (sensor.type === 'light') newValues.light = sensor.value.toString();
          });
        }
        setSensorValues(newValues);
      } catch (error) {
        console.error("Lỗi tải dữ liệu sensor:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSensorData();
    const intervalId = setInterval(fetchSensorData, 5000);
    return () => clearInterval(intervalId);
  }, [selectedAreaId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentArea = areas.find(a => a.id === selectedAreaId);

  return (
    <div className="bg-white rounded-tl-[40px] p-8 flex-1 overflow-y-auto h-full shadow-inner">

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 relative">
        
        {/* TIÊU ĐỀ */}
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-brand-green uppercase">
            Thông số môi trường
          </h1>
          {loading && <RefreshCw className="w-5 h-5 text-brand-green animate-spin" />}
        </div>

        {/* DROPDOWN CHỌN KHU VỰC */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 px-5 py-2.5 bg-white border-2 border-brand-green/20 rounded-xl text-brand-green font-bold shadow-sm hover:bg-brand-green/5 transition-all"
          >
            <MapPin size={20} className="text-brand-green" />
            <span className="min-w-30 text-left">
              {currentArea ? currentArea.name : 'Đang tải khu vực...'}
            </span>
            <ChevronDown
              size={18}
              className={cn("transition-transform duration-300", isDropdownOpen && "rotate-180")}
            />
          </button>

          {/* Menu thả xuống */}
          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-full min-w-[220px] bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 max-h-64 overflow-y-auto">
              <div className="px-4 py-2 border-b border-gray-50 mb-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Danh sách khu vực</p>
              </div>

              {areas.length === 0 ? (
                <p className="px-4 py-3 text-sm text-gray-500 text-center">Không có dữ liệu</p>
              ) : (
                areas.map((area) => (
                  <button
                    key={area.id}
                    onClick={() => {
                      setSelectedAreaId(area.id);
                      setIsDropdownOpen(false); // Chọn xong thì đóng menu
                    }}
                    className={cn(
                      "w-full text-left px-4 py-3 text-sm font-medium transition-colors hover:bg-brand-green/5 flex items-center justify-between",
                      selectedAreaId === area.id ? "text-brand-green bg-brand-green/10" : "text-gray-700"
                    )}
                  >
                    <span>{area.name}</span>
                    {selectedAreaId === area.id && (
                      <div className="w-2 h-2 rounded-full bg-brand-green"></div>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mb-8">
        <ZoneBannerCard
          zoneName={currentArea?.name || 'Đang tải...'}
          cropType={currentArea?.description || 'Chưa cập nhật loại cây'}
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        
        {/* KHỐI BÊN TRÁI */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Lưới 4 cảm biến */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <SensorCard title="Nhiệt độ" value={sensorValues.temp} unit="°C" icon={Thermometer} imageSrc={imgTemp} valueColor="text-brand-red" />
            <SensorCard title="Độ ẩm đất" value={sensorValues.soil_moisture} unit="%" icon={Sprout} imageSrc={imgSoil} valueColor="text-brand-red" />
            <SensorCard title="Độ ẩm" value={sensorValues.moisture} unit="%" icon={Droplets} imageSrc={imgHumid} valueColor="text-brand-red" />
            <SensorCard title="Ánh sáng" value={sensorValues.light} unit="%" icon={Sun} imageSrc={imgLight} valueColor="text-brand-red" />
          </div>

          {/* Biểu đồ */}
          <ChartCard
            title="Biến thiên Nhiệt độ (24h)"
            type="area"
            data={mockChartData}
            dataKeyX="time"
            dataKeyY="temp"
            chartColor="#0f4a27"
          />
        </div>

        {/* KHỐI BÊN PHẢI */}
        <div className="lg:col-span-1 flex flex-col">
          <div className="bg-[#f0f9f1] border-2 border-brand-green/30 rounded-xl p-6 flex flex-col h-full shadow-sm">
            <h3 className="text-xl font-bold text-brand-green mb-4">Đánh giá môi trường</h3>
            
            <div className="text-gray-700 leading-relaxed mb-4 flex-1">
              <p className="mb-3">
                Nhiệt độ hiện tại đang ở mức <span className="font-bold text-red-500">35°C</span> (Cao hơn mức lý tưởng).
              </p>
              <p className="mb-3">
                Hệ thống đã tự động bật máy bơm tưới phun sương để giảm nhiệt. Độ ẩm đất ở mức ổn định.
              </p>
              <p className="text-sm text-gray-500 italic mt-6 border-t border-brand-green/20 pt-4">
                * Khuyến nghị: Kéo rèm che nắng góc 45 độ để hạn chế bức xạ trực tiếp.
              </p>
            </div>

            <button className="bg-brand-green text-white font-bold py-3 px-4 rounded-xl w-full hover:bg-green-800 transition mt-auto shadow-md">
              Điều chỉnh ngay
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};