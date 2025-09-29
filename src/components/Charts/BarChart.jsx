import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BarChart = ({ data, maxValue = 4 }) => {
  const chartData = [
    { skill: 'Kerja Sama', value: data['Kerja Sama'] || 0 },
    { skill: 'Tanggung Jawab', value: data['Tanggung Jawab'] || 0 },
    { skill: 'Komunikasi', value: data['Komunikasi'] || 0 },
    { skill: 'Problem Solving', value: data['Problem Solving'] || 0 },
    { skill: 'Kepemimpinan', value: data['Kepemimpinan'] || 0 },
    { skill: 'Fleksibilitas', value: data['Fleksibilitas'] || 0 }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-blue-600">
            Skor: <span className="font-semibold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="skill" 
            tick={{ fontSize: 12, fill: '#374151' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            domain={[0, maxValue]}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickCount={5}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="value" 
            fill="#3b82f6" 
            radius={[4, 4, 0, 0]}
            stroke="#2563eb"
            strokeWidth={1}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;

