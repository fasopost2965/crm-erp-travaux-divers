import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';

const STATUS_CONFIG = {
  draft:     { label: 'Brouillon',  cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  submitted: { label: 'Soumis',     cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  validated: { label: 'Validé',     cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

const StatusPill = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.submitted;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {cfg.label}
    </span>
  );
};

const WorkLogList = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: project } = useQuery({
    queryKey: ['projectDetailLogs', projectId],
    queryFn: async () => {
      const res = await api.get(`/api/projects/${projectId}`);
      return res.data.data || res.data;
    }
  });

  const { data: rawLogs = [], isLoading, error } = useQuery({
    queryKey: ['projectWorkLogs', projectId],
    queryFn: async () => {
      const res = await api.get(`/api/projects/${projectId}/work-logs`);
      return res.data.data || res.data || [];
    }
  });

  const logs = [...rawLogs]
    .filter(l => {
      if (dateFilter && !l.workDate?.startsWith(dateFilter)) return false;
      if (statusFilter && l.status !== statusFilter) return false;
      return true;
    })
    .sort((a, b) => new Date(b.workDate) - new Date(a.workDate));

  const totalHours = logs.reduce((s, l) => s + (l.hoursWorked || 0), 0);

  if (isLoading) return <LoadingSpinner fullPage message="Chargement des pointages..." />;

  if (error) {
    return (
      <div className="p-5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
        ⚠️ Erreur lors du chargement : {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Heures de chantier"
        breadcrumb={[
          { label: 'Chantiers', path: '/dashboard/projects' },
          { label: project?.title || '...', path: `/dashboard/projects/${projectId}` },
          { label: 'Pointages' }
        ]}
        actions={
          <button
            onClick={() => navigate(`/dashboard/projects/${projectId}/work-logs/new`)}
            className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouveau pointage
          </button>
        }
      />

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-semibold text-slate-500">Filtrer par mois</label>
          <input
            type="month"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="block w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1 space-y-1">
          <label className="text-xs font-semibold text-slate-500">Statut</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous</option>
            <option value="draft">Brouillon</option>
            <option value="submitted">Soumis</option>
            <option value="validated">Validé</option>
          </select>
        </div>
        {(dateFilter || statusFilter) && (
          <div className="flex items-end">
            <button
              onClick={() => { setDateFilter(''); setStatusFilter(''); }}
              className="py-2 px-4 text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      {logs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-700 mb-1">Aucun pointage trouvé</p>
          <p className="text-sm text-slate-400">Commencez par enregistrer les premières heures de ce chantier.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
                <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Intervenant</th>
                <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Créneaux</th>
                <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Heures</th>
                <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">GPS</th>
                <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Statut</th>
                <th className="px-5 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Observations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-5 py-4 text-sm font-semibold text-slate-800 whitespace-nowrap">
                    {log.workDate ? new Date(log.workDate).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                        {log.user?.name?.charAt(0) || '?'}
                      </div>
                      <span className="text-sm text-slate-700">{log.user?.name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                    {log.startTime && log.endTime
                      ? `${log.startTime.slice(0, 5)} → ${log.endTime.slice(0, 5)}`
                      : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-bold text-slate-900">{log.hoursWorked}h</span>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-400">
                    {log.locationLat
                      ? <span title={`${log.locationLat}, ${log.locationLng}`}>📍</span>
                      : <span className="text-slate-200">—</span>}
                  </td>
                  <td className="px-5 py-4">
                    <StatusPill status={log.status} />
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500 max-w-xs truncate">
                    {log.description || <span className="text-slate-300">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-200">
                <td colSpan={3} className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Total — {logs.length} pointage{logs.length > 1 ? 's' : ''}
                </td>
                <td className="px-5 py-3 text-sm font-black text-blue-700">
                  {totalHours.toFixed(1)}h
                </td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Back to project */}
      <button
        onClick={() => navigate(`/dashboard/projects/${projectId}`)}
        className="text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors"
      >
        ← Retour à la fiche projet
      </button>
    </div>
  );
};

export default WorkLogList;
