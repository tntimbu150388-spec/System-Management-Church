import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../common/GlassCard';
import { User, Lock, KeyRound, ShieldCheck, Home, CheckCircle2 } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { updateItem } from '../../services/db';

export const ProfileModule: React.FC = () => {
  const { user, jemaatProfile, refreshProfile } = useAuth();
  const { showToast } = useNotifications();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [fotoUrl, setFotoUrl] = useState(
    jemaatProfile?.Foto ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  );

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Error', 'Password baru dan konfirmasi tidak cocok.', 'warning');
      return;
    }

    if (user?.UserID) {
      updateItem('USERS', 'UserID', user.UserID, { Password: newPassword }, user.UserID, user.Nama);
      showToast('Password Berhasil Diubah', 'Password akun Anda telah diperbarui.', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleSavePhoto = () => {
    if (jemaatProfile?.JemaatID) {
      updateItem('JEMAAT', 'JemaatID', jemaatProfile.JemaatID, { Foto: fotoUrl }, user?.UserID, user?.Nama);
      refreshProfile();
      showToast('Foto Diperbarui', 'Foto profil Anda berhasil diubah.', 'success');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Card Header */}
      <GlassCard className="p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group">
          <img
            src={fotoUrl}
            alt={user?.Nama}
            className="w-24 h-24 rounded-3xl object-cover border-2 border-blue-500 shadow-xl"
          />
        </div>

        <div className="space-y-2 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="px-3 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold uppercase">
              {user?.Role}
            </span>
            <span className="px-3 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
              {jemaatProfile?.Wilayah || 'Wilayah I - Pusat'}
            </span>
          </div>

          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">{user?.Nama}</h2>
          <p className="text-xs text-slate-500">
            Username: <b>@{user?.Username}</b> • Status: <span className="text-emerald-500 font-bold">{user?.Status}</span>
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
            <input
              type="text"
              value={fotoUrl}
              onChange={(e) => setFotoUrl(e.target.value)}
              placeholder="URL Foto Baru"
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs flex-1 max-w-xs"
            />
            <button
              onClick={handleSavePhoto}
              className="px-3.5 py-1.5 bg-blue-600 text-white font-bold rounded-xl text-xs shadow"
            >
              Ubah Foto
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Detail Jemaat Data */}
      {jemaatProfile && (
        <GlassCard className="p-6 space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" />
            <span>Data Lengkap Jemaat</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
              <span className="text-slate-400 font-semibold">NIK (Nomor Induk Kependudukan)</span>
              <p className="font-bold text-slate-900 dark:text-slate-100">{jemaatProfile.NIK || '-'}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
              <span className="text-slate-400 font-semibold">Nomor Kartu Keluarga (KK)</span>
              <p className="font-bold text-slate-900 dark:text-slate-100">{jemaatProfile.KK || '-'}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
              <span className="text-slate-400 font-semibold">No. HP / WhatsApp</span>
              <p className="font-bold text-slate-900 dark:text-slate-100">{jemaatProfile.HP || '-'}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
              <span className="text-slate-400 font-semibold">Email</span>
              <p className="font-bold text-slate-900 dark:text-slate-100">{jemaatProfile.Email || '-'}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
              <span className="text-slate-400 font-semibold">Status Baptis</span>
              <p className="font-bold text-emerald-600">{jemaatProfile.Baptis} ({jemaatProfile.TanggalBaptis || 'Terdaftar'})</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
              <span className="text-slate-400 font-semibold">Status Sidi</span>
              <p className="font-bold text-blue-600">{jemaatProfile.Sidi}</p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Change Password Card */}
      <GlassCard className="p-6 space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-purple-500" />
          <span>Ubah Password Akun</span>
        </h3>

        <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs max-w-md">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Password Baru *</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Konfirmasi Password Baru *</label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow transition-all"
          >
            Update Password
          </button>
        </form>
      </GlassCard>
    </div>
  );
};
