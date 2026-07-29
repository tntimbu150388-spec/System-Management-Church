import React, { useState } from 'react';
import { History } from 'lucide-react';
import { DataTable, Column } from '../common/DataTable';
import { LogAktivitas } from '../../types';
import { getCollection } from '../../services/db';

export const LogAktivitasModule: React.FC = () => {
  const [logs] = useState<LogAktivitas[]>(() => getCollection('LOG_AKTIVITAS') || []);

  const columns: Column<LogAktivitas>[] = [
    { header: 'Waktu Log', accessorKey: 'Waktu', sortable: true },
    { header: 'User Executer', accessorKey: 'NamaUser' },
    { header: 'User ID', accessorKey: 'UserID' },
    {
      header: 'Aktivitas',
      accessorKey: 'Aktivitas',
      cell: (item) => (
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          {item.Aktivitas}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        data={logs}
        columns={columns}
        title="Audit Trail Log Aktivitas System"
        exportFileName="Log_Aktivitas_CMS"
      />
    </div>
  );
};
