import React, { useState } from 'react';
import { HeartHandshake, PlusCircle, CheckCircle, Clock } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { Modal } from '../common/Modal';
import { Doa } from '../../types';
import { getCollection, addItem, updateItem } from '../../services/db';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export const DoaModule: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [doas, setDoas] = useState<Doa[]>(() => getCollection('DOA') || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    Judul: '',
    Isi: '',
    Kategori: 'Kesehatan' as any,
  });

  const refreshData = () => {
    setDoas(getCollection('DOA') || []);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newD: Doa = {
      DoaID: 'DOA-' + Date.now().toString().slice(-5),
      UserID: user?.UserID || 'USR-003',
      NamaPemohon: user?.Nama || 'Jemaat Anonim',
      Isi: formData.Isi,
      Tanggal: new Date().toISOString().slice(0, 10),
      Status: 'Pending',
      Kategori: formData.Kategori,
    };

    addItem('DOA', newD, user?.UserID, user?.Nama);
    refreshData();
    setIsModalOpen(false);
    showToast('Doa Dikirim', 'Tim pendoa akan mendoakan permohonan Anda.', 'success');
  };

  const handleUpdateStatus = (doaId: string, status: any) => {
    updateItem('DOA', 'DoaID', doaId, { Status: status }, user?.UserID, user?.Nama);
    refreshData();
    showToast('Status Diperbarui', `Pokok doa diperbarui ke ${status}`, 'info');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
            Permohonan & Doa Syafaat
          </h2>
          <p className="text-xs text-slate-500">Dukungan doa antar jemaat dan tim pendoa gereja</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Kirim Permohonan Doa</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {doas.map((d) => (
          <GlassCard key={d.DoaID} className="p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-extrabold border border-rose-500/20">
                {d.Kategori}
              </span>
              <span className="text-[11px] text-slate-400">{d.Tanggal}</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              "{d.Isi}"
            </p>

            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-500">Oleh: {d.NamaPemohon}</span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleUpdateStatus(d.DoaID, 'Dalam Doa')}
                  className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 font-bold text-[11px]"
                >
                  Didoakan
                </button>
                <button
                  onClick={() => handleUpdateStatus(d.DoaID, 'Terjawab')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 font-bold text-[11px]"
                >
                  Terjawab
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Kirim Permohonan Doa" maxWidth="md">
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Kategori</label>
            <select
              value={formData.Kategori}
              onChange={(e) => setFormData({ ...formData, Kategori: e.target.value as any })}
              className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            >
              <option value="Kesehatan">Kesehatan & Pemulihan</option>
              <option value="Keluarga">Keluarga & Pernikahan</option>
              <option value="Pekerjaan">Pekerjaan & Usaha</option>
              <option value="Pendidikan">Pendidikan & Studi</option>
              <option value="Syukur">Ucapan Syukur</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Detail Permohonan *</label>
            <textarea
              required
              rows={4}
              value={formData.Isi}
              onChange={(e) => setFormData({ ...formData, Isi: e.target.value })}
              placeholder="Ceritakan detail permohonan doa Anda..."
              className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-semibold text-slate-500">
              Batal
            </button>
            <button type="submit" className="px-5 py-2 bg-rose-600 text-white font-bold rounded-xl shadow">
              Kirim Doa
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
