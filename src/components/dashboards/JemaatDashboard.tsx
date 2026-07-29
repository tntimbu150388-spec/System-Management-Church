import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Sparkles,
  BookOpen,
  HeartHandshake,
  DollarSign,
  UserCheck,
  Megaphone,
  Bell,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { getCollection } from '../../services/db';

interface JemaatDashboardProps {
  setActiveTab: (tab: string) => void;
}

export const JemaatDashboard: React.FC<JemaatDashboardProps> = ({ setActiveTab }) => {
  const { user, jemaatProfile } = useAuth();

  const jadwalList = getCollection('JADWAL') || [];
  const renunganList = getCollection('RENUNGAN') || [];
  const pengumumanList = getCollection('PENGUMUMAN') || [];
  const persembahanList = getCollection('PERSEMBAHAN') || [];
  const eventList = getCollection('EVENT') || [];

  const myPersembahan = persembahanList.filter((p) => p.UserID === user?.UserID);
  const myNextService = jadwalList[0];
  const todayRenungan = renunganList[0];

  return (
    <div className="space-y-6">
      {/* Welcome Personal Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4 z-10">
          <img
            src={
              jemaatProfile?.Foto ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
            }
            alt={user?.Nama}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/30 shadow-lg shrink-0"
          />
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold uppercase tracking-wider">
              {jemaatProfile?.Wilayah || 'Jemaat Gereja'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black leading-snug">
              Selamat Datang, {user?.Nama}!
            </h2>
            <p className="text-xs text-blue-100 flex items-center gap-2">
              <span>Status Sakramen:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/30 font-bold text-[10px]">
                Baptis: {jemaatProfile?.Baptis || 'Ya'}
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-500/30 font-bold text-[10px]">
                Sidi: {jemaatProfile?.Sidi || 'Belum'}
              </span>
            </p>
          </div>
        </div>

        <div className="z-10 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('profil')}
            className="px-4 py-2.5 bg-white text-blue-700 font-bold text-xs rounded-2xl shadow-md hover:bg-blue-50 transition-all"
          >
            Lihat Profil Saya
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Next Schedule & Renungan */}
        <div className="lg:col-span-2 space-y-6">
          {/* Next Service / Duty Schedule Card */}
          <GlassCard className="p-6 space-y-4 border-l-4 border-l-blue-600">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                <span>Jadwal Ibadah & Pelayanan Berikutnya</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 text-xs font-bold">
                Mendatang
              </span>
            </div>

            {myNextService ? (
              <div className="p-4 rounded-2xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-lg font-black text-slate-900 dark:text-slate-100">
                    {myNextService.Ibadah}
                  </h4>
                  <span className="px-3 py-1 rounded-xl bg-blue-600 text-white font-extrabold text-xs">
                    {myNextService.Tanggal} • {myNextService.Jam}
                  </span>
                </div>

                <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <p className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <b>Tugas Pelayanan:</b> {myNextService.Pelayanan}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                    <b>Lokasi:</b> {myNextService.Lokasi || 'Gedung Utama Lt. 1'}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <b>Petugas WL / Pemusik:</b> {myNextService.Jemaat}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4">Belum ada jadwal ibadah terdekat.</p>
            )}

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setActiveTab('jadwal_jemaat')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
              >
                Lihat Seluruh Jadwal <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </GlassCard>

          {/* Daily Devotional (Renungan Hari Ini) */}
          {todayRenungan && (
            <GlassCard className="p-6 space-y-3 bg-gradient-to-br from-amber-500/5 via-slate-900/5 to-slate-900/0">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                  <BookOpen className="w-5 h-5" />
                  <span>Renungan Hari Ini</span>
                </div>
                <span className="text-[11px] text-slate-400">{todayRenungan.Tanggal}</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                  {todayRenungan.Judul}
                </h3>
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 italic">
                  Ayat Alkitab: {todayRenungan.AyatAlkitab}
                </p>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                  "{todayRenungan.Isi}"
                </p>
                <p className="text-[11px] text-slate-400 font-medium">
                  Penulis: {todayRenungan.Penulis}
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('renungan')}
                  className="px-4 py-2 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold text-xs rounded-xl hover:bg-amber-500/20 transition-colors"
                >
                  Baca Artikel & Renungan Lainnya
                </button>
              </div>
            </GlassCard>
          )}
        </div>

        {/* Right Column: Quick Links, Prayer & Offering History */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <GlassCard className="p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Quick Actions Jemaat</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveTab('persembahan_jemaat')}
                className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex flex-col items-center gap-1.5 hover:bg-emerald-500/20 transition-all"
              >
                <DollarSign className="w-5 h-5" />
                <span>Persembahan Saya</span>
              </button>

              <button
                onClick={() => setActiveTab('doa_jemaat')}
                className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs flex flex-col items-center gap-1.5 hover:bg-rose-500/20 transition-all"
              >
                <HeartHandshake className="w-5 h-5" />
                <span>Permohonan Doa</span>
              </button>
            </div>
          </GlassCard>

          {/* Persembahan Summary Card */}
          <GlassCard className="p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span>Riwayat Persembahan Saya</span>
              </h3>
              <button
                onClick={() => setActiveTab('persembahan_jemaat')}
                className="text-[11px] font-bold text-blue-500 hover:underline"
              >
                Detail
              </button>
            </div>

            <div className="space-y-2">
              {myPersembahan.length > 0 ? (
                myPersembahan.slice(0, 3).map((p) => (
                  <div
                    key={p.PersembahanID}
                    className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{p.Jenis}</p>
                      <p className="text-[10px] text-slate-400">
                        {p.Tanggal} • {p.Metode}
                      </p>
                    </div>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                      Rp {p.Nominal?.toLocaleString('id-ID')}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-2">Belum ada riwayat persembahan.</p>
              )}
            </div>
          </GlassCard>

          {/* Announcements & Upcoming Events */}
          <GlassCard className="p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-amber-500" />
                <span>Pengumuman Terbaru</span>
              </h3>
            </div>

            <div className="space-y-2">
              {pengumumanList.slice(0, 2).map((p) => (
                <div key={p.PengumumanID} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
                  <p className="text-[10px] text-slate-400">{p.Tanggal}</p>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{p.Judul}</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">{p.Isi}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
