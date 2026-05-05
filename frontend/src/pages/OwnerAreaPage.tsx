import React, { useState, useEffect, useMemo } from 'react';
import { 
  Map, Cpu, RefreshCw, X, Save, 
  Thermometer, Droplets, Sun, Wind, Settings, Sprout
} from 'lucide-react';
import axios from 'axios';

import { areaApi, type AreaData } from '../features/dashboard/api/areaApi';
import { fetchDevices } from '../features/device/api/deviceApi';
import { thresholdApi, type ThresholdData } from '../features/threshold/api/thresholdApi';
import { cn } from '../utils';

interface DeviceData {
  id: number;
  device_name: string;
  type: string;
  status: boolean | number;
  area_id: number;
  area_name: string;
}

const SENSOR_TYPES = [
  { id: 'temp', label: 'Nhiệt độ', icon: <Thermometer className="text-red-500" />, unit: '°C' },
  { id: 'light', label: 'Ánh sáng', icon: <Sun className="text-orange-500" />, unit: '%' },
  { id: 'moisture', label: 'Độ ẩm KK', icon: <Droplets className="text-blue-500" />, unit: '%' },
  { id: 'soil_moisture', label: 'Độ ẩm đất', icon: <Sprout className="text-emerald-500" />, unit: '%' },
];

