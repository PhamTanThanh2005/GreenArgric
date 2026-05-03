import React from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';

interface DeviceDurationChartProps {
  data: Record<string, string | number>[];
  color?: string;
}

export const DeviceDurationChart: React.FC<DeviceDurationChartProps> = ({ 
  data, 
  color = "#f59e0b" // Mặc định màu vàng cam rực rỡ
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
        
        <Tooltip 
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          cursor={{ fill: '#f3f4f6' }}
          formatter={(value: number) => [`${value} giờ`, 'Thời gian chạy']}
        />

        <Bar 
          dataKey="durationHours" 
          name="Giờ hoạt động" 
          fill={color} 
          radius={[4, 4, 0, 0]} 
          barSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};