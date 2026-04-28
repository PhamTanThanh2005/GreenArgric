import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ThermometerSun, Sprout, Droplets, Sun, ArrowLeft, RefreshCw } from 'lucide-react';
import { StatCard } from '../features/dashboard/components/StatCard';
import { ZoneBannerCard } from '../features/dashboard/components/ZoneBannerCard';
import { sensorApi } from '../features/dashboard/api/sensorApi';
import { areaApi } from '../features/dashboard/api/areaApi'; 

export const ZoneDashboardPage: React.FC = () => {
  const { zoneId } = useParams<{ zoneId: string }>();
  const navigate = useNavigate();

  // State lưu thông tin khu vực (Thay thế cho Mock Data)
  const [areaInfo, setAreaInfo] = useState({ name: 'Đang tải...', description: '...' });
  const [loading, setLoading] = useState(true);

  // State lưu giá trị cảm biến
  const [sensorValues, setSensorValues] = useState({
    temperature: '--',
    soil_moisture: '--',
    moisture: '--',
    light: '--'
  });

  useEffect(() => {
    if (!zoneId) return;

    const fetchAreaInfo = async () => {
      try {
        const areas = await areaApi.getAll();
        const currentArea = areas.find(a => a.id.toString() === zoneId);
        if (currentArea) {
          setAreaInfo({
            name: currentArea.name,
            description: currentArea.description
          });
        } else {
          setAreaInfo({ name: `Khu vực chưa xác định (${zoneId})`, description: '' });
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin khu vực:", error);
      }
    };

    const fetchSensorData = async () => {
      try {
        // Sử dụng API endpoint: GET /sensor/area/:area_id/latest
        const data = await sensorApi.getLatestByArea(zoneId);
        
        if (data && data.length > 0) {
          setSensorValues(prev => {
            const newValues = { ...prev };
            data.forEach(sensor => {
              switch (sensor.type) {
                case 'temp':
                  newValues.temperature = sensor.value.toString();
                  break;
                case 'soil_moisture':
                  newValues.soil_moisture = sensor.value.toString();
                  break;
                case 'moisture':
                  newValues.moisture = sensor.value.toString();
                  break;
                case 'light':
                  newValues.light = sensor.value.toString();
                  break;
                default:
                  break;
              }
            });
            return newValues;
          });
        }
      } catch (error) {
        console.error(`Lỗi khi lấy dữ liệu sensor cho khu vực ${zoneId}:`, error);
      }
    };

    // Khởi tạo gọi API lần đầu
    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchAreaInfo(), fetchSensorData()]);
      setLoading(false);
    };

    initData();

    // Auto refresh data sensor mỗi 5 giây
    const intervalId = setInterval(fetchSensorData, 5000);
    return () => clearInterval(intervalId);

  }, [zoneId]);

  return (
    <div className="p-8 flex-1 flex flex-col gap-6 bg-white overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div>
          <h2 className="text-3xl font-bold text-brand-green uppercase flex items-center gap-3">
            {areaInfo.name}
            {loading && <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />}
          </h2>
          <p className="text-gray-500">
            Giám sát và điều khiển cục bộ
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Banner truyền dữ liệu API thay vì Mock */}
        <div className="">
          <ZoneBannerCard
            zoneName={areaInfo.name}
            cropType={areaInfo.description} 
          />
        </div>

        {/* Các thẻ chỉ số */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard icon={ThermometerSun} label="Nhiệt độ" value={sensorValues.temperature} unit="°C" />
          <StatCard icon={Sprout} label="Độ ẩm đất" value={sensorValues.soil_moisture} unit="%" />
          <StatCard icon={Droplets} label="Độ ẩm" value={sensorValues.moisture} unit="%" />
          <StatCard icon={Sun} label="Ánh sáng" value={sensorValues.light} unit="lux" />
        </div>
      </div>

      {/* Phần dưới (Chờ cập nhật API) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Thiết bị trong khu vực</h3>
          <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
            <p className="text-sm">Đang chờ Backend cập nhật API phân quyền thiết bị</p>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Xu hướng 24h</h3>
          <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
            <p className="text-sm">Khu vực hiển thị biểu đồ</p>
          </div>
        </div>
      </div>
    </div>
  );
};