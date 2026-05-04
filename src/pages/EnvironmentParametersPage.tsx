// src/pages/EnvironmentParametersPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Thermometer, Droplets, Sprout, Sun, ChevronDown, RefreshCw } from 'lucide-react';

import { ZoneBannerCard } from '../features/dashboard/components/ZoneBannerCard';
import { ChartCard } from '../components/Charts/ChartCard';
import { EnvHistoryChart } from '../components/Charts/EnvHistoryChart';
import { SensorCard } from '../features/dashboard/components/SensorCard';

import { areaApi, type AreaData } from '../features/dashboard/api/areaApi';
import { sensorApi, type LatestSensorData, type SensorHistoryData } from '../features/dashboard/api/sensorApi';
import { cn } from '../utils';

import imgTemp from '../assets/sensors/temp.png';
import imgSoil from '../assets/sensors/soil.png';
import imgHumid from '../assets/sensors/humid.png';
import imgLight from '../assets/sensors/light.png';

const CHART_TABS = [
  { id: 'temp', label: 'Nhiệt độ', color: '#c22026', unit: '°C' },
  { id: 'soil_moisture', label: 'Độ ẩm đất', color: '#d97706', unit: '%' },
  { id: 'moisture', label: 'Độ ẩm', color: '#0284c7', unit: '%' },
  { id: 'light', label: 'Ánh sáng', color: '#eab308', unit: 'lux' },
];

