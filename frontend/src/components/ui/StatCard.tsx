import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  color?: 'blue' | 'emerald' | 'amber' | 'purple' | 'indigo' | 'rose';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  color = 'blue',
}) => {
  const colorStyles = {
    blue: 'from-blue-600/20 to-blue-500/5 text-blue-400 border-blue-500/20',
    emerald: 'from-emerald-600/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20',
    amber: 'from-amber-600/20 to-amber-500/5 text-amber-400 border-amber-500/20',
    purple: 'from-purple-600/20 to-purple-500/5 text-purple-400 border-purple-500/20',
    indigo: 'from-indigo-600/20 to-indigo-500/5 text-indigo-400 border-indigo-500/20',
    rose: 'from-rose-600/20 to-rose-500/5 text-rose-400 border-rose-500/20',
  };

  return (
    <div className={`relative p-5 rounded-2xl bg-slate-900/80 dark:bg-slate-900/80 light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 group`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-400 light:text-slate-600 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-100 dark:text-slate-100 light:text-slate-900 mt-1 tracking-tight">{value}</h3>
          {subtext && <p className="text-[11px] text-slate-400 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${colorStyles[color]} border shadow-inner group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
