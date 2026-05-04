import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ThermometerSun, Sprout, Droplets, Sun, ArrowLeft, RefreshCw, Cpu, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StatCard } from '../features/dashboard/components/StatCard';
import { ZoneBannerCard } from '../features/dashboard/components/ZoneBannerCard';

import { areaApi, type AreaData } from '../features/dashboard/api/areaApi';
import { sensorApi } from '../features/dashboard/api/sensorApi';
import { activityApi, type ActivityLog } from '../features/dashboard/api/activityApi';
import { fetchDevices } from '../features/device/api/deviceApi';

interface DeviceData {
  id: number;
  device_name: string;
  type: string;
  status: number;
  area_name: string;
  mode: 'ON' | 'OFF';
  last_updated: string;
}

interface ChartData {
  time: string;
  temp: number;
}

interface ZoneState {
  areaInfo: AreaData;
  sensors: { temp: string; soil: string; humid: string; light: string };
  devices: DeviceData[];
  logs: ActivityLog[];
  history: ChartData[];
}

export const ZoneDashboardPage: React.FC = () => {
  const { zoneId } = useParams<{ zoneId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);

  const [data, setData] = useState<ZoneState>({
    areaInfo: { id: 0, name: 'Đang tải...', description: '...' },
    sensors: { temp: '--', soil: '--', humid: '--', light: '--' },
    devices: [],
    logs: [],
    history: []
  });

  const loadZoneData = async () => {
    if (!zoneId) return;
    setLoading(true);

    try {
      const [areas, latestSensors, allDevicesRaw, allLogs, tempHistory] = await Promise.all([
        areaApi.getAll(),
        sensorApi.getLatestByArea(zoneId),
        fetchDevices(),
        activityApi.getAll(),
        sensorApi.getHistoryByAreaAndType(zoneId, 'temp').catch(() => []) // Catch lỗi nếu chưa có lịch sử
      ]);

      const currentArea = areas.find(a => a.id.toString() === zoneId);
      if (!currentArea) throw new Error("Không tìm thấy khu vực");

      const allDevices = allDevicesRaw as DeviceData[];
      const zoneDevices = allDevices.filter(d => d.area_name === currentArea.name);
      const zoneLogs = allLogs.filter(l => l.area_name === currentArea.name).slice(0, 5);

      let temp = '--', soil = '--', humid = '--', light = '--';
      latestSensors.forEach(s => {
        if (s.type === 'temp') temp = s.value.toString();
        if (s.type === 'soil_moisture') soil = s.value.toString();
        if (s.type === 'moisture' || s.type === 'humidity') humid = s.value.toString();
        if (s.type === 'light') light = s.value.toString();
      });

      const chartData: ChartData[] = tempHistory.map(h => ({
        time: new Date(h.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        temp: h.value
      })).slice(0, 15);

      setData({
        areaInfo: currentArea,
        sensors: { temp, soil, humid, light },
        devices: zoneDevices,
        logs: zoneLogs,
        history: chartData
      });

    } catch (error) {
      console.error(`Lỗi tải dữ liệu Zone ${zoneId}:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadZoneData();
    const intervalId = setInterval(loadZoneData, 10000);
    return () => clearInterval(intervalId);
  }, [zoneId]);

  const { areaInfo, sensors, devices, logs, history } = data;

  const sensorCards = [
    { icon: ThermometerSun, label: "Nhiệt độ", value: sensors.temp, unit: "°C" },
    { icon: Sprout, label: "Độ ẩm đất", value: sensors.soil, unit: "%" },
    { icon: Droplets, label: "Độ ẩm KK", value: sensors.humid, unit: "%" },
    { icon: Sun, label: "Ánh sáng", value: sensors.light, unit: "%" }
  ];

  return (
    <div className="p-8 flex-1 flex flex-col gap-6 bg-gray-50 overflow-y-auto">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/dashboard')} className="p-2 bg-white border border-gray-200 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div className="flex-1 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-brand-green uppercase flex items-center gap-3">
              {areaInfo.name}
              {loading && <RefreshCw className="w-5 h-5 text-brand-green animate-spin" />}
            </h2>
          </div>
          <button onClick={loadZoneData} className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm text-brand-green hover:bg-gray-50 border border-gray-200">
            <RefreshCw className="w-5 h-5" />
            <span className="font-semibold">Cập nhật</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1">
        <div className="mb-6">
          <ZoneBannerCard zoneName={areaInfo.name} cropType={areaInfo.description} />
        </div>

        <div className="col-span-2 grid grid-cols-2 gap-4">
          {sensorCards.map((s, idx) => (
            <StatCard key={idx} icon={s.icon} label={s.label} value={s.value} unit={s.unit} />
          ))}
        </div>
      </div>

      <div className=" bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col min-h-[400px]">
        <h3 className="font-bold text-brand-green uppercase text-lg mb-4">Xu hướng Nhiệt độ (Gần đây)</h3>
        <div className="flex-1 w-full">
          {history.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ stroke: '#F3F4F6', strokeWidth: 2 }} />
                <Line type="monotone" dataKey="temp" name="Nhiệt độ (°C)" stroke="#9C050C" strokeWidth={3} dot={{ r: 4, fill: '#9C050C' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              Chưa có đủ dữ liệu lịch sử để vẽ biểu đồ
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 mt-2 gap-6">

        <div className="flex flex-col gap-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Cpu className="text-brand-green" /> 
              <h3 className="font-bold text-brand-green uppercase text-lg">Thiết bị</h3>
            </h3>
            <div className="flex flex-col gap-3">
              {devices.length > 0 ? devices.map(d => (
                <div key={d.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <p className="font-semibold text-sm text-gray-700">{d.device_name}</p>
                    <p className="text-xs text-gray-400 mt-1">Cập nhật: {new Date(d.last_updated).toLocaleTimeString('vi-VN')}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${d.mode === 'ON' ? 'bg-brand-green text-white' : 'bg-gray-300 text-black'}`}>
                    {d.mode}
                  </span>
                </div>
              )) : <p className="text-sm text-gray-500 text-center py-4">Khu vực chưa có thiết bị</p>}
            </div>
          </div>

        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex-1">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="text-brand-green" /> 
            <h3 className="font-bold text-brand-green uppercase text-lg">Lịch sử hoạt động</h3>
          </h3>
          <div className="flex flex-col gap-3">
            {logs.length > 0 ? logs.map(l => (
              <div key={l.id} className="border-b border-gray-50 pb-2 text-sm last:border-0">
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-gray-700">{l.device_name}</span>
                  <span className="text-[10px] text-brand-green px-2 py-0.5 bg-second-green rounded-full font-bold">{l.mode}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>{l.source === 'auto' ? 'Tự động' : 'Thủ công'}</span>
                  <span>{new Date(l.time).toLocaleTimeString('vi-VN')}</span>
                </div>
              </div>
            )) : <p className="text-sm text-gray-500 text-center py-4">Chưa có lịch sử</p>}
          </div>
        </div>

      </div>
    </div>
  );
};