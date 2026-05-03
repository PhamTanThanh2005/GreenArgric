import React from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';

interface DeviceHistoryChartProps {
  data: Record<string, string | number>[];
  colors?: string[];
}

export const DeviceHistoryChart: React.FC<DeviceHistoryChartProps> = ({ 
  data, 
  // Cung cấp màu mặc định nếu không truyền vào
  colors = ["#166534", "#22c55e", "#ef4444"] 
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        
        <XAxis 
          dataKey="name" 
          tick={{ fill: '#9ca3af', fontSize: 12 }} 
          axisLine={false} 
          tickLine={false} 
        />
        
        <YAxis 
          tick={{ fill: '#9ca3af', fontSize: 12 }} 
          axisLine={false} 
          tickLine={false} 
        />
        
        <Tooltip 
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          cursor={{ fill: '#f3f4f6' }}
        />
        
        {/* THÊM CHÚ THÍCH Ở ĐÂY */}
        <Legend 
          verticalAlign="top" 
          height={36} 
          iconType="circle" 
          wrapperStyle={{ fontSize: '12px', fontWeight: 500, color: '#4b5563' }}
        />

        {/* Stack 3 loại trạng thái. Thuộc tính 'name' dùng để hiển thị lên Legend và Tooltip */}
        <Bar dataKey="autoOn" name="Bật (Tự động)" stackId="a" fill={colors[0]} />
        <Bar dataKey="manualOn" name="Bật (Thủ công)" stackId="a" fill={colors[1]} />
        <Bar dataKey="off" name="Tắt" stackId="a" fill={colors[2]} radius={[4, 4, 0, 0]} />
        
      </BarChart>
    </ResponsiveContainer>
  );
};