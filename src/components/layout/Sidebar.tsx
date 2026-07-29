import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  DollarSign,
  Package,
  Sparkles,
  Megaphone,
  HeartHandshake,
  FileText,
  Database,
  History,
  Settings,
  X,
  BookOpen,
  MapPin,
  Layers,
  Heart,
  KeyRound,
  Bell,
  Home,
  User,
} from 'lucide-react';
import { UserRole } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  roles: UserRole[];
  category?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, activeTab, setActiveTab }) => {
  const { role } = useAuth();

  const menuItems: MenuItem[] = [
    // Dashboard (All)
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'ADMIN', 'JEMAAT'] },

    // Super Admin & Admin Modules
    { id: 'jemaat', label: 'Master Jemaat', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN'], category: 'Manajemen Data' },
    { id: 'keluarga', label: 'Data Keluarga', icon: Home, roles: ['SUPER_ADMIN', 'ADMIN', 'JEMAAT'], category: 'Manajemen Data' },
    { id: 'users', label: 'Master User & Admin', icon: UserCheck, roles: ['SUPER_ADMIN'], category: 'Manajemen Data' },
    { id: 'pelayanan', label: 'Pelayanan & Petugas', icon: Sparkles, roles: ['SUPER_ADMIN', 'ADMIN'], category: 'Ibadah & Pelayanan' },
    { id: 'jadwal', label: 'Jadwal & Absensi', icon: Calendar, roles: ['SUPER_ADMIN', 'ADMIN'], category: 'Ibadah & Pelayanan' },
    { id: 'komisi', label: 'Master Komisi', icon: Layers, roles: ['SUPER_ADMIN', 'ADMIN'], category: 'Organisasi' },
    { id: 'wilayah', label: 'Master Wilayah', icon: MapPin, roles: ['SUPER_ADMIN', 'ADMIN'], category: 'Organisasi' },

    // Keuangan & Inventaris
    { id: 'keuangan', label: 'Keuangan & Persembahan', icon: DollarSign, roles: ['SUPER_ADMIN', 'ADMIN'], category: 'Keuangan & Aset' },
    { id: 'inventaris', label: 'Master Inventaris', icon: Package, roles: ['SUPER_ADMIN', 'ADMIN'], category: 'Keuangan & Aset' },

    // Event, Pengumuman, Pastoral
    { id: 'event', label: 'Event & Kegiatan', icon: Sparkles, roles: ['SUPER_ADMIN', 'ADMIN'], category: 'Kegiatan & Pastoral' },
    { id: 'pengumuman', label: 'Pengumuman Gereja', icon: Megaphone, roles: ['SUPER_ADMIN', 'ADMIN'], category: 'Kegiatan & Pastoral' },
    { id: 'doa', label: 'Doa Syafaat', icon: HeartHandshake, roles: ['SUPER_ADMIN', 'ADMIN'], category: 'Kegiatan & Pastoral' },
    { id: 'kunjungan', label: 'Kunjungan Pastoral', icon: Heart, roles: ['SUPER_ADMIN', 'ADMIN'], category: 'Kegiatan & Pastoral' },

    // Jemaat Specific Views
    { id: 'jadwal_jemaat', label: 'Jadwal Ibadah & Pelayanan', icon: Calendar, roles: ['JEMAAT'], category: 'Aktivitas Saya' },
    { id: 'absensi_jemaat', label: 'Absensi Saya', icon: UserCheck, roles: ['JEMAAT'], category: 'Aktivitas Saya' },
    { id: 'persembahan_jemaat', label: 'Persembahan Saya', icon: DollarSign, roles: ['JEMAAT'], category: 'Aktivitas Saya' },
    { id: 'doa_jemaat', label: 'Permohonan Doa Saya', icon: HeartHandshake, roles: ['JEMAAT'], category: 'Aktivitas Saya' },
    { id: 'renungan', label: 'Renungan & Artikel', icon: BookOpen, roles: ['SUPER_ADMIN', 'ADMIN', 'JEMAAT'], category: 'Media & Rohani' },
    { id: 'pengumuman_jemaat', label: 'Pengumuman & Event', icon: Megaphone, roles: ['JEMAAT'], category: 'Media & Rohani' },
    { id: 'notifikasi', label: 'Notifikasi', icon: Bell, roles: ['JEMAAT'], category: 'Akun' },
    { id: 'profil', label: 'Profil Saya', icon: User, roles: ['SUPER_ADMIN', 'ADMIN', 'JEMAAT'], category: 'Akun' },
    { id: 'ubah_password', label: 'Ubah Password', icon: KeyRound, roles: ['SUPER_ADMIN', 'ADMIN', 'JEMAAT'], category: 'Akun' },

    // Laporan & Admin System
    { id: 'laporan', label: 'Laporan Lengkap', icon: FileText, roles: ['SUPER_ADMIN', 'ADMIN'], category: 'Laporan & Sistem' },
    { id: 'backup_restore', label: 'Backup & Restore', icon: Database, roles: ['SUPER_ADMIN'], category: 'Laporan & Sistem' },
    { id: 'log_aktivitas', label: 'Log Aktivitas', icon: History, roles: ['SUPER_ADMIN'], category: 'Laporan & Sistem' },
    { id: 'pengaturan', label: 'Pengaturan & GAS Sync', icon: Settings, roles: ['SUPER_ADMIN'], category: 'Laporan & Sistem' },
  ];

  const filteredItems = menuItems.filter((item) => role && item.roles.includes(role));

  // Group by category
  const categories = Array.from(new Set(filteredItems.map((item) => item.category || 'Utama')));

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 w-64 bg-white/70 dark:bg-white/5 
          backdrop-blur-xl border-r border-white/60 dark:border-white/10 
          flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/40 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white font-black flex items-center justify-center text-base shadow-lg shadow-indigo-500/20">
              G
            </div>
            <div>
              <p className="text-sm font-extrabold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent uppercase tracking-tight">
                CMS Gereja
              </p>
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">GraceCMS PWA</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {categories.map((cat) => {
            const catItems = filteredItems.filter((i) => (i.category || 'Utama') === cat);
            return (
              <div key={cat} className="space-y-1">
                {cat !== 'Utama' && (
                  <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 my-1">
                    {cat}
                  </p>
                )}
                {catItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        onClose();
                      }}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold 
                        transition-all duration-200 text-left
                        ${
                          isActive
                            ? 'bg-white/20 dark:bg-white/10 text-slate-900 dark:text-white shadow-md border border-white/40 dark:border-white/10 backdrop-blur-md font-bold'
                            : 'text-slate-700 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                        }
                      `}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 text-center">
          Church Management System v1.0 • PWA Realtime
        </div>
      </aside>
    </>
  );
};
