import React, { useState } from 'react';
import { FileText, Download, Printer, Filter, Calendar } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { getDatabase } from '../../services/db';

export const ReportsModule: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<'JEMAAT' | 'KEUANGAN' | 'ABSENSI' | 'INVENTARIS'>('JEMAAT');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  const db = getDatabase();

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let data: any[] = [];
    if (selectedReport === 'JEMAAT') data = db.JEMAAT;
    if (selectedReport === 'KEUANGAN') data = db.PERSEMBAHAN;
    if (selectedReport === 'ABSENSI') data = db.ABSENSI;
    if (selectedReport === 'INVENTARIS') data = db.INVENTARIS;

    if (!data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((row) => Object.values(row).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_${selectedReport}_Gereja.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <GlassCard className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
              Laporan Lengkap & Ekspor Data
            </h2>
            <p className="text-xs text-slate-500">Cetak dan unduh laporan resmi gereja</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor Excel / CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-xl shadow flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Laporan</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Pilih Jenis Laporan</label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value as any)}
              className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-semibold"
            >
              <option value="JEMAAT">Laporan Data Jemaat & Wilayah</option>
              <option value="KEUANGAN">Laporan Keuangan & Persembahan</option>
              <option value="ABSENSI">Laporan Absensi & Kehadiran Ibadah</option>
              <option value="INVENTARIS">Laporan Inventaris & Aset Gereja</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Dari Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-semibold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-semibold"
            />
          </div>
        </div>
      </GlassCard>

      {/* Printable Report Preview */}
      <GlassCard className="p-8 space-y-6 print:shadow-none print:border-none">
        <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-4 text-center space-y-1">
          <h1 className="text-xl font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
            Gereja Kristen Indonesia (GKI) Kasih Sejahtera
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Jl. Merdeka No. 45 Jakarta Pusat • Telp: (021) 555-1234 • Email: info@gkikasihsejahtera.org
          </p>
          <div className="pt-2">
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200">
              LAPORAN OFFICIAL: {selectedReport}
            </span>
          </div>
        </div>

        {/* Content depending on report */}
        {selectedReport === 'JEMAAT' && (
          <div className="space-y-4">
            <p className="text-xs font-bold text-slate-500">Total Jemaat Terdaftar: {db.JEMAAT.length} Jiwa</p>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-300 dark:border-slate-700 font-bold">
                  <th className="py-2">No</th>
                  <th className="py-2">Nama</th>
                  <th className="py-2">Gender</th>
                  <th className="py-2">Wilayah</th>
                  <th className="py-2">Status Baptis</th>
                  <th className="py-2">No HP</th>
                </tr>
              </thead>
              <tbody>
                {db.JEMAAT.map((j, idx) => (
                  <tr key={j.JemaatID} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-2">{idx + 1}</td>
                    <td className="py-2 font-bold">{j.Nama}</td>
                    <td className="py-2">{j.Gender}</td>
                    <td className="py-2">{j.Wilayah}</td>
                    <td className="py-2">{j.Baptis}</td>
                    <td className="py-2">{j.HP}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedReport === 'KEUANGAN' && (
          <div className="space-y-4">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-300 dark:border-slate-700 font-bold">
                  <th className="py-2">Tanggal</th>
                  <th className="py-2">Nama Jemaat</th>
                  <th className="py-2">Jenis</th>
                  <th className="py-2">Metode</th>
                  <th className="py-2">Nominal (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {db.PERSEMBAHAN.map((p) => (
                  <tr key={p.PersembahanID} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-2">{p.Tanggal}</td>
                    <td className="py-2 font-bold">{p.NamaJemaat}</td>
                    <td className="py-2">{p.Jenis}</td>
                    <td className="py-2">{p.Metode}</td>
                    <td className="py-2 font-bold text-emerald-600">Rp {p.Nominal?.toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="pt-12 flex justify-between text-xs text-slate-500 font-bold">
          <div>
            <p>Mengetahui,</p>
            <p className="pt-12 font-black">Ketua Majelis Gereja</p>
          </div>
          <div className="text-right">
            <p>Jakarta, {new Date().toLocaleDateString('id-ID')}</p>
            <p className="pt-12 font-black">Bendahara & Sekretariat</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