export const EnvironmentParametersPage: React.FC = () => {
  const [areas, setAreas] = useState<AreaData[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);

  const [chartType, setChartType] = useState(CHART_TABS[0].id);
  const [chartData, setChartData] = useState<{ time: string; value: number }[]>([]);
  const [isChartLoading, setIsChartLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [sensorValues, setSensorValues] = useState({
    temp: '--',
    soil_moisture: '--',
    moisture: '--',
    light: '--'
  });

  useEffect(() => {
    const fetchAreas = async () => {
      const data = await areaApi.getAll();
      setAreas(data);
      if (data.length > 0) setSelectedAreaId(data[0].id);
    };
    fetchAreas();
  }, []);

  useEffect(() => {
    if (!selectedAreaId) return;

    const fetchSensorData = async () => {
      setLoading(true);
      try {
        const data: LatestSensorData[] = await sensorApi.getLatestByArea(selectedAreaId.toString());

        const newValues = { temp: '--', soil_moisture: '--', moisture: '--', light: '--' };

        if (data && data.length > 0) {
          data.forEach((sensor) => {
            // CÁCH SỬA LỖI hasOwnProperty: Dùng Object.prototype.hasOwnProperty.call
            if (Object.prototype.hasOwnProperty.call(newValues, sensor.type)) {
              newValues[sensor.type as keyof typeof newValues] = sensor.value.toString();
            }
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
    if (!selectedAreaId) return;

    const fetchChartData = async () => {
      setIsChartLoading(true);
      try {
        const rawData: SensorHistoryData[] = await sensorApi.getHistoryByAreaAndType(
          selectedAreaId.toString(),
          chartType
        );

        const formattedData = rawData
          .map((item) => {
          const dateObj = new Date(item.time);
          const hours = dateObj.getUTCHours().toString().padStart(2, '0');
          const minutes = dateObj.getUTCMinutes().toString().padStart(2, '0');
          return {
            time: `${hours}:${minutes}`,
            value: item.value
          };
        });

        setChartData(formattedData.reverse());
      } catch (error) {
        console.error("Lỗi format chart data:", error);
      } finally {
        setIsChartLoading(false);
      }
    };

    fetchChartData();
  }, [selectedAreaId, chartType]);

  const currentArea = areas.find(a => a.id === selectedAreaId);
  const activeChartConfig = CHART_TABS.find(t => t.id === chartType) || CHART_TABS[0];

  return (
    <div className="bg-white rounded-tl-[40px] p-8 flex-1 overflow-y-auto h-full shadow-inner">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 relative">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-brand-green uppercase">
            Thông số môi trường
          </h1>
          {loading && <RefreshCw className="w-5 h-5 text-brand-green animate-spin" />}
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 px-5 py-2.5 bg-white border-2 border-brand-green/20 rounded-xl text-brand-green font-bold shadow-sm hover:bg-brand-green/5 transition-all"
          >
            <MapPin size={20} className="text-brand-green" />
            <span className="min-w-30 text-left">
              {currentArea ? currentArea.name : 'Đang tải khu vực...'}
            </span>
            <ChevronDown size={18} className={cn("transition-transform duration-300", isDropdownOpen && "rotate-180")} />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-full min-w-55 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 max-h-64 overflow-y-auto">
              {areas.map((area) => (
                <button
                  key={area.id}
                  onClick={() => { setSelectedAreaId(area.id); setIsDropdownOpen(false); }}
                  className={cn(
                    "w-full text-left px-4 py-3 text-sm font-medium transition-colors hover:bg-brand-green/5 flex items-center justify-between",
                    selectedAreaId === area.id ? "text-brand-green bg-brand-green/10" : "text-gray-700"
                  )}
                >
                  <span>{area.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mb-8">
        <ZoneBannerCard zoneName={currentArea?.name || 'Đang tải...'} cropType={currentArea?.description || '...'} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 flex flex-col">
          <div className="grid grid-cols-2 gap-6 mb-8">
            <SensorCard title="Nhiệt độ" value={sensorValues.temp} unit="°C" icon={Thermometer} imageSrc={imgTemp} valueColor="text-brand-red" />
            <SensorCard title="Độ ẩm đất" value={sensorValues.soil_moisture} unit="%" icon={Sprout} imageSrc={imgSoil} valueColor="text-brand-red" />
            <SensorCard title="Độ ẩm" value={sensorValues.moisture} unit="%" icon={Droplets} imageSrc={imgHumid} valueColor="text-brand-red" />
            <SensorCard title="Ánh sáng" value={sensorValues.light} unit="%" icon={Sun} imageSrc={imgLight} valueColor="text-brand-red" />
          </div>

          <ChartCard title={`Lịch sử ${activeChartConfig.label}`}>
            <div className="flex gap-2 mb-4 border-b border-gray-100 pb-2 overflow-x-auto hide-scrollbar">
              {CHART_TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setChartType(tab.id)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap",
                    chartType === tab.id
                      ? "bg-brand-green text-white shadow-sm"
                      : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                  )}
                >
                  {tab.label}
                </button>
              ))}
              {isChartLoading && <RefreshCw size={18} className="animate-spin text-gray-400 ml-auto my-auto" />}
            </div>

            <div className="w-full h-70">
              {chartData.length > 0 ? (
                <EnvHistoryChart
                  data={chartData}
                  dataKeyX="time"
                  dataKeyY="value"
                  color={activeChartConfig.color}
                  unit={activeChartConfig.unit}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400">
                  {isChartLoading ? 'Đang tải dữ liệu...' : 'Chưa có dữ liệu lịch sử cho khu vực này.'}
                </div>
              )}
            </div>

          </ChartCard>
        </div>

        <div className="col-span-1 flex flex-col">
          <div className="bg-[#f0f9f1] border-2 border-brand-green/30 rounded-xl p-6 flex flex-col h-full shadow-sm">
            <h3 className="text-xl font-bold text-brand-green mb-4">Đánh giá môi trường</h3>
            <div className="text-gray-700 leading-relaxed mb-4 flex-1">
              <p className="mb-3">
                Nhiệt độ hiện tại đang ở mức <span className="font-bold text-red-500">{sensorValues.temp}°C</span>.
              </p>
              <p className="mb-3">
                Hệ thống đã phân tích và tự động kích hoạt máy bơm nước để tối ưu độ ẩm đất.
              </p>
              <p className="text-sm text-gray-500 italic mt-6 border-t border-brand-green/20 pt-4">
                * Khuyến nghị: Giữ rèm che mở 100% để đón ánh sáng lúc 14:00.
              </p>
            </div>
            <button className="bg-brand-green text-white font-bold py-3 px-4 rounded-xl w-full hover:bg-green-800 transition mt-auto shadow-md">
              Thiết lập tự động
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};