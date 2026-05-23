import React from 'react';

const KPICard = ({
  title,
  value,
  icon,
  trend = null,
  loading = false,
  suffix = ""
}) => {
  if (loading) {
    return (
      <div className="p-6 bg-white border border-slate-200 rounded-2xl animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-3.5 bg-slate-200 rounded w-24"></div>
          <div className="w-10 h-10 rounded-xl bg-slate-200"></div>
        </div>
        <div className="h-8 bg-slate-200 rounded w-32 mb-2"></div>
        <div className="h-3 bg-slate-200 rounded w-16"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
          {icon}
        </div>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black text-slate-900 tracking-tight">{value}</span>
        {suffix && <span className="text-sm font-semibold text-slate-500">{suffix}</span>}
      </div>

      {trend && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          <span className={`inline-flex items-center font-bold px-2 py-0.5 rounded-md ${
            trend.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          }`}>
            {trend.isPositive ? '↑' : '↓'} {trend.isPositive ? '+' : ''}{trend.val}
          </span>
          <span className="text-slate-400">vs mois dernier</span>
        </div>
      )}
    </div>
  );
};

export default KPICard;
