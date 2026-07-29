import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { ForgotPasswordModal } from './components/auth/ForgotPasswordModal';
import { AppLayout } from './components/layout/AppLayout';

// Dashboards
import { SuperAdminDashboard } from './components/dashboards/SuperAdminDashboard';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { JemaatDashboard } from './components/dashboards/JemaatDashboard';

// Modules
import { JemaatModule } from './components/modules/JemaatModule';
import { KeuanganModule } from './components/modules/KeuanganModule';
import { JadwalModule } from './components/modules/JadwalModule';
import { PelayananModule } from './components/modules/PelayananModule';
import { InventarisModule } from './components/modules/InventarisModule';
import { EventModule } from './components/modules/EventModule';
import { PengumumanModule } from './components/modules/PengumumanModule';
import { DoaModule } from './components/modules/DoaModule';
import { RenunganModule } from './components/modules/RenunganModule';
import { SystemSettingsModule } from './components/modules/SystemSettingsModule';
import { ReportsModule } from './components/modules/ReportsModule';
import { BackupRestoreModule } from './components/modules/BackupRestoreModule';
import { LogAktivitasModule } from './components/modules/LogAktivitasModule';
import { ProfileModule } from './components/modules/ProfileModule';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const [authView, setAuthView] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  if (!isAuthenticated) {
    return (
      <>
        {authView === 'LOGIN' ? (
          <LoginForm
            onGoToRegister={() => setAuthView('REGISTER')}
            onOpenForgotPassword={() => setIsForgotModalOpen(true)}
          />
        ) : (
          <RegisterForm onBackToLogin={() => setAuthView('LOGIN')} />
        )}

        <ForgotPasswordModal
          isOpen={isForgotModalOpen}
          onClose={() => setIsForgotModalOpen(false)}
        />
      </>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        if (role === 'SUPER_ADMIN') return <SuperAdminDashboard setActiveTab={setActiveTab} />;
        if (role === 'ADMIN') return <AdminDashboard setActiveTab={setActiveTab} />;
        return <JemaatDashboard setActiveTab={setActiveTab} />;

      case 'jemaat':
      case 'users':
      case 'keluarga':
      case 'komisi':
      case 'wilayah':
        return <JemaatModule />;

      case 'keuangan':
      case 'persembahan_jemaat':
        return <KeuanganModule />;

      case 'jadwal':
      case 'jadwal_jemaat':
      case 'absensi_jemaat':
        return <JadwalModule />;

      case 'pelayanan':
        return <PelayananModule />;

      case 'inventaris':
        return <InventarisModule />;

      case 'event':
      case 'pengumuman_jemaat':
        return <EventModule />;

      case 'pengumuman':
        return <PengumumanModule />;

      case 'doa':
      case 'doa_jemaat':
      case 'kunjungan':
        return <DoaModule />;

      case 'renungan':
        return <RenunganModule />;

      case 'pengaturan':
        return <SystemSettingsModule />;

      case 'laporan':
        return <ReportsModule />;

      case 'backup_restore':
        return <BackupRestoreModule />;

      case 'log_aktivitas':
        return <LogAktivitasModule />;

      case 'profil':
      case 'ubah_password':
      case 'notifikasi':
        return <ProfileModule />;

      default:
        return <SuperAdminDashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderTabContent()}
    </AppLayout>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <MainAppContent />
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
