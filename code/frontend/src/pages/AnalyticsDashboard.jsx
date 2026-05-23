import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';

/* ─── Mini SVG Bar Chart ─── */
const BarChart = ({ data, valueKey, labelKey, color = '#3b82f6', height = 120 }) => {
  if (!data?.length) return null;
  const max = Math.max(...data.map(d => d[valueKey] || 0), 1);
  return (
    <div className="flex items-end gap-1 h-32" style={{ height }}>
      {data.map((d, i) => {
        const pct = ((d[valueKey] || 0) / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 group">
            <div
              className="w-full rounded-t-lg transition-all duration-500 relative"
              style={{ height: `${Math.max(pct, 2)}%`, backgroundColor: color, opacity: 0.85 }}
            >
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-lg whitespace-nowrap z-10">
                {(d[valueKey] || 0).toLocaleString('fr-MA')}
              </div>
            </div>
            <span className="text-[8px] text-slate-400 font-semibold truncate w-full text-center">{d[labelKey]}</span>
          </div>
        );
      })}
    </div>
  );
};

/* ─── Donut Chart SVG ─── */
const DONUT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const DonutChart = ({ data, labelKey, valueKey, size = 120 }) => {
  if (!data?.length) return null;
  const total = data.reduce((s, d) => s + (d[valueKey] || 0), 0) || 1;
  const r = 40, cx = size / 2, cy = size / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  const segments = data.map((d, i) => {
    const pct = (d[valueKey] || 0) / total;
    const dashArray = pct * circumference;
    const seg = { pct, dashArray, offset: offset * circumference, color: DONUT_COLORS[i % DONUT_COLORS.length], label: d[labelKey], value: d[valueKey] };
    offset += pct;
    return seg;
  });

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} className="shrink-0">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-100 dark:text-slate-800" />
        {segments.map((s, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="20"
            strokeDasharray={`${s.dashArray} ${circumference}`}
            strokeDashoffset={-s.offset}
            transform={`rotate(-90 ${cx} ${cy})`}
            className="transition-all duration-700"
          />
        ))}
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" className="fill-slate-800 dark:fill-white font-black text-sm" fontSize="14" fontWeight="900">
          {total}
        </text>
      </svg>
      <div className="space-y-2 flex-1 min-w-0">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 truncate">{s.label}</span>
            <span className="ml-auto text-[11px] font-black text-slate-800 dark:text-white">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── KPI Card ─── */
const KpiCard = ({ label, value, sub, icon, color = 'blue' }) => {
  const colors = {
    blue:   'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400',
    green:  'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400',
    amber:  'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400',
    purple: 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400',
    slate:  'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  };
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
};

const AnalyticsDashboard = () => {
  const { data: overview, isLoading: l1 } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: async () => (await api.get('/api/analytics/overview')).data,
  });

  const { data: revenue, isLoading: l2 } = useQuery({
    queryKey: ['analytics-revenue'],
    queryFn: async () => (await api.get('/api/analytics/revenue')).data,
  });

  const { data: projects, isLoading: l3 } = useQuery({
    queryKey: ['analytics-projects'],
    queryFn: async () => (await api.get('/api/analytics/projects-breakdown')).data,
  });

  const { data: team, isLoading: l4 } = useQuery({
    queryKey: ['analytics-team'],
    queryFn: async () => (await api.get('/api/analytics/team-hours')).data,
  });

  if (l1 || l2 || l3 || l4) return <LoadingSpinner fullPage message="Analyse des données..." />;

  const fmt = (v) => v != null ? parseFloat(v).toLocaleString('fr-MA') : '—';
  const fmtMAD = (v) => v != null ? `${parseFloat(v).toLocaleString('fr-MA')} MAD` : '—';

  return (
    <div className="space-y-8 font-sans">
      <PageHeader
        title="Analytique & Performance"
        breadcrumb={[{ label: 'Analytique & Reporting' }]}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="CA Total" value={fmtMAD(overview?.totalRevenue)} icon="💰" color="blue" />
        <KpiCard label="Encaissé" value={fmtMAD(overview?.totalCollected)} icon="✅" color="green" />
        <KpiCard label="Chantiers actifs" value={overview?.activeProjects ?? '—'} icon="🏗️" color="amber" />
        <KpiCard label="Personnel actif" value={overview?.totalEmployees ?? '—'} icon="👥" color="purple" />
        <KpiCard label="Heures ce mois" value={`${fmt(overview?.totalHoursMonth)} h`} icon="⏱️" color="slate" />
        <KpiCard label="Devis en attente" value={overview?.pendingQuotes ?? '—'} sub={fmtMAD(overview?.pendingQuotesAmount)} icon="📋" color="amber" />
        <KpiCard label="Taux de conversion" value={`${overview?.wonRate ?? '—'} %`} icon="🎯" color="green" />
      </div>

      {/* CA Mensuel (12 mois) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">Chiffre d'affaires mensuel</h3>
            <p className="text-[11px] text-slate-400 font-semibold">12 derniers mois — Facturé vs Encaissé</p>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-bold">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-blue-500 inline-block"></span>Facturé</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block"></span>Encaissé</span>
          </div>
        </div>
        <div className="flex gap-3 items-end h-40 pt-6">
          {(revenue || []).map((d, i) => {
            const maxVal = Math.max(...(revenue || []).map(r => Math.max(r.invoiced, r.collected)), 1);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div className="flex items-end gap-0.5 w-full justify-center" style={{ height: '100px' }}>
                  <div className="w-full rounded-t-md bg-blue-500/80 transition-all duration-500" style={{ height: `${(d.invoiced / maxVal) * 100}%` }} />
                  <div className="w-full rounded-t-md bg-emerald-500/80 transition-all duration-500" style={{ height: `${(d.collected / maxVal) * 100}%` }} />
                </div>
                <span className="text-[7px] text-slate-400 font-semibold leading-none">{d.month.split(' ')[0]}</span>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded-lg z-10 whitespace-nowrap text-center">
                  <div>Fact. {d.invoiced.toLocaleString('fr-MA')} MAD</div>
                  <div>Enc. {d.collected.toLocaleString('fr-MA')} MAD</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition Chantiers */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">Répartition des chantiers</h3>
            <p className="text-[11px] text-slate-400 font-semibold">Par statut</p>
          </div>
          <DonutChart
            data={projects?.statusBreakdown || []}
            labelKey="status"
            valueKey="count"
          />
        </div>

        {/* Heures équipe */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">Heures terrain</h3>
            <p className="text-[11px] text-slate-400 font-semibold">6 derniers mois · {fmt(team?.totalHours)} h total</p>
          </div>
          <BarChart data={team?.monthlyHours || []} valueKey="hours" labelKey="month" color="#8b5cf6" />
        </div>
      </div>

      {/* Top Chantiers */}
      {projects?.topProjects?.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">Top chantiers par budget</h3>
            <p className="text-[11px] text-slate-400 font-semibold">Chantiers en cours et terminés</p>
          </div>
          <div className="space-y-2">
            {projects.topProjects.map((p) => {
              const maxBudget = Math.max(...projects.topProjects.map(x => x.budget), 1);
              const pct = Math.round((p.budget / maxBudget) * 100);
              return (
                <div key={p.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-white truncate max-w-xs">{p.title}</span>
                    <span className="font-black text-slate-700 dark:text-slate-300 shrink-0 ml-2">
                      {parseFloat(p.budget).toLocaleString('fr-MA')} MAD
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-semibold">
                    <span>⏱ {fmt(p.hoursWorked)} h</span>
                    <span>📋 {p.tasksCount} tâches</span>
                    <span className="ml-auto">{p.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
