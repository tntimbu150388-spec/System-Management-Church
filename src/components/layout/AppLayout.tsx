import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { ToastContainer } from '../common/ToastContainer';
import { PwaInstallBanner } from '../common/PwaInstallBanner';

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 transition-colors flex flex-col font-sans relative overflow-x-hidden">
      {/* Mesh Background Blur Elements for Frosted Glass Depth */}
      <div className="fixed top-[-10%] left-[-5%] w-[450px] h-[450px] bg-indigo-600/15 dark:bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[550px] h-[550px] bg-purple-600/15 dark:bg-purple-600/20 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-[35%] right-[15%] w-[350px] h-[350px] bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-[120px] pointer-events-none z-0" />

      <PwaInstallBanner />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex-1 flex flex-col lg:pl-64 z-10">
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-24 md:pb-12">
          {children}
        </main>
      </div>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      <ToastContainer />
    </div>
  );
};
