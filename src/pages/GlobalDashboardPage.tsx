import React, { useState, useEffect } from 'react';
import { Sprout, AlertTriangle, Activity, Cpu, RefreshCw } from 'lucide-react';
import { StatCard } from '../features/dashboard/components/StatCard';
import { ZoneCard } from '../features/dashboard/components/ZoneCard';
import { areaApi, type AreaData } from '../features/dashboard/api/areaApi';
import { sensorApi } from '../features/dashboard/api/sensorApi';

interface ZoneData extends AreaData {
  temp: number;
  humidity: number;
  status: 'normal' | 'warning' | 'error';
}

export const GlobalDashboardPage: React.FC = () => {
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [totalDevices, setTotalDevices] = useState(0);
  const [avgTemp, setAvgTemp] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchGlobalData = async () => {
    try {
      setLoading(true);
      // Lấy danh sách toàn bộ khu vực & toàn bộ thiết bị
      const [areas, sensors] = await Promise.all([
        areaApi.getAll(),
        sensorApi.getAllSensors()
      ]);

      setTotalDevices(sensors.length);

      let totalTemp = 0;
      let tempSensorCount = 0;

      // Lấy dữ liệu mới nhất của từng khu vực để truyền vào ZoneCard
      const zonesWithData: ZoneData[] = await Promise.all(
        areas.map(async (area) => {
          let temp = 0;
          let humidity = 0;
          let status: 'normal' | 'warning' | 'error' = 'normal';

          try {
            const latestSensors = await sensorApi.getLatestByArea(area.id);
            
            // Tìm giá trị nhiệt độ và độ ẩm
            const tempSensor = latestSensors.find(s => s.type === 'temp');
            const humidSensor = latestSensors.find(s => s.type === 'humidity'); // Thay 'humidity' bằng mã type thực tế nếu khác

            if (tempSensor) {
              temp = tempSensor.value;
              totalTemp += temp;
              tempSensorCount++;
            }
            if (humidSensor) {
              humidity = humidSensor.value;
            }

            // Giả lập logic
            if (temp > 35) status = 'warning';
            if (temp > 40) status = 'error';

          } catch (err) {
             console.error(`Không thể tải dữ liệu sensor cho khu vực ${area.id} :`, err);
          }

          return {
            ...area,
            temp,
            humidity,
            status
          };
        })
      );

      setZones(zonesWithData);
      
      // Tính nhiệt độ trung bình
      if (tempSensorCount > 0) {
        setAvgTemp(Number((totalTemp / tempSensorCount).toFixed(1)));
      }

    } catch (error) {
      console.error("Lỗi khi tải dữ liệu Global Dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalData();
    // Auto refresh mỗi 60 giây
    const interval = setInterval(fetchGlobalData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <RefreshCw className="w-8 h-8 text-brand-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 flex-1 flex flex-col gap-6 bg-gray-50 overflow-y-auto">
      {/* 1. Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-bold text-brand-green uppercase">Tổng quan Nông trại</h2>
          <p className="text-gray-500">Giám sát trạng thái toàn bộ hệ thống GREEN ARGRIC</p>
        </div>
        <button onClick={fetchGlobalData} className="text-brand-green hover:text-green-700">
          <RefreshCw className="w-6 h-6" />
        </button>
      </div>

      {/* 2. Dãy KPI Cards */}
      <div className="grid grid-cols-2 gap-6">
        <StatCard icon={Sprout} label="Tổng số Khu vực" value={zones.length.toString()} unit="Khu" />
        <StatCard icon={Cpu} label="Thiết bị đang chạy" value={totalDevices.toString()} unit="Thiết bị" />
        <StatCard icon={AlertTriangle} label="Cảnh báo hiện tại" value={zones.filter(z => z.status !== 'normal').length.toString()} unit="Lỗi" />
        <StatCard icon={Activity} label="Nhiệt độ TB" value={avgTemp.toString()} unit="°C"/>
      </div>

      <div className="">
        <div className="flex flex-col gap-6">
          <div className="">
            <h3 className="text-2xl font-bold text-white mb-4 bg-brand-green rounded-2xl p-1 text-center">Trạng thái các phân khu</h3>
          
            {/* 3. Render danh sách ZoneCard động từ API */}
            <div className="grid grid-cols-1 gap-4">
              {zones.length === 0 ? (
                <p className="text-center text-gray-500 py-4">Chưa có khu vực nào được tạo.</p>
              ) : (
                zones.map(zone => (
                  <ZoneCard 
                    key={zone.id}
                    id={`${zone.id}`} // Đảm bảo ID này match với Route của bạn (VD: /zone/1)
                    name={zone.name} 
                    temp={zone.temp} 
                    humidity={zone.humidity} 
                    status={zone.status}
                  />
                ))
              )}
            </div>
          </div>

          <h3 className="text-2xl font-bold text-white bg-brand-green rounded-2xl p-1 text-center">Biểu đồ mô tả</h3>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">So sánh Nhiệt độ (24h qua)</h3>
            <div className="h-64 w-full bg-gray-50 rounded flex items-center justify-center text-gray-400">
              [Khu vực hiển thị Recharts LineChart]
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};