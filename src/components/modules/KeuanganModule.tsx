import React, { useState } from 'react';
import {
  DollarSign,
  PlusCircle,
  QrCode,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  PieChart,
} from 'lucide-react';
import { DataTable, Column } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { GlassCard } from '../common/GlassCard';
import { Persembahan, Keuangan, JenisPersembahan } from '../../types';
import { getCollection, addItem } from '../../services/db';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export const KeuanganModule: React.FC = () => {
  const { user, role } = useAuth();
  const { showToast } = useNotifications();

  const [persembahans, setPersembahans] = useState<Persembahan[]>(
    () => getCollection('PERSEMBAHAN') || []
  );
  const [keuangans, setKeuangans] = useState<Keuangan[]>(
    () => getCollection('KEUANGAN') || []
  );

  const [isModalPersembahanOpen, setIsModalPersembahanOpen] = useState(false);
  const [isModalQrisOpen, setIsModalQrisOpen] = useState(false);

  const [formPersembahan, setFormPersembahan] = useState({
    Jenis: 'Perpuluhan' as JenisPersembahan,
    Nominal: 500000,
    Metode: 'QRIS' as 'QRIS' | 'Transfer Bank' | 'Tunai' | 'Debit',
    Catatan: '',
  });

  const refreshData = () => {
    setPersembahans(getCollection('PERSEMBAHAN') || []);
    setKeuangans(getCollection('KEUANGAN') || []);
  };

  const totalPersembahan = persembahans.reduce((sum, item) => sum + (item.Nominal || 0), 0);
  const totalPemasukan = keuangans
    .filter((k) => k.Jenis === 'Pemasukan')
    .reduce((sum, item) => sum + (item.Nominal || 0), 0);
  const totalPengeluaran = keuangans
    .filter((k) => k.Jenis === 'Pengeluaran')
    .reduce((sum, item) => sum + (item.Nominal || 0), 0);

  const handleSavePersembahan = (e: React.FormEvent) => {
    e.preventDefault();
    const newP: Persembahan = {
      PersembahanID: 'PSB-' + Date.now().toString().slice(-5),
      UserID: user?.UserID || 'USR-003',
      NamaJemaat: user?.Nama || 'Jemaat Gereja',
      Jenis: formPersembahan.Jenis,
      Nominal: Number(formPersembahan.Nominal),
      Tanggal: new Date().toISOString().slice(0, 10),
      Metode: formPersembahan.Metode,
      Catatan: formPersembahan.Catatan,
    };

    addItem('PERSEMBAHAN', newP, user?.UserID, user?.Nama);
    refreshData();
    setIsModalPersembahanOpen(false);
    showToast('Persembahan Ter-record', 'Terima kasih atas persembahan Anda.', 'success');
  };

  const persembahanColumns: Column<Persembahan>[] = [
    {
      header: 'ID & Tanggal',
      accessorKey: 'Tanggal',
      cell: (item) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-slate-100">{item.Tanggal}</p>
          <p className="text-[10px] text-slate-400">{item.PersembahanID}</p>
        </div>
      ),
    },
    { header: 'Nama Jemaat', accessorKey: 'NamaJemaat' },
    {
      header: 'Jenis Persembahan',
      accessorKey: 'Jenis',
      cell: (item) => (
        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-500/20">
          {item.Jenis}
        </span>
      ),
    },
    {
      header: 'Nominal',
      accessorKey: 'Nominal',
      sortable: true,
      cell: (item) => (
        <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
          Rp {Number(item.Nominal).toLocaleString('id-ID')}
        </span>
      ),
    },
    { header: 'Metode', accessorKey: 'Metode' },
    { header: 'Catatan', accessorKey: 'Catatan' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Financial Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="p-5 border-l-4 border-l-emerald-500 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
            <span>Total Persembahan</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">
            Rp {totalPersembahan.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-slate-400">Termasuk perpuluhan, diakonia & misi</p>
        </GlassCard>

        <GlassCard className="p-5 border-l-4 border-l-blue-500 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
            <span>Kas Pemasukan Total</span>
            <ArrowUpRight className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">
            Rp {totalPemasukan.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-slate-400">Total penerimaan kas gereja</p>
        </GlassCard>

        <GlassCard className="p-5 border-l-4 border-l-rose-500 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
            <span>Kas Pengeluaran</span>
            <ArrowDownRight className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">
            Rp {totalPengeluaran.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-slate-400">Biaya operasional & pemeliharaan</p>
        </GlassCard>
      </div>

      {/* Action QRIS Bar */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div>
          <h3 className="text-lg font-black">Persembahan QRIS & Transfer Digital</h3>
          <p className="text-xs text-emerald-100 mt-0.5">
            Mendukung pembayaran scan QRIS standar Bank Indonesia (BCA, Mandiri, BRI, GoPay, OVO, Dana).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalQrisOpen(true)}
            className="px-4 py-2.5 bg-white text-emerald-800 font-bold text-xs rounded-2xl shadow hover:bg-emerald-50 transition-all flex items-center gap-1.5"
          >
            <QrCode className="w-4 h-4" />
            <span>Tampilkan Kode QRIS</span>
          </button>

          <button
            onClick={() => setIsModalPersembahanOpen(true)}
            className="px-4 py-2.5 bg-emerald-900/40 text-white border border-white/30 font-bold text-xs rounded-2xl hover:bg-emerald-900/60 transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Input Persembahan</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        data={persembahans}
        columns={persembahanColumns}
        title="Catatan Persembahan Jemaat"
        exportFileName="Persembahan_GKI"
      />

      {/* Modal Input Persembahan */}
      <Modal
        isOpen={isModalPersembahanOpen}
        onClose={() => setIsModalPersembahanOpen(false)}
        title="Input Catatan Persembahan Baru"
        maxWidth="md"
      >
        <form onSubmit={handleSavePersembahan} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Jenis Persembahan</label>
            <select
              value={formPersembahan.Jenis}
              onChange={(e) =>
                setFormPersembahan({ ...formPersembahan, Jenis: e.target.value as any })
              }
              className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium"
            >
              <option value="Perpuluhan">Perpuluhan</option>

              <option value="Persembahan Umum">Persembahan Umum</option>
              <option value="Diakonia">Diakonia (Bantuan Sosial)</option>
              <option value="Misi">Misi & Penginjilan</option>
              <option value="Pembangunan">Pembangunan Gedung</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Nominal (Rp) *</label>
            <input
              type="number"
              required
              min={1000}
              value={formPersembahan.Nominal}
              onChange={(e) =>
                setFormPersembahan({ ...formPersembahan, Nominal: Number(e.target.value) })
              }
              className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold text-sm text-emerald-600"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Metode Pembayaran</label>
            <select
              value={formPersembahan.Metode}
              onChange={(e) =>
                setFormPersembahan({ ...formPersembahan, Metode: e.target.value as any })
              }
              className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium"
            >
              <option value="QRIS">QRIS</option>
              <option value="Transfer Bank">Transfer Bank</option>
              <option value="Tunai">Tunai</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Catatan / Keterangan</label>
            <input
              type="text"
              placeholder="Contoh: Perpuluhan Bulan Juli 2026"
              value={formPersembahan.Catatan}
              onChange={(e) => setFormPersembahan({ ...formPersembahan, Catatan: e.target.value })}
              className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalPersembahanOpen(false)}
              className="px-4 py-2 font-semibold text-slate-500"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow"
            >
              Simpan Persembahan
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal QRIS Display */}
      <Modal
        isOpen={isModalQrisOpen}
        onClose={() => setIsModalQrisOpen(false)}
        title="QRIS Resmi Gereja GKI Kasih Sejahtera"
        maxWidth="sm"
      >
        <div className="text-center space-y-4 py-2">
          <div className="p-4 bg-white rounded-2xl shadow-inner inline-block border border-slate-200">
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=00020101021126580014ID.LINKAJA.WWW011893600911002202607285204581253033605405100005802ID5921GKI%20KASIH%20SEJAHTERA6007JAKARTA61051011063048B01"
              alt="QRIS Gereja"
              className="w-48 h-48 mx-auto"
            />
          </div>
          <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
            <p className="font-bold text-slate-900 dark:text-slate-100">
              NMID: ID1020260728520
            </p>
            <p>Scan menggunakan m-Banking or e-Wallet pilihan Anda.</p>
            <p className="text-[10px] text-slate-400">
              No. Rekening BCA: <b>123-456-7890</b> a.n. GKI Kasih Sejahtera
            </p>
          </div>
          <button
            onClick={() => setIsModalQrisOpen(false)}
            className="w-full py-2 bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs rounded-xl"
          >
            Tutup
          </button>
        </div>
      </Modal>
    </div>
  );
};
