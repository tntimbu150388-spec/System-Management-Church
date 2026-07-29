import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  UserPlus,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Building2,
  ShieldCheck,
} from 'lucide-react';

interface RegisterFormProps {
  onBackToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onBackToLogin }) => {
  const { registerJemaat } = useAuth();

  const [formData, setFormData] = useState({
    Nama: '',
    NIK: '',
    KK: '',
    Gender: 'L' as 'L' | 'P',
    TempatLahir: '',
    TanggalLahir: '',
    Alamat: '',
    Wilayah: 'Wilayah I - Pusat',
    HP: '',
    Email: '',
    Baptis: 'Belum' as 'Ya' | 'Belum',
    TanggalBaptis: '',
    Sidi: 'Belum' as 'Ya' | 'Belum',
    TanggalSidi: '',
    Foto: '',
    Username: '',
    Password: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const res = await registerJemaat(formData);
      if (res.success) {
        setSuccessMessage(res.message);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err) {
      setErrorMessage('Terjadi kesalahan pendaftaran.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 my-6">
      <div className="w-full max-w-3xl bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-10 text-white">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <button
            onClick={onBackToLogin}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Login
          </button>
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
            <Building2 className="w-4 h-4" />
            <span>Pendaftaran Jemaat Baru</span>
          </div>
        </div>

        {successMessage ? (
          <div className="py-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold">Pendaftaran Berhasil!</h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              {successMessage}
            </p>
            <button
              onClick={onBackToLogin}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 font-bold text-xs rounded-2xl transition-all shadow-lg shadow-blue-600/30"
            >
              Kembali ke Halaman Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-xl font-black">Formulir Registrasi Jemaat</h2>
              <p className="text-xs text-slate-400 mt-1">
                Isi data diri Anda secara lengkap. Akun memerlukan verifikasi Admin sebelum dapat digunakan.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Section 1: Data Diri */}
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-400 border-b border-slate-800 pb-1">
                1. Data Pribadi & Identitas
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    name="Nama"
                    value={formData.Nama}
                    onChange={handleChange}
                    placeholder="Contoh: Yohanes Wijaya"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">NIK (Nomor Induk Kependudukan) *</label>
                  <input
                    type="text"
                    required
                    name="NIK"
                    value={formData.NIK}
                    onChange={handleChange}
                    placeholder="16 Digit NIK"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Nomor Kartu Keluarga (KK) *</label>
                  <input
                    type="text"
                    required
                    name="KK"
                    value={formData.KK}
                    onChange={handleChange}
                    placeholder="16 Digit KK"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Jenis Kelamin *</label>
                  <select
                    name="Gender"
                    value={formData.Gender}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Tempat Lahir</label>
                  <input
                    type="text"
                    name="TempatLahir"
                    value={formData.TempatLahir}
                    onChange={handleChange}
                    placeholder="Kota Lahir"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Tanggal Lahir *</label>
                  <input
                    type="date"
                    required
                    name="TanggalLahir"
                    value={formData.TanggalLahir}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Nomor HP / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    name="HP"
                    value={formData.HP}
                    onChange={handleChange}
                    placeholder="081234567890"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Email *</label>
                  <input
                    type="email"
                    required
                    name="Email"
                    value={formData.Email}
                    onChange={handleChange}
                    placeholder="email@domain.com"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Alamat Tempat Tinggal *</label>
                <textarea
                  required
                  rows={2}
                  name="Alamat"
                  value={formData.Alamat}
                  onChange={handleChange}
                  placeholder="Jl. Merdeka No. 12..."
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Wilayah Gereja *</label>
                <select
                  name="Wilayah"
                  value={formData.Wilayah}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Wilayah I - Pusat">Wilayah I - Pusat</option>
                  <option value="Wilayah II - Barat">Wilayah II - Barat</option>
                  <option value="Wilayah III - Timur">Wilayah III - Timur</option>
                  <option value="Wilayah IV - Utara">Wilayah IV - Utara</option>
                  <option value="Wilayah V - Selatan">Wilayah V - Selatan</option>
                </select>
              </div>
            </div>

            {/* Section 2: Baptis & Sidi */}
            <div className="space-y-4 pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-400 border-b border-slate-800 pb-1">
                2. Status Sakramen Gereja
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Status Baptis</label>
                  <select
                    name="Baptis"
                    value={formData.Baptis}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Ya">Sudah Dibaptis</option>
                    <option value="Belum">Belum Dibaptis</option>
                  </select>
                </div>

                {formData.Baptis === 'Ya' && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Tanggal Baptis</label>
                    <input
                      type="date"
                      name="TanggalBaptis"
                      value={formData.TanggalBaptis}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Status Sidi</label>
                  <select
                    name="Sidi"
                    value={formData.Sidi}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Ya">Sudah Sidi</option>
                    <option value="Belum">Belum Sidi</option>
                  </select>
                </div>

                {formData.Sidi === 'Ya' && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Tanggal Sidi</label>
                    <input
                      type="date"
                      name="TanggalSidi"
                      value={formData.TanggalSidi}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Akun Login */}
            <div className="space-y-4 pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-400 border-b border-slate-800 pb-1">
                3. Akun Login PWA
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Username *</label>
                  <input
                    type="text"
                    required
                    name="Username"
                    value={formData.Username}
                    onChange={handleChange}
                    placeholder="Username unik"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Password *</label>
                  <input
                    type="password"
                    required
                    name="Password"
                    value={formData.Password}
                    onChange={handleChange}
                    placeholder="Password min 6 karakter"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-2xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                'Mengirim Data Pendaftaran...'
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Kirim Pendaftaran Jemaat Baru</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
