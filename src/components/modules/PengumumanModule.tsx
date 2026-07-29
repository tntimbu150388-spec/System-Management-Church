import React, { useState } from 'react';
import { Megaphone, PlusCircle, Trash2 } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { Modal } from '../common/Modal';
import { Pengumuman } from '../../types';
import { getCollection, addItem, deleteItem } from '../../services/db';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export const PengumumanModule: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [pengumumans, setPengumumans] = useState<Pengumuman[]>(
    () => getCollection('PENGUMUMAN') || []
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    Judul: '',
    Isi: '',
    Target: 'Semua' as any,
  });

  const refreshData = () => {
    setPengumumans(getCollection('PENGUMUMAN') || []);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newP: Pengumuman = {
      PengumumanID: 'PGM-' + Date.now().toString().slice(-5),
      Judul: formData.Judul || '',
      Isi: formData.Isi || '',
      Tanggal: new Date().toISOString().slice(0, 10),
      Target: formData.Target || 'Semua',
      Publish: true,
    };

    addItem('PENGUMUMAN', newP, user?.UserID, user?.Nama);
    refreshData();
    setIsModalOpen(false);
    showToast('Pengumuman Diterbitkan', 'Pengumuman baru telah tayang.', 'success');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Hapus pengumuman ini?')) {
      deleteItem('PENGUMUMAN', 'PengumumanID', id, user?.UserID, user?.Nama);
      refreshData();
      showToast('Data Dihapus', 'Pengumuman telah dihapus.', 'info');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
            Warta & Pengumuman Gereja
          </h2>
          <p className="text-xs text-slate-500">Papan pengumuman resmi terintegrasi</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Buat Pengumuman</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pengumumans.map((p) => (
          <GlassCard key={p.PengumumanID} className="p-5 space-y-3 relative">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-extrabold border border-amber-500/20">
                Target: {p.Target}
              </span>
              <span className="text-[11px] text-slate-400">{p.Tanggal}</span>
            </div>

            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              {p.Judul}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {p.Isi}
            </p>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => handleDelete(p.PengumumanID)}
                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs flex items-center gap-1 font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Pengumuman Baru" maxWidth="md">
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Judul Pengumuman *</label>
            <input
              type="text"
              required
              value={formData.Judul}
              onChange={(e) => setFormData({ ...formData, Judul: e.target.value })}
              className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Target Jemaat</label>
            <select
              value={formData.Target}
              onChange={(e) => setFormData({ ...formData, Target: e.target.value as any })}
              className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            >
              <option value="Semua">Semua Jemaat</option>
              <option value="Jemaat">Jemaat Khusus</option>
              <option value="Admin">Admin Gereja</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Isi Pesan Pengumuman *</label>
            <textarea
              required
              rows={4}
              value={formData.Isi}
              onChange={(e) => setFormData({ ...formData, Isi: e.target.value })}
              className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-semibold text-slate-500">
              Batal
            </button>
            <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl shadow">
              Daftarkan Pengumuman
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
