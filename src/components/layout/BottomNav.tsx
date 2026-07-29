import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Calendar, DollarSign, User, Megaphone } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { role } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    {
      id: role === 'JEMAAT' ? 'jadwal_jemaat' : 'jadwal',
      label: 'Jadwal',
      icon: Calendar,
    },
    {
      id: role === 'JEMAAT' ? 'persembahan_jemaat' : 'keuangan',
      label: 'Keuangan',
      icon: DollarSign,
    },
    {
      id: role === 'JEMAAT' ? 'pengumuman_jemaat' : 'pengumuman',
      label: 'Info',
      icon: Megaphone,
    },
    { id: 'profil', label: 'Profil', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 py-2 px-4 md:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 scale-105'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-colors ${
                  isActive ? 'bg-blue-500/15' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
