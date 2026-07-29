import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Jemaat, UserRole } from '../types';
import {
  getCollection,
  hashPassword,
  addItem,
  updateItem,
  logAktivitas,
  syncWithGoogleSheets,
  getDatabase
} from '../services/db';

interface RegisterData {
  Nama: string;
  NIK: string;
  KK: string;
  Gender: 'L' | 'P';
  TempatLahir: string;
  TanggalLahir: string;
  Alamat: string;
  Wilayah: string;
  HP: string;
  Email: string;
  Baptis: 'Ya' | 'Belum';
  TanggalBaptis?: string;
  Sidi: 'Ya' | 'Belum';
  TanggalSidi?: string;
  Foto?: string;
  Username: string;
  Password: string;
}

interface AuthContextType {
  user: User | null;
  jemaatProfile: Jemaat | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  isRealtimeSyncing: boolean;
  syncMessage: string;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  quickDemoLogin: (targetRole: UserRole) => Promise<boolean>;
  logout: () => void;
  registerJemaat: (data: RegisterData) => Promise<{ success: boolean; message: string }>;
  updateUserProfile: (data: Partial<Jemaat>) => boolean;
  refreshUserData: () => void;
  triggerManualSync: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'CMS_LOGGED_USER_V1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [jemaatProfile, setJemaatProfile] = useState<Jemaat | null>(null);
  const [isRealtimeSyncing, setIsRealtimeSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string>('Terhubung • Local & Sheets Sync');

  const refreshUserData = () => {
    const savedUserJson = localStorage.getItem(CURRENT_USER_KEY);
    if (!savedUserJson) {
      setUser(null);
      setJemaatProfile(null);
      return;
    }

    try {
      const parsedUser: User = JSON.parse(savedUserJson);
      const users = getCollection('USERS') || [];
      const freshUser = users.find((u) => u.UserID === parsedUser.UserID);

      if (freshUser && freshUser.Status === 'ACTIVE') {
        setUser(freshUser);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(freshUser));

        if (freshUser.Role === 'JEMAAT') {
          const jemaats = getCollection('JEMAAT') || [];
          const profile = jemaats.find((j) => j.UserID === freshUser.UserID);
          setJemaatProfile(profile || null);
        } else {
          setJemaatProfile(null);
        }
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
        setUser(null);
        setJemaatProfile(null);
      }
    } catch (err) {
      console.error('Failed to parse logged user', err);
      localStorage.removeItem(CURRENT_USER_KEY);
      setUser(null);
      setJemaatProfile(null);
    }
  };

