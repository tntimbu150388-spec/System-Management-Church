import React from 'react';
import {
  Users,
  Calendar,
  UserCheck,
  DollarSign,
  Sparkles,
  Megaphone,
  Bell,
  CheckCircle,
  PlusCircle,
  Clock,
} from 'lucide-react';
import { StatsCard } from '../common/StatsCard';
import { GlassCard } from '../common/GlassCard';
import { getCollection } from '../../services/db';

interface AdminDashboardProps {
  setActiveTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ setActiveTab }) => {
  const jemaatList = getCollection('JEMAAT') || [];
  const jadwalList = getCollection('JADWAL') || [];
  const eventList = getCollection('EVENT') || [];
  const persembahanList = getCollection('PERSEMBAHAN') || [];
  const pengumumanList = getCollection('PENGUMUMAN') || [];

  const pendingJemaat = jemaatList.filter((j) => j.Status === 'Pending').length;
  const todayServices = jadwalList.filter((j) => j.Status === 'Jadwal');
  const totalPersembahanToday = persembahanList.reduce((sum, item) => sum + (item.Nominal || 0), 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
            Dashboard Sekretariat & Admin
          </span>
          <h2 className="text-2xl font-black mt-2">Pusat Pengelolaan Gereja</h2>
          <p className="text-xs text-blue-100 mt-1">
            Kelola data jemaat, pelayanan, persembahan, absensi, dan event gereja secara realtime.
          </p>
        </div>

        {pendingJemaat > 0 && (
          <div
            onClick={() => setActiveTab('jemaat')}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-2xl cursor-pointer transition-all flex items-center gap-2 shadow-lg"
          >
            <Users className="w-4 h-4" />
            <span>{pendingJemaat} Pendaftaran Baru Membutuhkan Persetujuan</span>
          </div>
        )}
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Jemaat"
          value={jemaatList.length}
          subtitle={`${pendingJemaat} Menunggu`}
          icon={Users}
          color="blue"
          onClick={() => setActiveTab('jemaat')}
        />
        <StatsCard
          title="Jadwal Ibadah"
          value={jadwalList.length}
          subtitle="Ibadah Mendatang"
          icon={Calendar}
          color="amber"
          onClick={() => setActiveTab('jadwal')}
        />
        <StatsCard
          title="Pelayan Hari Ini"
          value={12}
          subtitle="Tugas Ibadah"
          icon={UserCheck}
          color="indigo"
          onClick={() => setActiveTab('pelayanan')}
        />
        <StatsCard
          title="Persembahan"
          value={`Rp ${(totalPersembahanToday / 1000000).toFixed(1)}M`}
          subtitle="Terkumpul"
          icon={DollarSign}
          color="emerald"
          onClick={() => setActiveTab('keuangan')}
        />
        <StatsCard
          title="Event Gereja"
          value={eventList.length}
          subtitle="Kegiatan Aktif"
          icon={Sparkles}
          color="purple"
          onClick={() => setActiveTab('event')}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule & Minister Assignment */}
        <GlassCard className="p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>Jadwal Ibadah & Pelayan Hari Ini</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Penugasan Worship Leader, Musik, dan Tim Teknis
              </p>
            </div>
            <button
              onClick={() => setActiveTab('jadwal')}
              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center gap-1 hover:bg-blue-500 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Jadwal Baru</span>
            </button>
          </div>

          <div className="space-y-3">
            {todayServices.length > 0 ? (
              todayServices.map((j) => (
                <div
                  key={j.JadwalID}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold border border-blue-500/20">
                        {j.Jam}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {j.Ibadah}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      <b>Pelayanan:</b> {j.Pelayanan} ({j.Jemaat})
                    </p>
                    <p className="text-[11px] text-slate-400">Lokasi: {j.Lokasi || 'Gedung Utama'}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('jadwal')}
                      className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-xl hover:bg-emerald-500/20 transition-colors"
                    >
                      Catat Absensi
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">Tidak ada jadwal ibadah hari ini.</p>
            )}
          </div>
        </GlassCard>

        {/* Latest Announcements & Urgent Event */}
        <div className="space-y-6">
          <GlassCard className="p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-amber-500" />
                <span>Pengumuman Aktif</span>
              </h3>
              <button
                onClick={() => setActiveTab('pengumuman')}
                className="text-[11px] text-blue-500 font-bold hover:underline"
              >
                Kelola
              </button>
            </div>

            <div className="space-y-2.5">
              {pengumumanList.slice(0, 3).map((p) => (
                <div key={p.PengumumanID} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Target: {p.Target}</span>
                    <span>{p.Tanggal}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">{p.Judul}</h4>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>Event Gereja Terdekat</span>
            </h3>

            {eventList[0] && (
              <div className="space-y-2">
                <img
                  src={eventList[0].Gambar}
                  alt={eventList[0].Nama}
                  className="w-full h-28 object-cover rounded-xl"
                />
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{eventList[0].Nama}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  {eventList[0].Tanggal} • {eventList[0].Lokasi}
                </p>
                <button
                  onClick={() => setActiveTab('event')}
                  className="w-full py-2 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-500 transition-colors"
                >
                  Lihat Peserta Registered ({eventList[0].PesertaCount || 0})
                </button>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
