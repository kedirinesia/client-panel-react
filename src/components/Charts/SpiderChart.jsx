import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const SpiderChart = ({ data, maxValue = 4, height = 320 }) => {
  const chartData = [
    { skill: 'Kerja Sama', value: data['Kerja Sama'] || 0 },
    { skill: 'Tanggung Jawab', value: data['Tanggung Jawab'] || 0 },
    { skill: 'Komunikasi', value: data['Komunikasi'] || 0 },
    { skill: 'Problem Solving', value: data['Problem Solving'] || 0 },
    { skill: 'Kepemimpinan', value: data['Kepemimpinan'] || 0 },
    { skill: 'Fleksibilitas', value: data['Fleksibilitas'] || 0 }
  ];

  return (
    <div className="w-full" style={{ height: typeof height === 'number' ? `${height}px` : height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis 
            dataKey="skill" 
            tick={{ fontSize: 12, fill: '#374151' }}
            className="text-xs"
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, maxValue]} 
            tick={{ fontSize: 10, fill: '#6b7280' }}
            tickCount={5}
          />
          <Radar
            name="Skor"
            dataKey="value"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SpiderChart;
