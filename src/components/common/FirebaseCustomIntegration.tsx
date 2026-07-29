import React, { useState } from 'react';
import {
  Flame,
  ShieldCheck,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  HelpCircle,
  Copy,
  Info,
  Sliders,
  Database,
  Lock,
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { getDatabase, saveDatabase } from '../../services/db';
import { testFirebaseConnection, getActiveFirebaseConfig, pushToFirestore } from '../../services/firebase';
import { useNotifications } from '../../context/NotificationContext';
import { FirebaseCustomConfig } from '../../types';

export const FirebaseCustomIntegration: React.FC = () => {
  const { showToast } = useNotifications();
  const db = getDatabase();
  const activeConfig = getActiveFirebaseConfig();

  const initialCustomConfig: FirebaseCustomConfig = db.PENGATURAN?.FirebaseCustomConfig || {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    databaseURL: '',
    firestoreDatabaseId: '(default)',
    enabled: false,
  };

  const [config, setConfig] = useState<FirebaseCustomConfig>(initialCustomConfig);
  const [testing, setTesting] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);

  const firestoreSecurityRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;

  const handleChange = (field: keyof FirebaseCustomConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (config.enabled && (!config.apiKey?.trim() || !config.projectId?.trim())) {
      showToast(
        'Inkomplit',
        'API Key dan Project ID wajib diisi jika ingin mengaktifkan Firebase Custom.',
        'warning'
      );
      return;
    }

    db.PENGATURAN.FirebaseCustomConfig = {
      apiKey: config.apiKey?.trim() || '',
      authDomain: config.authDomain?.trim() || '',
      projectId: config.projectId?.trim() || '',
      storageBucket: config.storageBucket?.trim() || '',
      messagingSenderId: config.messagingSenderId?.trim() || '',
      appId: config.appId?.trim() || '',
      databaseURL: config.databaseURL?.trim() || '',
      firestoreDatabaseId: config.firestoreDatabaseId?.trim() || '(default)',
      enabled: !!config.enabled,
    };

    saveDatabase(db);
    pushToFirestore(db);

    showToast(
      'Pengaturan Tersimpan',
      config.enabled
        ? `Firebase Custom "${config.projectId}" kini aktif sebagai database cloud utama!`
        : 'Firebase disetel kembali ke konfigurasi default sistem.',
      'success'
    );
  };

  const handleTestConnection = async () => {
    if (!config.apiKey?.trim() || !config.projectId?.trim()) {
      showToast('Kredensial Belum Lengkap', 'Masukkan minimal API Key dan Project ID.', 'warning');
      return;
    }

    setTesting(true);
    const result = await testFirebaseConnection(config);
    setTesting(false);

    if (result.success) {
      showToast('Koneksi Sukses!', result.message, 'success');
    } else {
      showToast('Koneksi Gagal', result.message, 'warning');
    }
  };

  const handleResetDefault = () => {
    const resetCfg: FirebaseCustomConfig = {
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: '',
      databaseURL: '',
      firestoreDatabaseId: '(default)',
      enabled: false,
    };

    setConfig(resetCfg);
    db.PENGATURAN.FirebaseCustomConfig = resetCfg;
    saveDatabase(db);

    showToast('Reset Berhasil', 'Konfigurasi Firebase custom dikosongkan dan disetel ke default.', 'info');
  };

  const handleCopyRules = () => {
    navigator.clipboard.writeText(firestoreSecurityRules);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 2500);
    showToast('Rules Disalin', 'Aturan keamanan Firestore disalin ke clipboard.', 'info');
  };

  return (
    <GlassCard className="p-6 space-y-6 border-l-4 border-l-amber-500">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-500/20">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                Integrasi Firebase Custom (Project Google Cloud/Firebase Mandiri)
              </h3>
              {activeConfig.isCustom ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Custom Aktif
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                  Default System
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Gunakan akun Google Firebase milik gereja sendiri untuk kontrol penuh atas database Firestore & Realtime Cloud Sync.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowGuide(!showGuide)}
          className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 shrink-0"
        >
          <HelpCircle className="w-4 h-4 text-amber-500" />
          <span>{showGuide ? 'Sembunyikan Panduan' : 'Panduan Membuat Firebase'}</span>
        </button>
      </div>

      {/* Guide Section */}
      {showGuide && (
        <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Langkah Membuat Project Firebase Gratis di Google Console
            </h4>
            <a
              href="https://console.firebase.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              Buka Firebase Console <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300">
            <li className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-extrabold text-amber-600 dark:text-amber-400">1. Buat Project Firebase</span>
              <p className="text-[11px] text-slate-500">
                Masuk ke <b>console.firebase.google.com</b> &gt; Klik "Add Project" / "Tambah Proyek" &gt; Masukkan nama gereja Anda.
              </p>
            </li>
            <li className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-extrabold text-amber-600 dark:text-amber-400">2. Aktifkan Firestore Database</span>
              <p className="text-[11px] text-slate-500">
                Pilih menu <b>Build</b> &gt; <b>Firestore Database</b> &gt; Klik "Create Database" (Pilih lokasi terdekat seperti <i>asia-southeast1</i>).
              </p>
            </li>
            <li className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-extrabold text-amber-600 dark:text-amber-400">3. Setel Security Rules Firestore</span>
              <p className="text-[11px] text-slate-500">
                Di tab <b>Rules</b> Firestore, izinkan baca & tulis agar PWA dapat menyinkronkan data.
              </p>
            </li>
            <li className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-extrabold text-amber-600 dark:text-amber-400">4. Tambahkan Web App (&lt;/&gt;)</span>
              <p className="text-[11px] text-slate-500">
                Buka Project Settings (ikon gerigi) &gt; General &gt; Tambahkan Web App &gt; Salin objek <code>firebaseConfig</code>.
              </p>
            </li>
          </ol>

          {/* Firestore Rules Snippet */}
          <div className="p-3 bg-slate-950 rounded-xl text-[11px] font-mono text-slate-300 space-y-2 border border-slate-800">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Lock className="w-3.5 h-3.5" />
                Firestore Security Rules (Copy & Paste ke Console Firebase):
              </span>
              <button
                onClick={handleCopyRules}
                className="px-2.5 py-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 rounded-lg transition-colors flex items-center gap-1"
              >
                {copiedRules ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedRules ? 'Disalin!' : 'Salin Rules'}</span>
              </button>
            </div>
            <pre className="text-[10px] leading-relaxed text-amber-200/90">{firestoreSecurityRules}</pre>
          </div>
        </div>
      )}

      {/* Enable Toggle */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl flex items-center justify-between border border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">
            Gunakan Project Firebase Custom
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Aktifkan untuk mengalihkan realtime cloud sync dari sistem bawaan ke Firestore milik Anda.
          </span>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={!!config.enabled}
            onChange={(e) => handleChange('enabled', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-amber-500"></div>
        </label>
      </div>

      {/* Credentials Input Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Project ID */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <span>Project ID</span>
            <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={config.projectId || ''}
            onChange={(e) => handleChange('projectId', e.target.value)}
            placeholder="contoh: gereja-kasih-sejahtera"
            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* API Key */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <span>API Key</span>
            <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={config.apiKey || ''}
            onChange={(e) => handleChange('apiKey', e.target.value)}
            placeholder="AIzaSy..."
            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Auth Domain */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Auth Domain</label>
          <input
            type="text"
            value={config.authDomain || ''}
            onChange={(e) => handleChange('authDomain', e.target.value)}
            placeholder="gereja-kasih-sejahtera.firebaseapp.com"
            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Storage Bucket */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Storage Bucket</label>
          <input
            type="text"
            value={config.storageBucket || ''}
            onChange={(e) => handleChange('storageBucket', e.target.value)}
            placeholder="gereja-kasih-sejahtera.appspot.com"
            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Messaging Sender ID */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Messaging Sender ID
          </label>
          <input
            type="text"
            value={config.messagingSenderId || ''}
            onChange={(e) => handleChange('messagingSenderId', e.target.value)}
            placeholder="123456789012"
            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* App ID */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">App ID</label>
          <input
            type="text"
            value={config.appId || ''}
            onChange={(e) => handleChange('appId', e.target.value)}
            placeholder="1:123456789012:web:abcdef123456"
            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Database URL */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Database URL (Opsional)
          </label>
          <input
            type="text"
            value={config.databaseURL || ''}
            onChange={(e) => handleChange('databaseURL', e.target.value)}
            placeholder="https://gereja-kasih-sejahtera.firebaseio.com"
            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Firestore Database ID */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Firestore Database ID
          </label>
          <input
            type="text"
            value={config.firestoreDatabaseId || '(default)'}
            onChange={(e) => handleChange('firestoreDatabaseId', e.target.value)}
            placeholder="(default)"
            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={handleResetDefault}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-colors"
        >
          Reset ke Default
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing}
            className="px-4 py-2.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 font-bold text-xs rounded-xl border border-amber-500/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? 'Menguji Koneksi...' : 'Uji Koneksi Firebase'}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Konfigurasi Firebase</span>
          </button>
        </div>
      </div>
    </GlassCard>
  );
};
