import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const financeData = [
  { jenis: 'Perpuluhan', jumlah: 12500000 },
  { jenis: 'Persembahan', jumlah: 8500000 },
  { jenis: 'Diakonia', jumlah: 3200000 },
  { jenis: 'Misi', jumlah: 4500000 },
  { jenis: 'Pembangunan', jumlah: 6000000 },
];

export const PersembahanChart: React.FC = () => {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={financeData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis dataKey="jenis" tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(1)}M`} />
          <Tooltip
            formatter={(value: any) => [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Total']}
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#1e293b',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '12px',
            }}
          />
          <Legend />
          <Bar dataKey="jumlah" name="Nominal (Rp)" fill="#10b981" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
