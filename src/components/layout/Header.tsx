import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Bell,
  Sun,
  Moon,
  RefreshCw,
  LogOut,
  User as UserIcon,
  ShieldAlert,
  ChevronDown,
  CheckCheck,
  Building2,
  Menu,
  KeyRound,
  Eye,
  EyeOff,
  X,
  Lock,
  AlertCircle,
} from 'lucide-react';
import { UserRole } from '../../types';

interface HeaderProps {
  onToggleSidebar?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, activeTab, setActiveTab }) => {
  const {
    user,
    role,
    logout,
    isRealtimeSyncing,
    syncMessage,
    triggerManualSync,
    switchDemoRoleWithPassword,
  } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  // Switch Role Password Modal States
  const [switchTargetRole, setSwitchTargetRole] = useState<UserRole | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleLabelMap: Record<UserRole, string> = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Admin Gereja',
    JEMAAT: 'Jemaat / Member',
  };

  const roleColorMap: Record<UserRole, string> = {
    SUPER_ADMIN: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
    ADMIN: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
    JEMAAT: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  };

  const isSuperAdminOrAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN';

  const handleOpenSwitchModal = (targetRole: UserRole) => {
    setSwitchTargetRole(targetRole);
    setPasswordInput('');
    setPasswordError('');
    setShowPassword(false);
    setShowRoleSwitcher(false);
  };

  const handleConfirmSwitch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!switchTargetRole) return;

    if (!passwordInput.trim()) {
      setPasswordError('Silakan masukkan password.');
      return;
    }

    setIsSubmitting(true);
    setPasswordError('');

    try {
      const result = await switchDemoRoleWithPassword(switchTargetRole, passwordInput);
      if (result.success) {
        setSwitchTargetRole(null);
        setPasswordInput('');
        setActiveTab('dashboard');
      } else {
        setPasswordError(result.message);
      }
    } catch {
      setPasswordError('Terjadi kesalahan saat memverifikasi password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/60 dark:bg-white/5 backdrop-blur-xl border-b border-white/60 dark:border-white/10 px-4 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left section */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl border border-white/40 dark:border-white/10 bg-white/40 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/10 transition-colors lg:hidden"
            aria-label="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="p-2 bg-indigo-500 rounded-xl text-white shadow-lg shadow-indigo-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
                GKI Kasih Sejahtera
              </h1>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-wide uppercase">
                GraceCMS PWA
              </span>
            </div>
          </div>
        </div>

        {/* Right section controls */}
        <div className="flex items-center gap-2">
          {/* Realtime Sheets Sync Button */}
          <button
            onClick={triggerManualSync}
            disabled={isRealtimeSyncing}
            title={syncMessage}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/40 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all backdrop-blur-md"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-indigo-500 ${isRealtimeSyncing ? 'animate-spin' : ''}`}
            />
            <span className="truncate max-w-[120px]">{isRealtimeSyncing ? 'Syncing...' : 'Realtime'}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          {/* Quick Role Switcher for Testing Demo - ONLY AVAILABLE FOR SUPER_ADMIN & ADMIN */}
          {isSuperAdminOrAdmin && (
            <div className="relative">
              <button
                onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  role ? roleColorMap[role] : 'bg-slate-100 text-slate-700'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{role ? roleLabelMap[role] : 'Guest'}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {showRoleSwitcher && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-scale-up">
                  <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Demo Role:
                  </p>
                  {(['SUPER_ADMIN', 'ADMIN', 'JEMAAT'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => handleOpenSwitchModal(r)}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-blue-500/10 flex items-center justify-between ${
                        role === r ? 'text-blue-600 font-bold' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{roleLabelMap[r]}</span>
                      {role === r && <CheckCheck className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-white/40 dark:border-white/10 bg-white/40 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/10 transition-colors backdrop-blur-md"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="p-2 rounded-xl border border-white/40 dark:border-white/10 bg-white/40 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/10 transition-colors backdrop-blur-md relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-scale-up">
                <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    Notifikasi ({unreadCount} Baru)
                  </h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Tandai Semua Dibaca
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.NotifID}
                        onClick={() => markAsRead(n.NotifID)}
                        className={`p-3 text-xs cursor-pointer hover:bg-blue-500/5 transition-colors ${
                          !n.Dibaca ? 'bg-blue-500/10 font-medium' : 'opacity-80'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {n.Judul}
                          </span>
                          <span className="text-[10px] text-slate-400">{n.Tanggal}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                          {n.Pesan}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-400">
                      Tidak ada notifikasi baru.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Logout */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center uppercase shadow-sm">
                {user?.Nama?.[0] || 'U'}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50 animate-scale-up">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {user?.Nama}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {user?.Username} • {roleLabelMap[user?.Role || 'JEMAAT']}
                  </p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setActiveTab('profil');
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2"
                  >
                    <UserIcon className="w-4 h-4 text-blue-500" />
                    Profil Saya
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Switch Role Password Modal */}
      {switchTargetRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                    Konfirmasi Akses Switch Role
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Verifikasi password akun target sebelum berpindah
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSwitchTargetRole(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleConfirmSwitch} className="p-5 space-y-4">
              <div className="p-3 bg-indigo-500/5 border border-indigo-500/15 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Target Role
                  </span>
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                    {roleLabelMap[switchTargetRole]}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Username Target
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                    {switchTargetRole === 'SUPER_ADMIN'
                      ? 'superadmin'
                      : switchTargetRole === 'ADMIN'
                      ? 'admin'
                      : 'jemaat1'}
                  </span>
                </div>
              </div>

              {passwordError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  Password Target
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Masukkan password akun target..."
                    autoFocus
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Password default demo: <code className="font-mono text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded">admin123</code>
                </p>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSwitchTargetRole(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? 'Memverifikasi...' : 'Konfirmasi Switch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
