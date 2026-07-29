import React, { useState } from 'react';
import { Package, PlusCircle, Trash2 } from 'lucide-react';
import { DataTable, Column } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { Inventaris } from '../../types';
import { getCollection, addItem, deleteItem } from '../../services/db';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export const InventarisModule: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [inventariss, setInventariss] = useState<Inventaris[]>(
    () => getCollection('INVENTARIS') || []
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Inventaris>>({
    NamaBarang: '',
    Jumlah: 1,
    Kondisi: 'Baik',
    Lokasi: 'Ruang Utama',
    Kategori: 'Elektronik',
  });

  const refreshData = () => {
    setInventariss(getCollection('INVENTARIS') || []);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newI: Inventaris = {
      BarangID: 'BRG-' + Date.now().toString().slice(-5),
      NamaBarang: formData.NamaBarang || '',
      Jumlah: Number(formData.Jumlah) || 1,
      Kondisi: (formData.Kondisi as any) || 'Baik',
      Lokasi: formData.Lokasi || 'Ruang Utama',
      Kategori: formData.Kategori || 'Lainnya',
      TanggalPengadaan: new Date().toISOString().slice(0, 10),
    };

    addItem('INVENTARIS', newI, user?.UserID, user?.Nama);
    refreshData();
    setIsModalOpen(false);
    showToast('Inventaris Tersimpan', 'Barang inventaris berhasil dicatat.', 'success');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Hapus barang inventaris ini?')) {
      deleteItem('INVENTARIS', 'BarangID', id, user?.UserID, user?.Nama);
      refreshData();
      showToast('Data Dihapus', 'Barang inventaris dihapus.', 'info');
    }
  };

  const columns: Column<Inventaris>[] = [
    {
      header: 'Kode & Barang',
      accessorKey: 'NamaBarang',
      cell: (item) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-slate-100">{item.NamaBarang}</p>
          <p className="text-[10px] text-slate-400">Kode: {item.BarangID}</p>
        </div>
      ),
    },
    { header: 'Kategori', accessorKey: 'Kategori' },
    { header: 'Jumlah', accessorKey: 'Jumlah', sortable: true },
    { header: 'Lokasi Simpan', accessorKey: 'Lokasi' },
    {
      header: 'Kondisi',
      accessorKey: 'Kondisi',
      cell: (item) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
            item.Kondisi === 'Baik'
              ? 'bg-emerald-500/10 text-emerald-600'
              : item.Kondisi === 'Perlu Perbaikan'
              ? 'bg-amber-500/10 text-amber-600'
              : 'bg-rose-500/10 text-rose-600'
          }`}
        >
          {item.Kondisi}
        </span>
      ),
    },
    {
      header: 'Aksi',
      cell: (item) => (
        <button
          onClick={() => handleDelete(item.BarangID)}
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
        data={inventariss}
        columns={columns}
        title="Master Inventaris & Aset Gereja"
        exportFileName="Inventaris_Aset_GKI"
        actionButton={
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Inventaris</span>
          </button>
        }
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Barangan Aset Baru" maxWidth="md">
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Nama Barang / Aset *</label>
            <input
              type="text"
              required
              value={formData.NamaBarang}
              onChange={(e) => setFormData({ ...formData, NamaBarang: e.target.value })}
              placeholder="Contoh: Mixer Audio Yamaha 32ch"
              className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Jumlah *</label>
              <input
                type="number"
                required
                min={1}
                value={formData.Jumlah}
                onChange={(e) => setFormData({ ...formData, Jumlah: Number(e.target.value) })}
                className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Kondisi</label>
              <select
                value={formData.Kondisi}
                onChange={(e) => setFormData({ ...formData, Kondisi: e.target.value as any })}
                className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              >
                <option value="Baik">Baik</option>
                <option value="Perlu Perbaikan">Perlu Perbaikan</option>
                <option value="Rusak">Rusak</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Lokasi Simpan</label>
            <input
              type="text"
              value={formData.Lokasi}
              onChange={(e) => setFormData({ ...formData, Lokasi: e.target.value })}
              placeholder="Ruang Sound System"
              className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Kategori</label>
            <input
              type="text"
              value={formData.Kategori}
              onChange={(e) => setFormData({ ...formData, Kategori: e.target.value })}
              placeholder="Elektronik / Mebel"
              className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-semibold text-slate-500">
              Batal
            </button>
            <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl shadow">
              Simpan Barang
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
