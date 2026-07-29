import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Search,
  Filter,
  Check,
} from 'lucide-react';
import { DataTable, Column } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { Jemaat } from '../../types';
import {
  getCollection,
  addItem,
  updateItem,
  deleteItem,
  getDatabase,
  saveDatabase,
} from '../../services/db';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export const JemaatModule: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [jemaats, setJemaats] = useState<Jemaat[]>(() => getCollection('JEMAAT') || []);
  const [filterWilayah, setFilterWilayah] = useState<string>('Semua');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingJemaat, setEditingJemaat] = useState<Jemaat | null>(null);

  const [formData, setFormData] = useState<Partial<Jemaat>>({
    Nama: '',
    NIK: '',
    KK: '',
    Gender: 'L',
    TempatLahir: '',
    TanggalLahir: '',
    Alamat: '',
    Wilayah: 'Wilayah I - Pusat',
    HP: '',
    Email: '',
    Baptis: 'Ya',
    TanggalBaptis: '',
    Sidi: 'Belum',
    TanggalSidi: '',
    Status: 'Aktif',
    Foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  });

  const refreshData = () => {
    setJemaats(getCollection('JEMAAT') || []);
  };

  const pendingList = jemaats.filter((j) => j.Status === 'Pending' || j.Status === 'PENDING');

  const filteredJemaats = jemaats.filter((j) => {
    if (filterWilayah !== 'Semua' && j.Wilayah !== filterWilayah) return false;
    if (filterStatus !== 'Semua' && j.Status !== filterStatus) return false;
    return true;
  });

  const handleApproveRegistration = (jemaat: Jemaat) => {
    updateItem('JEMAAT', 'JemaatID', jemaat.JemaatID, { Status: 'Aktif' }, user?.UserID, user?.Nama);

    // Also activate the user record
    if (jemaat.UserID) {
      updateItem('USERS', 'UserID', jemaat.UserID, { Status: 'ACTIVE' }, user?.UserID, user?.Nama);
    }

    refreshData();
    showToast('Persetujuan Berhasil', `Akun jemaat ${jemaat.Nama} telah diaktifkan.`, 'success');
  };

  const handleRejectRegistration = (jemaat: Jemaat) => {
    deleteItem('JEMAAT', 'JemaatID', jemaat.JemaatID, user?.UserID, user?.Nama);
    if (jemaat.UserID) {
      deleteItem('USERS', 'UserID', jemaat.UserID, user?.UserID, user?.Nama);
    }
    refreshData();
    showToast('Pendaftaran Ditolak', `Pendaftaran ${jemaat.Nama} telah dihapus.`, 'warning');
  };

  const handleSaveJemaat = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingJemaat) {
      updateItem('JEMAAT', 'JemaatID', editingJemaat.JemaatID, formData, user?.UserID, user?.Nama);
      showToast('Berhasil Updated', 'Data jemaat diperbarui.', 'success');
    } else {
      const jemaatId = 'JEM-' + Date.now().toString().slice(-5);
      const newJ: Jemaat = {
        JemaatID: jemaatId,
        UserID: 'USR-' + Date.now().toString().slice(-5),
        Nama: formData.Nama || '',
        NIK: formData.NIK || '',
        KK: formData.KK || '',
        Gender: formData.Gender as 'L' | 'P',
        TempatLahir: formData.TempatLahir || '',
        TanggalLahir: formData.TanggalLahir || '',
        Alamat: formData.Alamat || '',
        Wilayah: formData.Wilayah || 'Wilayah I - Pusat',
        HP: formData.HP || '',
        Email: formData.Email || '',
        Baptis: formData.Baptis as 'Ya' | 'Belum',
        TanggalBaptis: formData.TanggalBaptis,
        Sidi: formData.Sidi as 'Ya' | 'Belum',
        TanggalSidi: formData.TanggalSidi,
        Status: formData.Status as any,
        Foto: formData.Foto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      };
      addItem('JEMAAT', newJ, user?.UserID, user?.Nama);
      showToast('Jemaat Ditambahkan', 'Data jemaat baru tersimpan.', 'success');
    }

    refreshData();
    setIsAddModalOpen(false);
    setEditingJemaat(null);
  };

  const handleDeleteJemaat = (id: string, nama: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus data jemaat ${nama}?`)) {
      deleteItem('JEMAAT', 'JemaatID', id, user?.UserID, user?.Nama);
      refreshData();
      showToast('Data Dihapus', `Data jemaat ${nama} telah dihapus.`, 'info');
    }
  };

  const columns: Column<Jemaat>[] = [
    {
      header: 'Foto & Nama',
      accessorKey: 'Nama',
      sortable: true,
      cell: (item) => (
        <div className="flex items-center gap-3">
          <img
            src={item.Foto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={item.Nama}
            className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
          />
          <div>
            <p className="font-bold text-slate-900 dark:text-slate-100">{item.Nama}</p>
            <p className="text-[10px] text-slate-400">NIK: {item.NIK || '-'}</p>
          </div>
        </div>
      ),
    },
    { header: 'Gender', accessorKey: 'Gender', sortable: true },
    { header: 'Wilayah', accessorKey: 'Wilayah', sortable: true },
    { header: 'No. HP', accessorKey: 'HP' },
    {
      header: 'Baptis & Sidi',
      cell: (item) => (
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className={`px-2 py-0.5 rounded font-bold ${item.Baptis === 'Ya' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
            B: {item.Baptis}
          </span>
          <span className={`px-2 py-0.5 rounded font-bold ${item.Sidi === 'Ya' ? 'bg-blue-500/10 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
            S: {item.Sidi}
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'Status',
      cell: (item) => (
        <span
          className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
            item.Status === 'Aktif'
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
          }`}
        >
          {item.Status}
        </span>
      ),
    },
    {
      header: 'Aksi',
      cell: (item) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setEditingJemaat(item);
              setFormData(item);
              setIsAddModalOpen(true);
            }}
            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10"
            title="Edit Data"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteJemaat(item.JemaatID, item.Nama)}
            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
            title="Hapus"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Pending Approval Section */}
      {pendingList.length > 0 && (
        <div className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              <span>{pendingList.length} Permohonan Pendaftaran Jemaat Baru Membutuhkan Persetujuan</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pendingList.map((p) => (
              <div
                key={p.JemaatID}
                className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-sm"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{p.Nama}</h4>
                  <p className="text-[11px] text-slate-500">
                    {p.Wilayah} • HP: {p.HP}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">NIK: {p.NIK}</p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleApproveRegistration(p)}
                    className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow transition-colors text-xs font-bold flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    <span>Setujui</span>
                  </button>
                  <button
                    onClick={() => handleRejectRegistration(p)}
                    className="p-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
          <Filter className="w-4 h-4 text-blue-500" />
          <span>Filter:</span>
        </div>

        <select
          value={filterWilayah}
          onChange={(e) => setFilterWilayah(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
        >
          <option value="Semua">Semua Wilayah</option>
          <option value="Wilayah I - Pusat">Wilayah I - Pusat</option>
          <option value="Wilayah II - Barat">Wilayah II - Barat</option>
          <option value="Wilayah III - Timur">Wilayah III - Timur</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
        >
          <option value="Semua">Semua Status</option>
          <option value="Aktif">Aktif</option>
          <option value="Pending">Pending</option>
          <option value="Pindah">Pindah</option>
        </select>
      </div>

      {/* Main Table */}
      <DataTable
        data={filteredJemaats}
        columns={columns}
        title="Master Data Jemaat Gereja"
        exportFileName="Data_Jemaat_GKI"
        actionButton={
          <button
            onClick={() => {
              setEditingJemaat(null);
              setFormData({
                Nama: '',
                NIK: '',
                KK: '',
                Gender: 'L',
                TempatLahir: '',
                TanggalLahir: '',
                Alamat: '',
                Wilayah: 'Wilayah I - Pusat',
                HP: '',
                Email: '',
                Baptis: 'Ya',
                Sidi: 'Belum',
                Status: 'Aktif',
              });
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Jemaat</span>
          </button>
        }
      />

      {/* Modal Form */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingJemaat ? 'Edit Data Jemaat' : 'Tambah Jemaat Baru'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveJemaat} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Nama Lengkap *</label>
              <input
                type="text"
                required
                value={formData.Nama || ''}
                onChange={(e) => setFormData({ ...formData, Nama: e.target.value })}
                className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">NIK *</label>
              <input
                type="text"
                required
                value={formData.NIK || ''}
                onChange={(e) => setFormData({ ...formData, NIK: e.target.value })}
                className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Nomor KK *</label>
              <input
                type="text"
                required
                value={formData.KK || ''}
                onChange={(e) => setFormData({ ...formData, KK: e.target.value })}
                className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Jenis Kelamin</label>
              <select
                value={formData.Gender || 'L'}
                onChange={(e) => setFormData({ ...formData, Gender: e.target.value as any })}
                className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Wilayah</label>
              <select
                value={formData.Wilayah || 'Wilayah I - Pusat'}
                onChange={(e) => setFormData({ ...formData, Wilayah: e.target.value })}
                className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              >
                <option value="Wilayah I - Pusat">Wilayah I - Pusat</option>
                <option value="Wilayah II - Barat">Wilayah II - Barat</option>
                <option value="Wilayah III - Timur">Wilayah III - Timur</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">No. HP</label>
              <input
                type="text"
                value={formData.HP || ''}
                onChange={(e) => setFormData({ ...formData, HP: e.target.value })}
                className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 font-semibold text-slate-500 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl shadow"
            >
              Simpan Data
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
