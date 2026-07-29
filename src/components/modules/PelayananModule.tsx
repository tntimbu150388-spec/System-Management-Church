import React, { useState } from 'react';
import { Sparkles, PlusCircle, Trash2, Edit } from 'lucide-react';
import { DataTable, Column } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { Pelayanan } from '../../types';
import { getCollection, addItem, deleteItem } from '../../services/db';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export const PelayananModule: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [pelayanans, setPelayanans] = useState<Pelayanan[]>(
    () => getCollection('PELAYANAN') || []
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Pelayanan>>({
    NamaPelayanan: '',
    Kategori: 'Ibadah Utama',
    Deskripsi: '',
  });

  const refreshData = () => {
    setPelayanans(getCollection('PELAYANAN') || []);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newP: Pelayanan = {
      PelayananID: 'PLY-' + Date.now().toString().slice(-5),
      NamaPelayanan: formData.NamaPelayanan || '',
      Kategori: formData.Kategori || 'Ibadah Utama',
      Deskripsi: formData.Deskripsi || '',
    };
    addItem('PELAYANAN', newP, user?.UserID, user?.Nama);
    refreshData();
    setIsModalOpen(false);
    showToast('Kategori Pelayanan Tersimpan', 'Data pelayanan baru tersimpan.', 'success');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Hapus kategori pelayanan ini?')) {
      deleteItem('PELAYANAN', 'PelayananID', id, user?.UserID, user?.Nama);
      refreshData();
      showToast('Data Dihapus', 'Pelayanan dihapus.', 'info');
    }
  };

  const columns: Column<Pelayanan>[] = [
    { header: 'Nama Pelayanan', accessorKey: 'NamaPelayanan', sortable: true },
    {
      header: 'Kategori',
      accessorKey: 'Kategori',
      cell: (item) => (
        <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold border border-purple-500/20">
          {item.Kategori}
        </span>
      ),
    },
    { header: 'Deskripsi', accessorKey: 'Deskripsi' },
    {
      header: 'Aksi',
      cell: (item) => (
        <button
          onClick={() => handleDelete(item.PelayananID)}
          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        data={pelayanans}
        columns={columns}
        title="Master Bidang & Kategori Pelayanan"
        exportFileName="Pelayanan_Gereja"
        actionButton={
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Bidang Pelayanan</span>
          </button>
        }
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Pelayanan Baru" maxWidth="md">
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Nama Pelayanan *</label>
            <input
              type="text"
              required
              value={formData.NamaPelayanan}
              onChange={(e) => setFormData({ ...formData, NamaPelayanan: e.target.value })}
              placeholder="Contoh: Sound System & Media"
              className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Kategori</label>
            <select
              value={formData.Kategori}
              onChange={(e) => setFormData({ ...formData, Kategori: e.target.value })}
              className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            >
              <option value="Ibadah Utama">Ibadah Utama</option>
              <option value="Teknis">Teknis</option>
              <option value="Anak">Anak</option>
              <option value="Ketertiban">Ketertiban</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Deskripsi</label>
            <textarea
              value={formData.Deskripsi}
              onChange={(e) => setFormData({ ...formData, Deskripsi: e.target.value })}
              rows={3}
              className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-semibold text-slate-500">
              Batal
            </button>
            <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl shadow">
              Simpan Pelayanan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
