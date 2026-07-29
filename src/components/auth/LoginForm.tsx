import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Building2,
  Lock,
  User,
  Eye,
  EyeOff,
  Sun,
  Moon,
  ArrowRight,
  ShieldCheck,
  UserPlus,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { UserRole } from '../../types';

interface LoginFormProps {
  onGoToRegister: () => void;
  onOpenForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onGoToRegister, onOpenForgotPassword }) => {
  const { login, quickDemoLogin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await login(username, password);
      if (!res.success) {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (targetRole: UserRole) => {
    setLoading(true);
    await quickDemoLogin(targetRole);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Dark/Light mode floating button */}
      <button
        onClick={toggleTheme}
        className="absolute top-5 right-5 p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all z-20"
      >
        {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl border border-white/10 backdrop-blur-xl z-10 my-8">
        {/* Left Church Brand Hero */}
        <div className="p-8 lg:p-12 bg-gradient-to-b from-blue-600 to-indigo-800 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight">GKI Kasih Sejahtera</h1>
                <p className="text-xs text-blue-100 font-medium">Church Management System (CMS)</p>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <h2 className="text-2xl lg:text-3xl font-black leading-tight">
                Pelayanan Terintegrasi & Realtime Berbasis PWA
              </h2>
              <p className="text-xs text-blue-100/80 leading-relaxed">
                Kelola jemaat, persembahan, jadwal ibadah, dan kegiatan gereja secara realtime dalam satu aplikasi modern.
              </p>
            </div>
          </div>

          <div className="pt-8 relative z-10 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
              Demo Akses Cepat (1-Click Login):
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('SUPER_ADMIN')}
                className="py-2 px-2 bg-white/15 hover:bg-white/25 backdrop-blur-md rounded-xl text-[11px] font-bold text-center transition-all border border-white/20"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('ADMIN')}
                className="py-2 px-2 bg-white/15 hover:bg-white/25 backdrop-blur-md rounded-xl text-[11px] font-bold text-center transition-all border border-white/20"
              >
                Admin Gereja
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('JEMAAT')}
                className="py-2 px-2 bg-white/15 hover:bg-white/25 backdrop-blur-md rounded-xl text-[11px] font-bold text-center transition-all border border-white/20"
              >
                Jemaat
              </button>
            </div>
          </div>
        </div>

        {/* Right Glass Card Form */}
        <div className="p-8 lg:p-12 bg-slate-900/90 backdrop-blur-2xl flex flex-col justify-center">
          <div className="space-y-2 mb-6">
            <h3 className="text-2xl font-black text-white">Selamat Datang</h3>
            <p className="text-xs text-slate-400">Silakan masuk menggunakan akun Anda</p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Username</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700/80 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full pl-10 pr-10 py-3 bg-slate-800/80 border border-slate-700/80 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500"
                />
                Remember Me
              </label>

              <button
                type="button"
                onClick={onOpenForgotPassword}
                className="text-blue-400 hover:underline font-semibold"
              >
                Lupa Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-2xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                'Memproses Login...'
              ) : (
                <>
                  <span>Masuk ke System</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Belum terdaftar sebagai Jemaat?{' '}
              <button
                onClick={onGoToRegister}
                className="text-blue-400 font-bold hover:underline inline-flex items-center gap-1 ml-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Registrasi Akun Baru
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
