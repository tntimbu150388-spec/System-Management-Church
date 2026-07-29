import React from 'react';
import {
  Users,
  UserCheck,
  ShieldAlert,
  Layers,
  Sparkles,
  DollarSign,
  Calendar,
  Activity,
  ArrowUpRight,
  Database,
  Settings,
  FileText,
} from 'lucide-react';
import { StatsCard } from '../common/StatsCard';
import { GlassCard } from '../common/GlassCard';
import { JemaatGrowthChart } from '../charts/JemaatGrowthChart';
import { PersembahanChart } from '../charts/PersembahanChart';
import { AttendanceChart } from '../charts/AttendanceChart';
import { getCollection } from '../../services/db';

interface SuperAdminDashboardProps {
  setActiveTab: (tab: string) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ setActiveTab }) => {
  const jemaatList = getCollection('JEMAAT') || [];
  const usersList = getCollection('USERS') || [];
  const komisiList = getCollection('KOMISI') || [];
  const eventList = getCollection('EVENT') || [];
  const persembahanList = getCollection('PERSEMBAHAN') || [];
  const logList = getCollection('LOG_AKTIVITAS') || [];

  const totalJemaat = jemaatList.length;
  const totalPelayan = 18; // active servants count
  const totalAdmin = usersList.filter((u) => u.Role === 'ADMIN' || u.Role === 'SUPER_ADMIN').length;
  const totalKomisi = komisiList.length;
  const totalEvent = eventList.length;

  const totalPersembahanNominal = persembahanList.reduce((sum, item) => sum + (item.Nominal || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
            Super Admin Control Center
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-2">Executive Church Dashboard</h2>
          <p className="text-xs text-blue-100 mt-1 max-w-xl">
            Ringkasan statistik pertumbuhan jemaat, performa keuangan, absensi ibadah, dan logs sistem realtime.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('pengaturan')}
            className="px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs rounded-2xl shadow-md transition-all flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            <span>GAS Sync & Config</span>
          </button>
          <button
            onClick={() => setActiveTab('backup_restore')}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-2xl border border-white/20 transition-all flex items-center gap-2"
          >
            <Database className="w-4 h-4" />
            <span>Backup Data</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatsCard
          title="Total Jemaat"
          value={totalJemaat}
          subtitle="+12% bulan ini"
          icon={Users}
          color="blue"
          onClick={() => setActiveTab('jemaat')}
        />
        <StatsCard
          title="Total Pelayan"
          value={totalPelayan}
          subtitle="Tim Pelayanan"
          icon={UserCheck}
          color="indigo"
          onClick={() => setActiveTab('pelayanan')}
        />
        <StatsCard
          title="Total Admin"
          value={totalAdmin}
          subtitle="Super & Admin"
          icon={ShieldAlert}
          color="purple"
          onClick={() => setActiveTab('users')}
        />
        <StatsCard
          title="Total Komisi"
          value={totalKomisi}
          subtitle="KPR, PW, Sekolah Minggu"
          icon={Layers}
          color="amber"
          onClick={() => setActiveTab('komisi')}
        />
        <StatsCard
          title="Total Event"
          value={totalEvent}
          subtitle="Kegiatan Aktif"
          icon={Sparkles}
          color="rose"
          onClick={() => setActiveTab('event')}
        />
        <StatsCard
          title="Persembahan"
          value={`Rp ${(totalPersembahanNominal / 1000000).toFixed(1)}M`}
          subtitle="Total Terkumpul"
          icon={DollarSign}
          color="emerald"
          onClick={() => setActiveTab('keuangan')}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Chart */}
        <GlassCard className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Grafik Pertumbuhan Jemaat
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tren akumulasi jemaat terdaftar tahun 2026
              </p>
            </div>
            <button
              onClick={() => setActiveTab('laporan')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
            >
              Laporan Detail <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <JemaatGrowthChart />
        </GlassCard>

        {/* Attendance Breakdown */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Grafik Kehadiran Ibadah
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Distribusi kehadiran per sesi ibadah Minggu
              </p>
            </div>
          </div>
          <AttendanceChart />
        </GlassCard>
      </div>

      {/* Finance & Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Grafik Persembahan & Kas Gereja
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Perbandingan jenis persembahan masuk
              </p>
            </div>
          </div>
          <PersembahanChart />
        </GlassCard>

        {/* Recent System Activity Logs */}
        <GlassCard className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <span>Log Aktivitas Terbaru</span>
              </h3>
              <button
                onClick={() => setActiveTab('log_aktivitas')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Lihat Semua
              </button>
            </div>

            <div className="space-y-3">
              {logList.slice(0, 5).map((log) => (
                <div key={log.LogID} className="text-xs space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-200">
                      {log.NamaUser || 'User'}
                    </span>
                    <span className="text-[10px] text-slate-400">{log.Waktu}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">{log.Aktivitas}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('pengaturan')}
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Buka Pengaturan Sistem & Audit
            </button>
          </div>
        </GlassCard>
      </div>

      {/* Quick Menu Grid */}
      <GlassCard className="p-5 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Quick Access Management
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {[
            { id: 'jemaat', label: 'Master Jemaat', icon: Users, color: 'bg-blue-500/10 text-blue-600' },
            { id: 'users', label: 'Master Admin', icon: ShieldAlert, color: 'bg-purple-500/10 text-purple-600' },
            { id: 'keuangan', label: 'Keuangan', icon: DollarSign, color: 'bg-emerald-500/10 text-emerald-600' },
            { id: 'jadwal', label: 'Jadwal Ibadah', icon: Calendar, color: 'bg-amber-500/10 text-amber-600' },
            { id: 'laporan', label: 'Laporan Lengkap', icon: FileText, color: 'bg-rose-500/10 text-rose-600' },
            { id: 'pengaturan', label: 'GAS Setup', icon: Settings, color: 'bg-indigo-500/10 text-indigo-600' },
          ].map((menu) => {
            const Icon = menu.icon;
            return (
              <button
                key={menu.id}
                onClick={() => setActiveTab(menu.id)}
                className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all flex flex-col items-center text-center gap-2 group"
              >
                <div className={`p-3 rounded-xl ${menu.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {menu.label}
                </span>
              </button>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
};
