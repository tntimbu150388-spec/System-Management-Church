import React, { useState } from 'react';
import { BookOpen, PlusCircle } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { Modal } from '../common/Modal';
import { Renungan } from '../../types';
import { getCollection, addItem } from '../../services/db';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export const RenunganModule: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [renungans, setRenungans] = useState<Renungan[]>(() => getCollection('RENUNGAN') || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    Judul: '',
    AyatAlkitab: '',
    Isi: '',
    Penulis: user?.Nama || 'Pdt. Samuel Hartono',
    Kategori: 'Harian' as const,
  });

  const refreshData = () => {
    setRenungans(getCollection('RENUNGAN') || []);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newR: Renungan = {
      RenunganID: 'RNG-' + Date.now().toString().slice(-5),
      Judul: formData.Judul,
      AyatAlkitab: formData.AyatAlkitab,
      Isi: formData.Isi,
      Tanggal: new Date().toISOString().slice(0, 10),
      Penulis: formData.Penulis,
      Kategori: formData.Kategori,
    };

    addItem('RENUNGAN', newR, user?.UserID, user?.Nama);
    refreshData();
    setIsModalOpen(false);
    showToast('Renungan Diterbitkan', 'Renungan harian berhasil ditambahkan.', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
            Renungan & Artikel Rohani
          </h2>
          <p className="text-xs text-slate-500">Santapan rohani dan firman Tuhan harian</p>
        </div>

        {(user?.Role === 'SUPER_ADMIN' || user?.Role === 'ADMIN') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tulis Renungan</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {renungans.map((r) => (
          <GlassCard key={r.RenunganID} className="p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>{r.AyatAlkitab}</span>
              </span>
              <span className="text-[11px] text-slate-400">{r.Tanggal}</span>
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              {r.Judul}
            </h3>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {r.Isi}
            </p>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Penulis: <b>{r.Penulis}</b></span>
            </div>
          </GlassCard>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tulis Renungan Harian" maxWidth="md">
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Judul Renungan *</label>
            <input
              type="text"
              required
              value={formData.Judul}
              onChange={(e) => setFormData({ ...formData, Judul: e.target.value })}
              className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Ayat Alkitab *</label>
            <input
              type="text"
              required
              value={formData.AyatAlkitab}
              onChange={(e) => setFormData({ ...formData, AyatAlkitab: e.target.value })}
              placeholder="Contoh: Mazmur 23:1-6"
              className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Isi Renungan *</label>
            <textarea
              required
              rows={6}
              value={formData.Isi}
              onChange={(e) => setFormData({ ...formData, Isi: e.target.value })}
              className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-semibold text-slate-500">
              Batal
            </button>
            <button type="submit" className="px-5 py-2 bg-amber-600 text-white font-bold rounded-xl shadow">
              Terbitkan Renungan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
