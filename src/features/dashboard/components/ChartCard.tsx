import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';

interface ChartCardProps {
  title: string;
  type: 'area' | 'bar';
  data: any[];
  dataKeyX: string;
  dataKeyY: string;
  chartColor: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({ title, type, data, dataKeyX, dataKeyY, chartColor }) => {
  return (
    <div className="bg-white rounded-xl border-3 border-brand-green/50 p-6 h-80 flex flex-col gap-4">
      <h3 className="text-xl font-bold text-brand-green">{title}</h3>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'area' ? (
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey={dataKeyX} />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey={dataKeyY} stroke={chartColor} fill={chartColor} fillOpacity={0.1} />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey={dataKeyX} />
              <YAxis />
              <Tooltip />
              <Bar dataKey={dataKeyY} fill={chartColor} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};