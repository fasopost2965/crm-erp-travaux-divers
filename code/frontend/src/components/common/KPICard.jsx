import React from 'react';

const KPICard = ({ 
  title, 
  value, 
  icon, 
  trend = null, // ex: { val: "12.5%", isPositive: true }
  loading = false, 
  suffix = "" 
}) => {
  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
          <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800"></div>
        </div>
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-32 mb-2"></div>
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-16"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-100 dark:border-slate-800/80 rounded-3xl shadow-sm hover:shadow-md transition-all group duration-300 relative overflow-hidden">
      {/* Subtle top decoration */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600/0 via-blue-500/20 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className="w-10 h-10 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-baseline">
        <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
          {value}
        </span>
        {suffix && (
          <span className="ml-1 text-sm font-bold text-slate-500 dark:text-slate-400">
            {suffix}
          </span>
        )}
      </div>

      {trend && (
        <div className="mt-2 flex items-center text-xs">
          <span className={`inline-flex items-center font-bold px-2 py-0.5 rounded-lg mr-2 ${
            trend.isPositive 
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' 
              : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'
          }`}>
            {trend.isPositive ? '+' : ''}{trend.val}
          </span>
          <span className="text-slate-400 dark:text-slate-500 font-medium">
            vs mois dernier
          </span>
        </div>
      )}
    </div>
  );
};

export default KPICard;
