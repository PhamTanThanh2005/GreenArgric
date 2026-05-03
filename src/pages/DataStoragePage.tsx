import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, MapPin, ChevronDown, Clock, Activity } from 'lucide-react';
import { areaApi, type AreaData } from '../features/dashboard/api/areaApi';
import { sensorApi, type SensorHistoryData } from '../features/dashboard/api/sensorApi';
import { activityApi, type ActivityLog } from '../features/dashboard/api/activityApi';
import { EnvHistoryChart } from '../components/Charts/EnvHistoryChart';
import { DeviceHistoryChart } from '../components/Charts/DeviceHistoryChart';
import { DeviceDurationChart } from '../components/Charts/DeviceDurationChart';
import { cn } from '../utils';

import envBg from '../assets/storage/env.png'; 
import deviceBg from '../assets/storage/dev.png'; 

type TabType = 'environment' | 'device' | null;
type DeviceViewMode = 'frequency' | 'duration'; 

interface ChartDevice {
  id: number;
  name: string;
  type: string;
  data: Array<{ name: string; autoOn: number; manualOn: number; off: number; durationHours: number }>;
}

export const DataStoragePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('environment');

  const [deviceViewMode, setDeviceViewMode] = useState<DeviceViewMode>('frequency'); 
  
  const [areas, setAreas] = useState<AreaData[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [envData, setEnvData] = useState({ temp: [], soil_moisture: [], moisture: [], light: [] });
  const [isEnvLoading, setIsEnvLoading] = useState(false);

  const [devicesData, setDevicesData] = useState<ChartDevice[]>([]);
  const [isDeviceLoading, setIsDeviceLoading] = useState(false);

  // Lấy danh sách khu vực
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const data = await areaApi.getAll();
        setAreas(data);
        if (data.length > 0) setSelectedAreaId(data[0].id);
      } catch (error) {
        console.error("Lỗi lấy khu vực", error);
      }
    };
    fetchAreas();
  }, []);

  const currentArea = areas.find(a => a.id === selectedAreaId);

  // FETCH MÔI TRƯỜNG
  useEffect(() => {
    if (activeTab !== 'environment' || !selectedAreaId) return;
    const fetchAllEnvData = async () => {
      setIsEnvLoading(true);
      try {
        const types = ['temp', 'soil_moisture', 'moisture', 'light'];
        const results = await Promise.all(types.map(type => sensorApi.getHistoryByAreaAndType(selectedAreaId.toString(), type)));
        const formatData = (data: SensorHistoryData[]) => data.map(item => ({
          time: new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), value: item.value
        })).reverse();
        setEnvData({ temp: formatData(results[0]) as any, soil_moisture: formatData(results[1]) as any, moisture: formatData(results[2]) as any, light: formatData(results[3]) as any });
      } catch (error) { console.error(error); } finally { setIsEnvLoading(false); }
    };
    fetchAllEnvData();
  }, [selectedAreaId, activeTab]);

  // FETCH & BIẾN ĐỔI DỮ LIỆU THIẾT BỊ
  useEffect(() => {
    if (activeTab !== 'device' || !currentArea) return;

    const fetchDeviceActivity = async () => {
      setIsDeviceLoading(true);
      try {
        const logs = await activityApi.getAll(); 
        const areaLogs = logs.filter(log => log.area_name === currentArea.name);

        const devicesMap = new Map<number, { name: string, type: string, logs: ActivityLog[] }>();
        areaLogs.forEach(log => {
          if (!devicesMap.has(log.device_id)) devicesMap.set(log.device_id, { name: log.device_name, type: log.device_type, logs: [] });
          devicesMap.get(log.device_id)!.logs.push(log);
        });

        const parsedDevicesData: ChartDevice[] = Array.from(devicesMap.entries()).map(([id, device]) => {
          
          const monthlyData: Record<string, { name: string, autoOn: number, manualOn: number, off: number, durationHours: number }> = {};
          
          const sortedLogs = device.logs.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
          
          let lastOnTime: Date | null = null;

          sortedLogs.forEach(log => {
            const date = new Date(log.time);
            const month = date.toLocaleString('en-US', { month: 'short' });
            
            if (!monthlyData[month]) {
              monthlyData[month] = { name: month, autoOn: 0, manualOn: 0, off: 0, durationHours: 0 };
            }

            // Tính toán Tần suất 
            if (log.mode === 'ON' && log.source === 'auto') monthlyData[month].autoOn += 1;
            else if (log.mode === 'ON' && log.source === 'manual') monthlyData[month].manualOn += 1;
            else monthlyData[month].off += 1; 

            // Tính toán Thời gian
            if (log.mode === 'ON') {
              if (!lastOnTime) lastOnTime = date;
            } else if (log.mode === 'OFF') {
              if (lastOnTime) {
                const durationMs = date.getTime() - lastOnTime.getTime();
                const durationHours = durationMs / (1000 * 60 * 60); 
                monthlyData[month].durationHours += durationHours;
                lastOnTime = null;
              }
            }
          });

          Object.values(monthlyData).forEach(m => { m.durationHours = Number(m.durationHours.toFixed(2)); });

          const monthsOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const sortedChartData = Object.values(monthlyData).sort((a, b) => monthsOrder.indexOf(a.name) - monthsOrder.indexOf(b.name));

          return { id, name: device.name, type: device.type, data: sortedChartData };
        });

        setDevicesData(parsedDevicesData);
      } catch (error) { console.error(error); } finally { setIsDeviceLoading(false); }
    };

    fetchDeviceActivity();
  }, [activeTab, currentArea]);

  const handleDownload = (filename: string) => alert(`Chức năng xuất File CSV cho ${filename} sẽ cập nhật sau!`);

  const getDeviceColors = (type: string) => {
    if (type === 'light') return ["#0ea5e9", "#3b82f6", "#e0f2fe"]; 
    return ["#16a34a", "#86efac", "#fee2e2"]; 
  };

  return (
    <div className="bg-white rounded-tl-[40px] p-8 flex-1 overflow-y-auto h-full shadow-inner relative">
      
      <div className="flex justify-between items-center mb-8 relative z-20">
        <h1 className="text-3xl font-bold text-brand-green uppercase">Dữ liệu lưu trữ</h1>
        <div className="relative">
          <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-brand-green font-semibold shadow-sm hover:bg-gray-50">
            <MapPin size={18} /><span>{currentArea ? currentArea.name : 'Đang tải...'}</span><ChevronDown size={16} className={cn("transition-transform", isDropdownOpen && "rotate-180")} />
          </button>
          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50">
              {areas.map((area) => (
                <button key={area.id} onClick={() => { setSelectedAreaId(area.id); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-brand-green/10 text-gray-700">{area.name}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6 mb-8">
        <div onClick={() => setActiveTab('environment')} className={cn("relative w-full h-40 md:h-48 rounded-3xl overflow-hidden cursor-pointer transition-all", activeTab !== 'environment' && "opacity-60 scale-[0.98]")}>
          <img src={envBg} alt="Môi trường" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/20 flex items-center p-8"><h2 className="text-white text-5xl md:text-7xl font-extrabold tracking-tight">Môi trường</h2></div>
        </div>
        <div onClick={() => setActiveTab('device')} className={cn("relative w-full h-40 md:h-48 rounded-3xl overflow-hidden cursor-pointer transition-all", activeTab !== 'device' && "opacity-60 scale-[0.98]")}>
          <img src={deviceBg} alt="Thiết bị" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/20 flex items-center p-8"><h2 className="text-white text-5xl md:text-7xl font-extrabold tracking-tight">Thiết bị</h2></div>
        </div>
      </div>

      {activeTab === 'environment' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
          <ChartBox title="Nhiệt độ" data={envData.temp} color="#16a34a" isLoading={isEnvLoading} onDownload={() => handleDownload('Nhiet_do')} />
          <ChartBox title="Độ ẩm đất" data={envData.soil_moisture} color="#dc2626" isLoading={isEnvLoading} onDownload={() => handleDownload('Do_am_dat')} />
          <ChartBox title="Độ ẩm" data={envData.moisture} color="#dc2626" isLoading={isEnvLoading} onDownload={() => handleDownload('Do_am')} />
          <ChartBox title="Ánh sáng" data={envData.light} color="#2563eb" isLoading={isEnvLoading} onDownload={() => handleDownload('Anh_sang')} />
        </div>
      )}

      {/* CONTENT TAB THIẾT BỊ CÓ TOGGLE */}
      {activeTab === 'device' && (
        <div className="animate-in fade-in duration-500">
          
          {/* Thanh Toggle Góc Nhìn */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 p-1 rounded-xl flex items-center shadow-inner">
              <button 
                onClick={() => setDeviceViewMode('frequency')}
                className={cn("flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all", deviceViewMode === 'frequency' ? "bg-white text-brand-green shadow-sm" : "text-gray-500 hover:text-gray-700")}
              >
                <Activity size={18} /> Số lần hoạt động
              </button>
              <button 
                onClick={() => setDeviceViewMode('duration')}
                className={cn("flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all", deviceViewMode === 'duration' ? "bg-white text-orange-500 shadow-sm" : "text-gray-500 hover:text-gray-700")}
              >
                <Clock size={18} /> Tổng thời gian (Giờ)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isDeviceLoading ? (
              <div className="col-span-2 flex justify-center items-center py-12"><RefreshCw className="animate-spin text-brand-green w-8 h-8" /></div>
            ) : devicesData.length === 0 ? (
              <div className="col-span-2 text-center text-gray-400 py-12">Khu vực này chưa có thiết bị hoặc chưa có lịch sử hoạt động.</div>
            ) : (
              devicesData.map((device) => (
                <div key={device.id} className="bg-[#1a5b32] p-4 rounded-3xl">
                  <div className="bg-white rounded-2xl p-6 h-80 flex flex-col relative">
                    <h3 className="text-xl font-bold text-[#1a5b32] text-center mb-2 uppercase tracking-wider">
                      {device.name}
                    </h3>
                    <div className="flex-1 w-full mt-2">
                      {/* RENDER DỰA THEO TOGGLE */}
                      {deviceViewMode === 'frequency' ? (
                        <DeviceHistoryChart data={device.data} colors={getDeviceColors(device.type)} />
                      ) : (
                        <DeviceDurationChart data={device.data} color={device.type === 'light' ? '#3b82f6' : '#f59e0b'} />
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Component ChartBox giữ nguyên
const ChartBox = ({ title, data, color, isLoading, onDownload }: { title: string, data: Record<string, string | number>[], color: string, isLoading: boolean, onDownload: () => void }) => (
  <div className="bg-[#e8efe9] rounded-3xl p-6 relative flex flex-col h-72 border border-brand-green/10">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-2xl font-bold text-[#b91c1c]">{title}</h3>
      <button onClick={onDownload} className="bg-[#1a5b32] p-2 rounded-full text-white hover:bg-green-800 transition"><Download size={18} strokeWidth={2.5} /></button>
    </div>
    <div className="flex-1 w-full relative">
      {isLoading ? <div className="absolute inset-0 flex justify-center items-center"><RefreshCw className="animate-spin text-brand-green" /></div> : data.length === 0 ? <div className="absolute inset-0 flex justify-center items-center text-gray-400 font-medium">Chưa có dữ liệu</div> : <EnvHistoryChart data={data} dataKeyX="time" dataKeyY="value" color={color} />}
    </div>
  </div>
);