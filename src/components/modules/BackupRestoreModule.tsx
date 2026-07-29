import React, { useState } from 'react';
import { Database, Download, Upload, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { getDatabase, saveDatabase, resetDatabaseToDefault } from '../../services/db';
import { useNotifications } from '../../context/NotificationContext';

export const BackupRestoreModule: React.FC = () => {
  const { showToast } = useNotifications();
  const [jsonString, setJsonString] = useState('');

  const handleBackupDownload = () => {
    const db = getDatabase();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(db, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Backup_Database_CMS_Gereja_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Backup Diunduh', 'File database JSON telah tersimpan ke komputer Anda.', 'success');
  };

  const handleRestoreJSON = () => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed === 'object') {
        saveDatabase(parsed);
        showToast('Restore Berhasil', 'Database berhasil dipulihkan dari file JSON.', 'success');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        showToast('Format Salah', 'Data JSON tidak valid.', 'warning');
      }
    } catch (e) {
      showToast('Error Restore', 'Gagal membaca format JSON.', 'warning');
    }
  };

  const handleResetFactory = () => {
    if (window.confirm('PERHATIAN! Apakah Anda yakin ingin mereset seluruh database ke data awal?')) {
      resetDatabaseToDefault();
      showToast('Database Direset', 'Database telah dikembalikan ke data awal demo.', 'info');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup Card */}
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 text-blue-600 rounded-2xl">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                Backup Database
              </h3>
              <p className="text-xs text-slate-500">
                Ekspor seluruh 17 tabel database ke file `.json` lokal.
              </p>
            </div>
          </div>

          <button
            onClick={handleBackupDownload}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Unduh File Backup Database (.json)</span>
          </button>
        </GlassCard>

        {/* Reset Card */}
        <GlassCard className="p-6 space-y-4 border-l-4 border-l-rose-500">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-500/10 text-rose-600 rounded-2xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                Reset Factory Default
              </h3>
              <p className="text-xs text-slate-500">
                Kembalikan database ke data awal demo (Hapus semua perubahan).
              </p>
            </div>
          </div>

          <button
            onClick={handleResetFactory}
            className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Reset Seluruh Data ke Default</span>
          </button>
        </GlassCard>
      </div>

      {/* Restore Area */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 text-purple-600 rounded-2xl">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              Restore Database
            </h3>
            <p className="text-xs text-slate-500">
              Tempelkan teks format JSON hasil backup untuk memulihkan database.
            </p>
          </div>
        </div>

        <textarea
          rows={6}
          value={jsonString}
          onChange={(e) => setJsonString(e.target.value)}
          placeholder="Tempel isi JSON backup di sini..."
          className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-mono"
        />

        <button
          onClick={handleRestoreJSON}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow transition-all"
        >
          Restore Sekarang
        </button>
      </GlassCard>
    </div>
  );
};
