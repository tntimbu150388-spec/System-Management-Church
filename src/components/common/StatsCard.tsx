import React from 'react';
import { LucideIcon } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose' | 'indigo';
  onClick?: () => void;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  onClick,
}) => {
  const colorStyles = {
    blue: {
      bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      iconBg: 'bg-blue-500 text-white',
    },
    emerald: {
      bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      iconBg: 'bg-emerald-500 text-white',
    },
    amber: {
      bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      iconBg: 'bg-amber-500 text-white',
    },
    purple: {
      bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      iconBg: 'bg-purple-500 text-white',
    },
    rose: {
      bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      iconBg: 'bg-rose-500 text-white',
    },
    indigo: {
      bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      iconBg: 'bg-indigo-500 text-white',
    },
  }[color];

  return (
    <GlassCard
      onClick={onClick}
      hoverable={!!onClick}
      className="p-5 flex items-center justify-between relative overflow-hidden"
    >
      <div className="space-y-1 z-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </p>
        <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            {subtitle}
          </p>
        )}
      </div>

      <div className={`p-3 rounded-xl shadow-sm ${colorStyles.iconBg} z-10`}>
        <Icon className="w-6 h-6" />
      </div>

      <div
        className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10 pointer-events-none ${colorStyles.bg}`}
      />
    </GlassCard>
  );
};
