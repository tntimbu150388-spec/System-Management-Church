import React, { useState } from 'react';
import {
  Settings,
  Database,
  RefreshCw,
  Copy,
  CheckCircle2,
  Code2,
  Globe,
  FileCode,
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { Modal } from '../common/Modal';
import { GoogleSheetsDirectIntegration } from '../common/GoogleSheetsDirectIntegration';
import { getCollection, updateItem, syncWithGoogleSheets, getDatabase } from '../../services/db';
import { generateGoogleAppsScriptCode } from '../../services/gasExporter';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export const SystemSettingsModule: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const db = getDatabase();
  const currentUrlSetting = db.PENGATURAN?.GasWebAppUrl || '';

  const [gasUrl, setGasUrl] = useState(currentUrlSetting);
  const [syncing, setSyncing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

  const gasCode = generateGoogleAppsScriptCode();

  const handleSaveGasUrl = () => {
    db.PENGATURAN.GasWebAppUrl = gasUrl;
    showToast('Pengaturan Tersimpan', 'URL Google Apps Script telah diperbarui.', 'success');
  };

  const handleManualSync = async () => {
    setSyncing(true);
    const res = await syncWithGoogleSheets(gasUrl);
    setSyncing(false);

    if (res.success) {
      showToast('Sinkronisasi Berhasil', res.message, 'success');
    } else {
      showToast('Sinkronisasi Gagal', res.message, 'warning');
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(gasCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    showToast('Kode Disalin', 'Script Google Apps Script disalin ke clipboard.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Direct Google Sheets API Integration (OAuth 2.0) */}
      <GoogleSheetsDirectIntegration />

      {/* Top GAS Status Banner */}
      <GlassCard className="p-6 space-y-4 border-l-4 border-l-blue-600">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                Integrasi Database Google Sheets & Google Apps Script (GAS)
              </h3>
              <p className="text-xs text-slate-500">
                Data disinkronkan secara realtime antara PWA LocalStorage dan Google Sheets cloud.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCodeModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2"
          >
            <Code2 className="w-4 h-4" />
            <span>Lihat Kode Google Apps Script</span>
          </button>
        </div>

        {/* GAS Web App URL Config */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-blue-500" />
            <span>Google Apps Script Web App Deployment URL:</span>
          </label>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              value={gasUrl}
              onChange={(e) => setGasUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="flex-1 px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <button
              onClick={handleSaveGasUrl}
              className="px-4 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs rounded-xl hover:opacity-90 transition-opacity"
            >
              Simpan URL
            </button>
            <button
              onClick={handleManualSync}
              disabled={syncing}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Proses Sync...' : 'Sync Realtime Sekarang'}</span>
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Deployment Guide Steps */}
      <GlassCard className="p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <FileCode className="w-5 h-5 text-indigo-500" />
          <span>Panduan Deployment Google Apps Script (5 Langkah)</span>
        </h3>

        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black flex items-center justify-center shrink-0">
              1
            </span>
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100">Buat Google Spreadsheet Baru</p>
              <p className="text-[11px] text-slate-400">
                Buka Google Sheets di browser Anda dan buat Spreadsheet kosong. Script akan otomatis membuat 17 Sheet tab.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black flex items-center justify-center shrink-0">
              2
            </span>
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100">Buka Apps Script Editor</p>
              <p className="text-[11px] text-slate-400">
                Klik menu <b>Ekstensi</b> &gt; <b>Apps Script</b> pada Google Sheets Anda.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black flex items-center justify-center shrink-0">
              3
            </span>
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100">Paste Kode Script</p>
              <p className="text-[11px] text-slate-400">
                Hapus isi file <code>Code.gs</code> bawaan, lalu tempelkan (paste) seluruh kode dari tombol di atas.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black flex items-center justify-center shrink-0">
              4
            </span>
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100">Deploy sebagai Web App</p>
              <p className="text-[11px] text-slate-400">
                Klik <b>Deploy</b> &gt; <b>Deployment Baru</b> &gt; Pilih Jenis <b>Aplikasi Web</b>. Set "Who has access" ke <b>Siapa Saja (Anyone)</b>.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black flex items-center justify-center shrink-0">
              5
            </span>
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100">Salin Web App URL</p>
              <p className="text-[11px] text-slate-400">
                Salin URL Web App yang dihasilkan dan tempelkan pada kolom input URL di atas. Klik Simpan & Sync.
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Code Modal */}
      <Modal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        title="Kode Backend Google Apps Script (Code.gs)"
        maxWidth="3xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Salin seluruh kode JavaScript ini dan tempel ke Google Apps Script editor.
            </p>
            <button
              onClick={handleCopyCode}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Berhasil Disalin!' : 'Salin Semua Kode'}</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-950 text-slate-200 rounded-2xl text-[11px] font-mono h-96 overflow-y-auto leading-relaxed border border-slate-800">
            {gasCode}
          </pre>
        </div>
      </Modal>
    </div>
  );
};
