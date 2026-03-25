import React from 'react';
import { ThermometerSun, Sprout, Droplets, Sun } from 'lucide-react';
import { WeatherCard } from '../features/dashboard/components/WeatherCard';
import { StatCard } from '../features/dashboard/components/StatCard';
import { ChartCard } from '../features/dashboard/components/ChartCard';

// Dữ liệu mock cho biểu đồ (mô phỏng theo hình 8)
const chartData1 = [
  { name: 'Jan', value: 27 }, { name: 'Feb', value: 26 }, { name: 'Mar', value: 27 }, { name: 'Apr', value: 27.5 }, { name: 'May', value: 25.3 }, { name: 'Jun', value: 22.6 },
];
const chartData2 = [
  { name: 'Jan', value: 25.2 }, { name: 'Feb', value: 27.5 }, { name: 'Mar', value: 29.4 }, { name: 'Apr', value: 70.1 }, { name: 'May', value: 98.3 }, { name: 'Jun', value: 68.4 },
];
const chartData3 = [
  { name: 'Jan', value: 86.1 }, { name: 'Feb', value: 35.4 }, { name: 'Mar', value: 87.3 }, { name: 'Apr', value: 88.5 }, { name: 'May', value: 75.2 }, { name: 'Jun', value: 73.3 },
];

export const DashboardPage: React.FC = () => {
  return (
    <div className="p-8 flex-1 flex flex-col gap-6 bg-white">
      <h2 className="text-2xl font-medium text-black font-playwrite">Xin chào,</h2>
      <WeatherCard />

      {/* Lưới 4 thẻ thông số */}
      <div className="grid grid-cols-2 gap-6">
        <StatCard icon={ThermometerSun} label="Nhiệt độ" value="35" unit="°C" trend="up" />
        <StatCard icon={Sprout} label="Độ ẩm đất" value="70" unit="%" trend="up" />
        <StatCard icon={Droplets} label="Độ ẩm" value="85" unit="%" trend="up" />
        <StatCard icon={Sun} label="Ánh sáng" value="75" unit="%" trend="up" />
      </div>

      {/* Lưới 4 biểu đồ */}
      <div className="grid grid-cols-2 gap-8">
        <ChartCard title="Nhiệt độ" type="area" data={chartData1} dataKeyX="name" dataKeyY="value" chartColor="#1b5e3a" />
        <ChartCard title="Độ ẩm đất" type="bar" data={chartData2} dataKeyX="name" dataKeyY="value" chartColor="#c4e3d3" />
        <ChartCard title="Độ ẩm" type="bar" data={chartData3} dataKeyX="name" dataKeyY="value" chartColor="#c4e3d3" />
        <ChartCard title="Ánh sáng" type="area" data={chartData1} dataKeyX="name" dataKeyY="value" chartColor="#1b5e3a" />
      </div>
    </div>
  );
};