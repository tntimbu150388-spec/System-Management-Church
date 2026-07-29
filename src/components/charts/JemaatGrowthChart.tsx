import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const sampleData = [
  { bulan: 'Jan', jemaat: 120, aktif: 110 },
  { bulan: 'Feb', jemaat: 128, aktif: 118 },
  { bulan: 'Mar', jemaat: 135, aktif: 125 },
  { bulan: 'Apr', jemaat: 142, aktif: 132 },
  { bulan: 'Mei', jemaat: 150, aktif: 140 },
  { bulan: 'Jun', jemaat: 165, aktif: 152 },
  { bulan: 'Jul', jemaat: 180, aktif: 168 },
];

export const JemaatGrowthChart: React.FC = () => {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={sampleData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorJemaat" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis dataKey="bulan" tick={{ fontSize: 12, fill: '#94a3b8' }} />
          <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#1e293b',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '12px',
            }}
          />
          <Area
            type="monotone"
            dataKey="jemaat"
            name="Total Jemaat"
            stroke="#2563eb"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorJemaat)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
