import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  PlusCircle,
  Upload,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  LogOut,
  RefreshCw,
  Database,
  ShieldCheck,
  Link2,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { GlassCard } from './GlassCard';
import { Modal } from './Modal';
import {
  initGoogleAuth,
  signInWithGoogle,
  signOutGoogle,
  getGoogleAccessToken,
} from '../../services/googleAuth';
import {
  createChurchSpreadsheet,
  exportAllToGoogleSheets,
  importAllFromGoogleSheets,
  fetchSpreadsheetInfo,
  SheetDetails,
} from '../../services/googleSheetsApi';
import { getDatabase } from '../../services/db';
import { useNotifications } from '../../context/NotificationContext';

export const GoogleSheetsDirectIntegration: React.FC = () => {
  const { showToast } = useNotifications();

  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);

  const db = getDatabase();
  const savedSpreadsheetId = db.PENGATURAN?.GoogleSpreadsheetId || '';

  const [spreadsheetId, setSpreadsheetId] = useState<string>(savedSpreadsheetId);
  const [sheetDetails, setSheetDetails] = useState<SheetDetails | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processStatus, setProcessStatus] = useState<string>('');

  // Confirmation Modals
  const [confirmModalType, setConfirmModalType] = useState<'EXPORT' | 'IMPORT' | null>(null);

  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (user, accessToken) => {
        setGoogleUser(user);
        setToken(accessToken);
        setIsLoadingAuth(false);
      },
      () => {
        setGoogleUser(null);
        setToken(null);
        setIsLoadingAuth(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Fetch sheet info when token or spreadsheetId changes
  useEffect(() => {
    if (token && spreadsheetId.trim()) {
      fetchSpreadsheetInfo(token, spreadsheetId.trim())
        .then((details) => setSheetDetails(details))
        .catch(() => setSheetDetails(null));
    }
  }, [token, spreadsheetId]);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const res = await signInWithGoogle();
      if (res) {
        setGoogleUser(res.user);
        setToken(res.accessToken);
        showToast('Login Google Berhasil', `Terhubung sebagai ${res.user.displayName || res.user.email}`, 'success');
      }
    } catch (err: any) {
      showToast('Gagal Login Google', err.message || 'Gagal autentikasi Google', 'danger');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await signOutGoogle();
    setGoogleUser(null);
    setToken(null);
    setSheetDetails(null);
    showToast('Logout Google', 'Koneksi akun Google berhasil ditutup.', 'info');
  };

  const handleSaveSpreadsheetId = () => {
    const cleanId = spreadsheetId.trim();
    db.PENGATURAN.GoogleSpreadsheetId = cleanId;
    showToast('Spreadsheet ID Disimpan', 'ID Spreadsheet Google telah diperbarui.', 'success');

    if (token && cleanId) {
      fetchSpreadsheetInfo(token, cleanId)
        .then((details) => setSheetDetails(details))
        .catch((err) =>
          showToast('Peringatan Spreadsheet', `Tidak dapat memverifikasi ID: ${err.message}`, 'warning')
        );
    }
  };

  const handleCreateNewSheet = async () => {
    const currentToken = token || getGoogleAccessToken();
    if (!currentToken) {
      showToast('Autentikasi Diperlukan', 'Silakan Login dengan Google terlebih dahulu.', 'warning');
      return;
    }

    setIsProcessing(true);
    setProcessStatus('Membuat Spreadsheet Baru di Google Drive...');
    try {
      const details = await createChurchSpreadsheet(currentToken, 'GKI Kasih Sejahtera - Database CMS');
      setSpreadsheetId(details.spreadsheetId);
      setSheetDetails(details);
      showToast('Spreadsheet Dibuat', 'Spreadsheet baru berhasil dibuat di Google Drive Anda!', 'success');
    } catch (err: any) {
      showToast('Gagal Membuat Spreadsheet', err.message, 'danger');
    } finally {
      setIsProcessing(false);
      setProcessStatus('');
    }
  };

  const executeExport = async () => {
    const currentToken = token || getGoogleAccessToken();
    if (!currentToken || !spreadsheetId.trim()) return;

    setIsProcessing(true);
    setProcessStatus('Mengunggah & Memperbarui Data ke Google Sheets...');
    try {
      const res = await exportAllToGoogleSheets(currentToken, spreadsheetId.trim());
      showToast('Ekspor Berhasil', res.message, 'success');
    } catch (err: any) {
      showToast('Ekspor Gagal', err.message, 'danger');
    } finally {
      setIsProcessing(false);
      setProcessStatus('');
      setConfirmModalType(null);
    }
  };

  const executeImport = async () => {
    const currentToken = token || getGoogleAccessToken();
    if (!currentToken || !spreadsheetId.trim()) return;

    setIsProcessing(true);
    setProcessStatus('Membaca & Memperbarui Local Storage CMS...');
    try {
      const res = await importAllFromGoogleSheets(currentToken, spreadsheetId.trim());
      showToast('Impor Berhasil', res.message, 'success');
      // Refresh browser state
      setTimeout(() => window.location.reload(), 1200);
    } catch (err: any) {
      showToast('Impor Gagal', err.message, 'danger');
    } finally {
      setIsProcessing(false);
      setProcessStatus('');
      setConfirmModalType(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <GlassCard className="p-6 border-l-4 border-l-emerald-500">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  Integrasi Langsung Google Sheets API (OAuth 2.0)
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-300 dark:border-emerald-800">
                  Google Workspace
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hubungkan langsung akun Google Anda untuk membaca, membuat, dan menulis data CMS Gereja ke Google Sheets.
              </p>
            </div>
          </div>

          {/* Auth State Button */}
          {!googleUser ? (
            <button
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="gsi-material-button shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              <div className="gsi-material-button-state"></div>
              <div className="gsi-material-button-content-wrapper">
                <div className="gsi-material-button-icon">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    ></path>
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    ></path>
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    ></path>
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    ></path>
                  </svg>
                </div>
                <span className="gsi-material-button-contents">
                  {isSigningIn ? 'Menghubungkan...' : 'Sign in with Google'}
                </span>
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-3 bg-white/60 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-white/60 dark:border-white/10 backdrop-blur-md">
              <img
                src={
                  googleUser.photoURL ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
                }
                alt="Avatar"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/50"
              />
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                  <span>{googleUser.displayName || 'Pengguna Google'}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  {googleUser.email}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                title="Logout Google"
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Main Google Sheets Controls */}
      {googleUser ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Spreadsheet ID Management & New Creation */}
          <GlassCard className="p-6 space-y-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-emerald-500" />
                <span>Spreadsheet Google Drive Terhubung</span>
              </h4>
              <button
                onClick={handleCreateNewSheet}
                disabled={isProcessing}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Buat Spreadsheet Baru</span>
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Google Spreadsheet ID:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={spreadsheetId}
                  onChange={(e) => setSpreadsheetId(e.target.value)}
                  placeholder="Contoh: 1BxiMVs0XRnt3kgjZptm81SsYly-TDA2..."
                  className="flex-1 px-3.5 py-2.5 bg-white/80 dark:bg-slate-900/80 border border-white/60 dark:border-white/10 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={handleSaveSpreadsheetId}
                  className="px-4 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-xl hover:opacity-90"
                >
                  Simpan ID
                </button>
              </div>
            </div>

            {/* Active Sheet Card Details */}
            {sheetDetails ? (
              <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>{sheetDetails.title}</span>
                    </p>
                    <p className="text-[11px] font-mono text-slate-500 truncate max-w-sm mt-0.5">
                      ID: {sheetDetails.spreadsheetId}
                    </p>
                  </div>
                  <a
                    href={sheetDetails.spreadsheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1 hover:bg-emerald-500 transition-colors"
                  >
                    <span>Buka Sheet</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-500 self-center mr-1">
                    Tabs ditemukan ({sheetDetails.sheets.length}):
                  </span>
                  {sheetDetails.sheets.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-800"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ) : spreadsheetId ? (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  Spreadsheet ID terpasang belum diverifikasi atau belum dibuka aksesnya.
                </span>
              </div>
            ) : null}

            {/* Direct Sync Action Buttons */}
            <div className="pt-2 border-t border-white/40 dark:border-white/10 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setConfirmModalType('EXPORT')}
                disabled={isProcessing || !spreadsheetId.trim()}
                className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                <span>Ekspor CMS ke Google Sheets</span>
              </button>

              <button
                onClick={() => setConfirmModalType('IMPORT')}
                disabled={isProcessing || !spreadsheetId.trim()}
                className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Impor dari Google Sheets ke CMS</span>
              </button>
            </div>

            {isProcessing && (
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl flex items-center gap-2.5 text-xs text-indigo-700 dark:text-indigo-300 animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                <span className="font-semibold">{processStatus}</span>
              </div>
            )}
          </GlassCard>

          {/* Right Column: Google Workspace Info */}
          <GlassCard className="p-6 space-y-4">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-500" />
              <span>Status & Fitur API</span>
            </h4>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3 bg-white/50 dark:bg-slate-800/40 rounded-xl space-y-1 border border-white/40 dark:border-white/10">
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  Google Workspace OAuth 2.0
                </p>
                <p className="text-[11px] text-slate-500">
                  Aplikasi telah diberi izin langsung oleh akun Google Anda untuk mengelola file Spreadsheet.
                </p>
              </div>

              <div className="p-3 bg-white/50 dark:bg-slate-800/40 rounded-xl space-y-1 border border-white/40 dark:border-white/10">
                <p className="font-bold text-slate-900 dark:text-slate-100">Tabel Terfasilitasi</p>
                <p className="text-[11px] text-slate-500">
                  `JEMAAT`, `KEUANGAN`, `JADWAL`, `USERS`, `LOGS`, `PENGUMUMAN`, `RENUNGAN`, `DOA`, `INVENTARIS`, `PELAYANAN`
                </p>
              </div>

              <div className="p-3 bg-white/50 dark:bg-slate-800/40 rounded-xl space-y-1 border border-white/40 dark:border-white/10">
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  Terakhir Disinkronkan
                </p>
                <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  {db.PENGATURAN?.LastSyncTimestamp || 'Belum pernah disinkronkan'}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      ) : (
        <GlassCard className="p-8 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              Hubungkan Akun Google Anda
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Klik tombol &quot;Sign in with Google&quot; di kanan atas untuk mengaktifkan sinkronisasi langsung Google Sheets tanpa memerlukan setup script manual.
            </p>
          </div>
        </GlassCard>
      )}

      {/* Confirmation Modal for Export / Import Data */}
      <Modal
        isOpen={confirmModalType !== null}
        onClose={() => setConfirmModalType(null)}
        title={
          confirmModalType === 'EXPORT'
            ? 'Konfirmasi Ekspor Data ke Google Sheets'
            : 'Konfirmasi Impor Data dari Google Sheets'
        }
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {confirmModalType === 'EXPORT'
              ? 'Apakah Anda yakin ingin menimpa data pada Google Spreadsheet yang terhubung dengan seluruh data CMS gereja saat ini?'
              : 'Apakah Anda yakin ingin memperbarui data CMS LocalStorage dengan data terbaru yang dibaca dari Google Sheets?'}
          </p>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Tindakan ini akan memperbarui data spreadsheet / local storage Anda.</span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setConfirmModalType(null)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-200"
            >
              Batal
            </button>
            <button
              onClick={confirmModalType === 'EXPORT' ? executeExport : executeImport}
              className={`px-4 py-2 text-white text-xs font-bold rounded-xl shadow transition-all ${
                confirmModalType === 'EXPORT'
                  ? 'bg-indigo-600 hover:bg-indigo-500'
                  : 'bg-purple-600 hover:bg-purple-500'
              }`}
            >
              Ya, Lanjutkan {confirmModalType === 'EXPORT' ? 'Ekspor' : 'Impor'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
