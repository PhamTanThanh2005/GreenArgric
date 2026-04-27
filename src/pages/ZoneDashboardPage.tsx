import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ThermometerSun, Sprout, Droplets, Sun, ArrowLeft } from 'lucide-react';
import { StatCard } from '../features/dashboard/components/StatCard';
import { getLatestSensors } from '../features/dashboard/api/sensorApi';
import { ZoneBannerCard } from '../features/dashboard/components/ZoneBannerCard';

export const ZoneDashboardPage: React.FC = () => {
  const { zoneId } = useParams(); // Lấy ID từ URL
  const navigate = useNavigate();

  // 1. MOCK DATA: Hàm tạm thời để hiển thị tên khu vực theo ID trên URL
  const getCropType = (id?: string) => {
    switch (id) {
      case 'zone-a': return 'Dưa lưới';
      case 'zone-b': return 'Cà chua';
      case 'zone-c': return 'Rau mầm';
      case 'zone-d': return 'Dâu tây';
      default: return 'Cây nông nghiệp';
    }

  };
  const getZoneName = (id?: string) => {
    switch(id) {
      case 'zone-a': return 'Khu A - Dưa lưới';
      case 'zone-b': return 'Khu B - Cà chua';
      case 'zone-c': return 'Khu C - Rau mầm';
      case 'zone-d': return 'Khu D - Dâu tây';
      default: return 'Khu vực Chung';
    }
  };

  const [sensorValues, setSensorValues] = useState({
    temperature: '--',
    soil_moisture: '--',
    moisture: '--',
    light: '--'
  });

  useEffect(() => {
    const fetchAllSensors = async () => {
      try {
        const data = await getLatestSensors();
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
        console.error("Lỗi khi lấy dữ liệu sensor:", error);
      }
    };

    fetchAllSensors();
    const intervalId = setInterval(fetchAllSensors, 5000);
    return () => clearInterval(intervalId);

  }, []);

  return (
    <div className="p-8 flex-1 flex flex-col gap-6 bg-white overflow-y-auto">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div>
          <h2 className="text-3xl font-bold text-brand-green uppercase">
            {getZoneName(zoneId)}
          </h2>
          <p className="text-gray-500">
            Giám sát và điều khiển cục bộ
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="">
          <ZoneBannerCard
            zoneName={getZoneName(zoneId)}
            cropType={getCropType(zoneId)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <StatCard icon={ThermometerSun} label="Nhiệt độ" value={sensorValues.temperature} unit="°C" />
          <StatCard icon={Sprout} label="Độ ẩm đất" value={sensorValues.soil_moisture} unit="%" />
          <StatCard icon={Droplets} label="Độ ẩm" value={sensorValues.moisture} unit="%" />
          <StatCard icon={Sun} label="Ánh sáng" value={sensorValues.light} unit="lux" />
        </div>
      </div>

      {/* */}
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