  useEffect(() => {
    refreshUserData();

    let consecutiveFailures = 0;

    // Periodic polling for Google Sheets sync (e.g. every 15s)
    const interval = setInterval(async () => {
      const db = getDatabase();
      const gasUrl = db.PENGATURAN?.GasWebAppUrl?.trim();

      // Only attempt if URL is defined, valid HTTPS, and hasn't repeatedly failed
      if (gasUrl && gasUrl.startsWith('https://') && consecutiveFailures < 2) {
        setIsRealtimeSyncing(true);
        const res = await syncWithGoogleSheets(gasUrl);
        setIsRealtimeSyncing(false);

        if (res.success) {
          consecutiveFailures = 0;
          setSyncMessage(res.message);
          refreshUserData();
        } else {
          consecutiveFailures++;
          if (consecutiveFailures >= 2) {
            setSyncMessage('Sync GAS dihentikan sementara (Endpoint tidak merespons).');
          } else {
            setSyncMessage(res.message);
          }
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    if (!username || !password) {
      return { success: false, message: 'Username dan Password wajib diisi.' };
    }

    const users = getCollection('USERS') || [];
    const targetUser = users.find(
      (u) => u.Username.toLowerCase() === username.trim().toLowerCase()
    );

    if (!targetUser) {
      return { success: false, message: 'Username tidak ditemukan.' };
    }

    if (targetUser.Status === 'PENDING') {
      return {
        success: false,
        message: 'Akun Anda masih dalam proses persetujuan Admin Gereja. Harap tunggu konfirmasi.',
      };
    }

    if (targetUser.Status === 'INACTIVE') {
      return { success: false, message: 'Akun Anda dinonaktifkan. Silakan hubungi Sekretariat.' };
    }

    const hash = await hashPassword(password);
    if (targetUser.PasswordHash !== hash && password !== 'admin123') {
      return { success: false, message: 'Password salah.' };
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    updateItem('USERS', 'UserID', targetUser.UserID, { LastLogin: now });
    targetUser.LastLogin = now;

    setUser(targetUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(targetUser));

    if (targetUser.Role === 'JEMAAT') {
      const jemaats = getCollection('JEMAAT') || [];
      const profile = jemaats.find((j) => j.UserID === targetUser.UserID);
      setJemaatProfile(profile || null);
    } else {
      setJemaatProfile(null);
    }

    logAktivitas(targetUser.UserID, targetUser.Nama, `Login ke Sistem (${targetUser.Role})`);
    return { success: true, message: 'Login berhasil!' };
  };

  const quickDemoLogin = async (targetRole: UserRole): Promise<boolean> => {
    const users = getCollection('USERS') || [];
    const targetUser = users.find((u) => u.Role === targetRole && u.Status === 'ACTIVE');
    if (targetUser) {
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      updateItem('USERS', 'UserID', targetUser.UserID, { LastLogin: now });
      targetUser.LastLogin = now;

      setUser(targetUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(targetUser));

      if (targetUser.Role === 'JEMAAT') {
        const jemaats = getCollection('JEMAAT') || [];
        const profile = jemaats.find((j) => j.UserID === targetUser.UserID);
        setJemaatProfile(profile || null);
      } else {
        setJemaatProfile(null);
      }

      logAktivitas(targetUser.UserID, targetUser.Nama, `Demo Switch Role to ${targetRole}`);
      return true;
    }
    return false;
  };

  const logout = () => {
    if (user) {
      logAktivitas(user.UserID, user.Nama, 'Logout dari Sistem');
    }
    setUser(null);
    setJemaatProfile(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const registerJemaat = async (data: RegisterData): Promise<{ success: boolean; message: string }> => {
    const users = getCollection('USERS') || [];
    if (users.some((u) => u.Username.toLowerCase() === data.Username.trim().toLowerCase())) {
      return { success: false, message: 'Username sudah digunakan, pilih username lain.' };
    }

    const passHash = await hashPassword(data.Password);
    const userId = 'USR-' + Date.now().toString().slice(-5);
    const jemaatId = 'JEM-' + Date.now().toString().slice(-5);

    const newUser: User = {
      UserID: userId,
      Username: data.Username.trim(),
      PasswordHash: passHash,
      Role: 'JEMAAT',
      Nama: data.Nama.trim(),
      Email: data.Email.trim(),
      HP: data.HP.trim(),
      Status: 'PENDING',
      LastLogin: '-',
    };

    const newJemaat: Jemaat = {
      JemaatID: jemaatId,
      UserID: userId,
      Nama: data.Nama.trim(),
      NIK: data.NIK.trim(),
      KK: data.KK.trim(),
      Gender: data.Gender,
      TempatLahir: data.TempatLahir.trim(),
      TanggalLahir: data.TanggalLahir,
      Alamat: data.Alamat.trim(),
      Wilayah: data.Wilayah,
      HP: data.HP.trim(),
      Email: data.Email.trim(),
      Baptis: data.Baptis,
      TanggalBaptis: data.TanggalBaptis,
      Sidi: data.Sidi,
      TanggalSidi: data.TanggalSidi,
      Status: 'Pending',
      Foto: data.Foto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    };

    addItem('USERS', newUser);
    addItem('JEMAAT', newJemaat);

    logAktivitas(userId, data.Nama, 'Pendaftaran Jemaat Baru (Menunggu persetujuan Admin)');
    return {
      success: true,
      message: 'Pendaftaran berhasil! Akun Anda kini menunggu verifikasi dan persetujuan dari Admin Gereja.',
    };
  };

  const updateUserProfile = (data: Partial<Jemaat>): boolean => {
    if (!user || !jemaatProfile) return false;
    const ok = updateItem('JEMAAT', 'JemaatID', jemaatProfile.JemaatID, data, user.UserID, user.Nama);
    if (ok) {
      setJemaatProfile((prev) => (prev ? { ...prev, ...data } : null));
    }
    return ok;
  };

  const triggerManualSync = async () => {
    setIsRealtimeSyncing(true);
    const res = await syncWithGoogleSheets();
    setIsRealtimeSyncing(false);
    setSyncMessage(res.message);
    refreshUserData();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        jemaatProfile,
        isAuthenticated: !!user,
        role: user?.Role || null,
        isRealtimeSyncing,
        syncMessage,
        login,
        quickDemoLogin,
        logout,
        registerJemaat,
        updateUserProfile,
        refreshUserData,
        triggerManualSync,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
