import React, { useState, useEffect } from 'react';
import { Sprout, Cpu, RefreshCw, Droplets, Clock, Radio, ThermometerSun } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

import { StatCard } from '../features/dashboard/components/StatCard';
import { ZoneCard } from '../features/dashboard/components/ZoneCard';

import { areaApi, type AreaData } from '../features/dashboard/api/areaApi';
import { sensorApi } from '../features/dashboard/api/sensorApi';
import { activityApi, type ActivityLog } from '../features/dashboard/api/activityApi';
import { fetchDevices } from '../features/device/api/deviceApi';

const PIE_COLORS = ['#115D33', '#9C050C'];

interface DeviceData {
  id: number;
  device_name: string;
  type: string;
  status: number;
  area_name: string;
  mode: 'ON' | 'OFF';
  last_updated: string;
}

interface ZoneData extends AreaData {
  temp: number;
  humidity: number;
  status: 'normal' | 'warning' | 'error';
}

interface DashboardState {
  zones: ZoneData[];
  logs: ActivityLog[];
  sensorsCount: number;
  devices: { total: number; active: number; off: number };
}

export const GlobalDashboardPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<DashboardState>({
    zones: [],
    logs: [],
    sensorsCount: 0,
    devices: { total: 0, active: 0, off: 0 }
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [areas, sensors, allLogs, allDevicesRaw] = await Promise.all([
        areaApi.getAll(),
        sensorApi.getAllSensors(),
        activityApi.getAll(),
        fetchDevices()
      ]);

      const allDevices = allDevicesRaw as DeviceData[];
      const activeCount = allDevices.filter(d => d.mode === 'ON').length;

      const zonesData: ZoneData[] = await Promise.all(areas.map(async (area) => {
        let temp = 0;
        let humidity = 0;
        let status: 'normal' | 'warning' | 'error' = 'normal';

        try {
          const latest = await sensorApi.getLatestByArea(area.id);
          temp = latest.find(s => s.type === 'temp')?.value || 0;
          humidity = latest.find(s => ['humidity', 'moisture', 'soil_moisture'].includes(s.type))?.value || 0;
          status = (temp > 40 || temp === 0) ? 'error' : temp > 35 ? 'warning' : 'normal';
        } catch (err) {
          console.log(err)
        }

        return { ...area, temp, humidity, status };
      }));

      setData({
        zones: zonesData,
        logs: allLogs.slice(0, 5),
        sensorsCount: sensors.length,
        devices: { total: allDevices.length, active: activeCount, off: allDevices.length - activeCount }
      });
    } catch (error) {
      console.error("Lỗi tải dữ liệu Dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="flex-1 flex justify-center items-center"><RefreshCw className="w-8 h-8 text-brand-green animate-spin" /></div>;

  const { zones, logs, sensorsCount, devices } = data;

  const validTempZones = zones.filter(z => z.temp > 0);
  const avgTemp = validTempZones.length ? (validTempZones.reduce((a, c) => a + c.temp, 0) / validTempZones.length).toFixed(1) : "0";
  const avgHumid = zones.length ? (zones.reduce((a, c) => a + c.humidity, 0) / zones.length).toFixed(1) : "0";

  const kpiCards = [
    { icon: Sprout, label: "Phân khu", val: zones.length, unit: "Khu" },
    { icon: Radio, label: "Cảm biến", val: sensorsCount, unit: "Cảm biến" },
    { icon: Cpu, label: "Số lượng thiết bị", val: devices.total, unit: "Máy" },
    { icon: Cpu, label: "Thiết bị đang hoạt động", val: devices.active, unit: "Máy" },
    { icon: ThermometerSun, label: "Nhiệt độ TB", val: avgTemp, unit: "°C" },
    { icon: Droplets, label: "Độ ẩm TB", val: avgHumid, unit: "%" },
  ];

  return (
    <div className="p-8 flex-1 flex flex-col gap-6 bg-gray-50 overflow-y-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-bold text-brand-green uppercase">Trung tâm điều khiển</h2>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm text-brand-green hover:bg-gray-50 border border-gray-200">
          <RefreshCw className="w-5 h-5" />
          <span className="font-semibold">Cập nhật</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {kpiCards.map((k, i) => (
          <StatCard key={i} icon={k.icon} label={k.label} value={k.val.toString()} unit={k.unit} />
        ))}
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-brand-green uppercase text-xl">Chi tiết phân khu</h3>
          <span className="text-sm font-medium text-brand-green bg-second-green/20 px-3 py-1 rounded-full">
            {zones.length} Khu vực đang giám sát
          </span>
        </div>
        <div className=" gap-4 max-h-88 overflow-auto pr-2 custom-scrollbar">
          {zones.length > 0 ? zones.map(z => (
            <ZoneCard key={z.id} id={`${z.id}`} name={z.name} temp={z.temp} humidity={z.humidity} status={z.status} />
          )) : <p className="text-center text-brand-green py-4 col-span-2 ">Chưa có dữ liệu phân khu.</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="ol-span-2 flex flex-col gap-6">

          <div className="grid grid-cols-3 gap-6 h-80">
            <div className="col-span-2 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
              <h3 className="font-bold text-brand-green uppercase text-lg">Môi trường các phân khu</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={zones} margin={{ left: -20, bottom: 5, right: 0, top: 5 }}>
                  <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#F3F4F6' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="temp" name="Nhiệt độ (°C)" fill="#9C050C" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="humidity" name="Độ ẩm (%)" fill="#115D33" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
              <h3 className="font-bold text-brand-green uppercase text-lg w-full mb-2">Trạng thái Thiết bị</h3>
              <div className="flex-1 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{ v: devices.active, n: 'Đang BẬT' }, { v: devices.off, n: 'Đang TẮT' }]} dataKey="v" nameKey="n" innerRadius={50} outerRadius={80} paddingAngle={5}>
                      {PIE_COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center font-extrabold text-3xl pb-6 text-gray-800">
                  {devices.total}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex-1">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
              <Clock className="text-brand-green" /> 
              <div className="font-bold text-brand-green uppercase text-lg">Lịch sử điều khiển</div>
            </h3>
            <div className="flex flex-col gap-3">
              {logs.length > 0 ? logs.map(l => (
                <div key={l.id} className="border-b border-gray-50 pb-2 text-sm last:border-0">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-gray-700">{l.device_name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${l.mode === 'ON' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {l.mode}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{l.area_name}</span>
                    <span>{new Date(l.time).toLocaleTimeString('vi-VN')}</span>
                  </div>
                </div>
              )) : <p className="text-gray-500 text-center py-4">Chưa có dữ liệu</p>}
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};