export const OwnerAreaPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  
  const [areas, setAreas] = useState<AreaData[]>([]);
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);

  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);
  const [loadingThresholds, setLoadingThresholds] = useState(false);
  const [savingThresholds, setSavingThresholds] = useState(false);
  const [thresholds, setThresholds] = useState<Record<string, { min: string; max: string }>>({
    temp: { min: '', max: '' },
    light: { min: '', max: '' },
    moisture: { min: '', max: '' },
    soil_moisture: { min: '', max: '' }
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [areasRes, devicesRes] = await Promise.all([
        areaApi.getAll(),
        fetchDevices()
      ]);
      
      setAreas(areasRes);
      setDevices(devicesRes);
      
      if (areasRes.length > 0 && !selectedAreaId) {
        setSelectedAreaId(areasRes[0].id);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const currentAreaDevices = useMemo(() => {
    if (!selectedAreaId) return [];
    return devices.filter(d => d.area_id === selectedAreaId);
  }, [devices, selectedAreaId]);

  const handleOpenThresholdModal = async () => {
    if (!selectedAreaId) return;
    setIsThresholdModalOpen(true);
    setLoadingThresholds(true);
    
    try {
      const data = await thresholdApi.getAreaThresholds(selectedAreaId);
      const newState: Record<string, { min: string; max: string }> = {
        temp: { min: '', max: '' },
        light: { min: '', max: '' },
        moisture: { min: '', max: '' },
        soil_moisture: { min: '', max: '' }
      };

      data.forEach((t: ThresholdData) => {
        if (newState[t.sensor_type]) {
          newState[t.sensor_type] = {
            min: t.min_value !== null ? t.min_value.toString() : '',
            max: t.max_value !== null ? t.max_value.toString() : ''
          };
        }
      });
      setThresholds(newState);
    } catch (error) {
      console.error("Lỗi tải ngưỡng:", error);
    } finally {
      setLoadingThresholds(false);
    }
  };

  const handleSaveThresholds = async () => {
    if (!selectedAreaId) return;
    setSavingThresholds(true);
    try {
      const savePromises = SENSOR_TYPES.map(sensor => {
        const data = thresholds[sensor.id];
        if (data.min === '' && data.max === '') return Promise.resolve();
        return thresholdApi.saveThreshold({
          area_id: selectedAreaId,
          sensor_type: sensor.id,
          min_value: data.min !== '' ? parseFloat(data.min) : null,
          max_value: data.max !== '' ? parseFloat(data.max) : null
        });
      });

      await Promise.all(savePromises);
      alert("Đã lưu cấu hình ngưỡng thành công!");
      setIsThresholdModalOpen(false);
    } catch (error) {
      console.error("Lỗi khi lưu ngưỡng:", error);
      alert( axios.isAxiosError(error) ? error.response?.data?.error : "Đã xảy ra lỗi khi lưu cấu hình!");
    } finally {
      setSavingThresholds(false);
    }
  };

  const handleThresholdChange = (sensorId: string, field: 'min' | 'max', value: string) => {
    setThresholds(prev => ({ ...prev, [sensorId]: { ...prev[sensorId], [field]: value } }));
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'pump': return <Droplets className="text-blue-500" />;
      case 'light': return <Sun className="text-orange-500" />;
      case 'fan': return <Wind className="text-teal-500" />;
      case 'sensor': return <Thermometer className="text-purple-500" />;
      default: return <Cpu className="text-gray-500" />;
    }
  };

  return (
    <div className="p-8 flex-1 flex flex-col gap-6 bg-gray-50 overflow-hidden h-full relative">
      
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-brand-green uppercase">Khu vực của tôi</h2>
          <p className="text-gray-500 mt-1">Giám sát thiết bị và cấu hình tự động hóa</p>
        </div>
        <button onClick={loadData} className="p-2.5 bg-white border border-gray-200 rounded-xl text-brand-green hover:bg-gray-100 shadow-sm transition-colors cursor-pointer">
          <RefreshCw size={20} className={cn(loading && "animate-spin")} />
        </button>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        <div className="w-1/3 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center gap-2 shrink-0">
            <Map size={18} className="text-gray-700" />
            <h3 className="font-bold text-gray-800">Danh sách Phân khu</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
            {areas.length === 0 ? (
              <div className="text-center mt-10">
                <p className="text-gray-400 text-sm">Bạn chưa được phân quyền quản lý khu vực nào.</p>
                <p className="text-gray-400 text-sm mt-1">Vui lòng liên hệ Admin hệ thống.</p>
              </div>
            ) : (
              areas.map(area => (
                <div 
                  key={area.id} onClick={() => setSelectedAreaId(area.id)}
                  className={cn("p-4 rounded-xl border-2 cursor-pointer transition-all", selectedAreaId === area.id ? "border-brand-green bg-green-50" : "border-transparent bg-gray-50 hover:bg-gray-100")}
                >
                  <p className={cn("font-bold text-base", selectedAreaId === area.id ? "text-brand-green" : "text-gray-800")}>{area.name}</p>
                  <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{area.description || 'Chưa có mô tả'}</p>
                </div>
              ))
            )}
          </div>
        </div>


        <div className="w-2/3 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          {!selectedAreaId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <Map size={48} className="mb-4 text-gray-300" />
              <p className="font-semibold text-lg">Chưa chọn khu vực</p>
            </div>
          ) : (
            <>
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Giám sát & Điều khiển</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Đang xem: <span className="font-bold text-brand-green">{areas.find(a => a.id === selectedAreaId)?.name}</span>
                  </p>
                </div>
                
                <button 
                  onClick={handleOpenThresholdModal}
                  className="flex items-center gap-2 bg-brand-green text-white px-5 py-2.5 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-sm cursor-pointer"
                >
                  <Settings size={18} /> Thiết lập Ngưỡng tự động
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {currentAreaDevices.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Cpu size={48} className="mb-4 text-gray-200" />
                    <p className="font-semibold">Khu vực này chưa lắp đặt thiết bị nào</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentAreaDevices.map(device => (
                      <div key={device.id} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center border border-gray-100">
                            {getDeviceIcon(device.type)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{device.device_name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-semibold text-gray-500 uppercase">{device.type}</span>
                              <span className="text-gray-300">•</span>
                              <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase", device.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                                {device.status ? 'Hoạt động' : 'Mất kết nối'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {isThresholdModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-brand-green">
              <div className="flex items-center gap-2 text-white">
                <Settings size={20} />
                <h3 className="font-bold">
                  Cấu hình ngưỡng - {areas.find(a => a.id === selectedAreaId)?.name}
                </h3>
              </div>
              <button onClick={() => setIsThresholdModalOpen(false)} className="text-white/70 hover:text-white cursor-pointer"><X size={20} /></button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar bg-gray-50">
              {loadingThresholds ? (
                <div className="flex justify-center p-8"><RefreshCw className="animate-spin text-brand-green" /></div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {SENSOR_TYPES.map(sensor => (
                    <div key={sensor.id} className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus-within:border-brand-green transition-colors">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-gray-50 border border-gray-100 rounded-lg">{sensor.icon}</div>
                        <h4 className="font-bold text-gray-700 text-sm">{sensor.label}</h4>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Ngưỡng dưới (Min)</label>
                          <div className="relative">
                            <input 
                              type="number" step="0.1" placeholder="Trống"
                              value={thresholds[sensor.id].min}
                              onChange={e => handleThresholdChange(sensor.id, 'min', e.target.value)}
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green text-sm font-bold text-gray-700"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold">{sensor.unit}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Ngưỡng trên (Max)</label>
                          <div className="relative">
                            <input 
                              type="number" step="0.1" placeholder="Trống"
                              value={thresholds[sensor.id].max}
                              onChange={e => handleThresholdChange(sensor.id, 'max', e.target.value)}
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-green text-sm font-bold text-gray-700"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold">{sensor.unit}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-5 border-t border-gray-100 bg-white flex justify-end gap-3">
              <button onClick={() => setIsThresholdModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors">Hủy bỏ</button>
              <button 
                onClick={handleSaveThresholds} disabled={savingThresholds || loadingThresholds}
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-brand-green hover:bg-green-700 flex items-center gap-2 disabled:opacity-70 cursor-pointer transition-colors"
              >
                {savingThresholds ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                Lưu cấu hình
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};