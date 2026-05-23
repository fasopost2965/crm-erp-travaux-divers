import React from 'react';

const VARIANT_STYLES = {
  blue:   { bg: 'bg-blue-50 dark:bg-blue-950/30',   icon: 'text-blue-600 dark:text-blue-400',   bar: 'bg-blue-500' },
  green:  { bg: 'bg-emerald-50 dark:bg-emerald-950/30', icon: 'text-emerald-600 dark:text-emerald-400', bar: 'bg-emerald-500' },
  amber:  { bg: 'bg-amber-50 dark:bg-amber-950/30', icon: 'text-amber-600 dark:text-amber-400', bar: 'bg-amber-500' },
  red:    { bg: 'bg-red-50 dark:bg-red-950/30',     icon: 'text-red-600 dark:text-red-400',     bar: 'bg-red-500' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-950/30', icon: 'text-purple-600 dark:text-purple-400', bar: 'bg-purple-500' },
  slate:  { bg: 'bg-slate-100 dark:bg-slate-800',   icon: 'text-slate-600 dark:text-slate-400', bar: 'bg-slate-400' },
};

const KPICard = ({
  title,
  value,
  icon,
  trend = null,
  loading = false,
  suffix = '',
  variant = 'blue',
}) => {
  const v = VARIANT_STYLES[variant] || VARIANT_STYLES.blue;

  if (loading) {
    return (
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl animate-pulse space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-24" />
          <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded w-28" />
        <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-20" />
      </div>
    );
  }

  return (
    <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide leading-tight">
          {title}
        </p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${v.bg} ${v.icon}`}>
          {icon}
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
          {value}
        </span>
        {suffix && (
          <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">{suffix}</span>
        )}
      </div>

      {trend && (
        <div className="mt-2.5 flex items-center gap-2">
          <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
            trend.isPositive
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
              : 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
          }`}>
            {trend.isPositive
              ? <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              : <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
            }
            {trend.val}
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{trend.label ?? 'vs mois dernier'}</span>
        </div>
      )}
    </div>
  );
};

export default KPICard;
