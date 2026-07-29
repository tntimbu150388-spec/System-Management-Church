import React, { useState } from 'react';
import { Calendar, PlusCircle, CheckCircle, Clock, MapPin, UserCheck } from 'lucide-react';
import { DataTable, Column } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { Jadwal } from '../../types';
import { getCollection, addItem, updateItem } from '../../services/db';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export const JadwalModule: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [jadwals, setJadwals] = useState<Jadwal[]>(() => getCollection('JADWAL') || []);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<Jadwal>>({
    Tanggal: new Date().toISOString().slice(0, 10),
    Jam: '08:00 WIB',
    Ibadah: 'Ibadah Raya I (Pagi)',
    Pelayanan: 'Worship Leader & Pemusik',
    Jemaat: 'Tim Praise & Worship',
    Status: 'Jadwal',
    Lokasi: 'Gedung Utama Lt. 1',
  });

  const refreshData = () => {
    setJadwals(getCollection('JADWAL') || []);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newJ: Jadwal = {
      JadwalID: 'JDW-' + Date.now().toString().slice(-5),
      Tanggal: formData.Tanggal || new Date().toISOString().slice(0, 10),
      Jam: formData.Jam || '08:00 WIB',
      Ibadah: formData.Ibadah || 'Ibadah Raya',
      Pelayanan: formData.Pelayanan || 'Pelayan',
      Jemaat: formData.Jemaat || 'Petugas',
      Status: formData.Status as any || 'Jadwal',
      Lokasi: formData.Lokasi || 'Gedung Utama',
    };

    addItem('JADWAL', newJ, user?.UserID, user?.Nama);
    refreshData();
    setIsModalOpen(false);
    showToast('Jadwal Dibuat', 'Jadwal ibadah & pelayan baru telah disimpan.', 'success');
  };

  const columns: Column<Jadwal>[] = [
    {
      header: 'Tanggal & Waktu',
      accessorKey: 'Tanggal',
      sortable: true,
      cell: (item) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-slate-100">{item.Tanggal}</p>
          <p className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold">{item.Jam}</p>
        </div>
      ),
    },
    {
      header: 'Nama Ibadah',
      accessorKey: 'Ibadah',
      cell: (item) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-slate-100">{item.Ibadah}</p>
          <p className="text-[10px] text-slate-400">{item.Lokasi || 'Gedung Utama'}</p>
        </div>
      ),
    },
    { header: 'Tugas Pelayanan', accessorKey: 'Pelayanan' },
    { header: 'Petugas Assigned', accessorKey: 'Jemaat' },
    {
      header: 'Status',
      accessorKey: 'Status',
      cell: (item) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
            item.Status === 'Jadwal'
              ? 'bg-blue-500/10 text-blue-600'
              : 'bg-emerald-500/10 text-emerald-600'
          }`}
        >
          {item.Status}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        data={jadwals}
        columns={columns}
        title="Jadwal Ibadah & Penugasan Pelayan"
        exportFileName="Jadwal_Ibadah_GKI"
        actionButton={
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Buat Jadwal Baru</span>
          </button>
        }
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Jadwal Ibadah & Pelayan Baru"
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Tanggal *</label>
              <input
                type="date"
                required
                value={formData.Tanggal}
                onChange={(e) => setFormData({ ...formData, Tanggal: e.target.value })}
                className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Jam *</label>
              <input
                type="text"
                required
                value={formData.Jam}
                onChange={(e) => setFormData({ ...formData, Jam: e.target.value })}
                className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Nama Ibadah *</label>
            <input
              type="text"
              required
              value={formData.Ibadah}
              onChange={(e) => setFormData({ ...formData, Ibadah: e.target.value })}
              className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Tugas Pelayanan</label>
            <input
              type="text"
              value={formData.Pelayanan}
              onChange={(e) => setFormData({ ...formData, Pelayanan: e.target.value })}
              className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Petugas / Tim</label>
            <input
              type="text"
              value={formData.Jemaat}
              onChange={(e) => setFormData({ ...formData, Jemaat: e.target.value })}
              className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 font-semibold text-slate-500"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl shadow"
            >
              Simpan Jadwal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
