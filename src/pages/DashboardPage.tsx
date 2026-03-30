import React, { useState, useEffect } from 'react';
import { ThermometerSun, Sprout, Droplets, Sun } from 'lucide-react';
import { WeatherCard } from '../features/dashboard/components/WeatherCard';
import { StatCard } from '../features/dashboard/components/StatCard';
import { getLatestSensors } from '../features/dashboard/api/sensorApi'; 

export const DashboardPage: React.FC = () => {

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
    <div className="p-8 flex-1 flex flex-col gap-6 bg-white">
      <h2 className="text-2xl font-medium text-black font-playwrite">Xin chào,</h2>
      <WeatherCard />

      <div className="grid grid-cols-2 gap-6">
        <StatCard icon={ThermometerSun} label="Nhiệt độ" value={sensorValues.temperature} unit="°C" trend="up" />
        <StatCard icon={Sprout} label="Độ ẩm đất" value={sensorValues.soil_moisture} unit="%" trend="up" />
        <StatCard icon={Droplets} label="Độ ẩm" value={sensorValues.moisture} unit="%" trend="up" />
        
        <StatCard 
          icon={Sun} 
          label="Ánh sáng" 
          value={sensorValues.light} 
          unit="lux"
          trend="up" 
        />
      </div>
    </div>
  );
};