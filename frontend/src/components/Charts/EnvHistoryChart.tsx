// src/components/Charts/EnvHistoryChart.tsx

import React from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';

interface EnvHistoryChartProps {
  data: Record<string, string | number>[];
  dataKeyX: string;
  dataKeyY: string;
  color?: string;
  unit?: string;
}

export const EnvHistoryChart: React.FC<EnvHistoryChartProps> = ({ 
  data, 
  dataKeyX, 
  dataKeyY, 
  color = "#0f4a27",
  unit = "" 
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />

        <XAxis 
          dataKey={dataKeyX} 
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
          contentStyle={{ 
            borderRadius: '12px', 
            border: 'none', 
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
          }}
          
          formatter={(value) => {
            if (value === undefined || value === null) return ['Không có dữ liệu', 'Giá trị'];
            return [`${value} ${unit}`, 'Giá trị'];
          }}
        />
        
        {/* Vùng biểu đồ */}
        <Area 
          type="monotone" 
          dataKey={dataKeyY} 
          stroke={color} 
          strokeWidth={3}
          fill={color} 
          fillOpacity={0.15} 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};