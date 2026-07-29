import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  id,
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`
        bg-white/70 dark:bg-white/5 
        backdrop-blur-xl 
        border border-white/60 dark:border-white/10 
        rounded-2xl shadow-lg shadow-slate-900/5 dark:shadow-black/20 
        transition-all duration-200 
        ${hoverable ? 'hover:shadow-xl hover:-translate-y-0.5 cursor-pointer hover:border-indigo-500/40 hover:bg-white/80 dark:hover:bg-white/10' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
