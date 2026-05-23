import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';

const STATUS_STYLES = {
  draft: {
    label: 'Brouillon',
    class: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
  },
  submitted: {
    label: 'Soumis',
    class: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
  },
  validated: {
    label: 'Validé',
    class: 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400',
  },
};

const WorkLogList = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const [dateFilter, setDateFilter] = useState('');

  // Fetch Project
  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: ['projectDetailLog', projectId],
    queryFn: async () => {
      const res = await api.get(`/api/projects/${projectId}`);
      return res.data.data || res.data;
    },
  });

  // Fetch Work Logs
  const { data: workLogs = [], isLoading: isLogsLoading, error } = useQuery({
    queryKey: ['projectWorkLogs', projectId],
    queryFn: async () => {
      const res = await api.get(`/api/projects/${projectId}/work-logs`);
      return res.data.data || res.data || [];
    },
  });

  if (isProjectLoading || isLogsLoading) {
    return <LoadingSpinner fullPage message="Chargement du journal des heures..." />;
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-3xl text-red-700 dark:text-red-400 font-medium text-sm">
        Impossible de charger les pointages : {error.message}
      </div>
    );
  }

  // Filter by date
  const filteredLogs = dateFilter
    ? workLogs.filter(log => log.workDate === dateFilter)
    : workLogs;

  // Total hours
  const totalHours = filteredLogs.reduce((sum, log) => sum + parseFloat(log.hoursWorked || 0), 0);

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Journal des pointages"
        breadcrumb={[
          { label: 'Chantiers', link: '/dashboard/projects' },
          { label: project?.title || 'Chantier', link: `/dashboard/projects/${projectId}` },
          { label: 'Pointages' },
        ]}
        actions={
          <button
            onClick={() => navigate(`/dashboard/projects/${projectId}/work-logs/new`)}
            className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wide shadow-md transition-colors cursor-pointer"
          >
            + Nouveau pointage
          </button>
        }
      />

      {/* Project badge */}
      {project && (
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 flex items-center justify-between flex-wrap gap-3">
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Chantier</span>
            <span className="text-sm font-black text-slate-800 dark:text-white">{project.title}</span>
          </div>
          <Link
            to={`/dashboard/projects/${projectId}`}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Retour au chantier
          </Link>
        </div>
      )}

      {/* Filters + Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide whitespace-nowrap">
            Filtrer par date :
          </label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              Effacer
            </button>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-center">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Total heures</span>
          <span className="text-2xl font-black text-blue-600 mt-1">
            {totalHours.toFixed(1)} h
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">{filteredLogs.length} pointage(s)</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs font-semibold text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950/40 text-slate-400 uppercase text-[9px] tracking-wider text-left">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Collaborateur</th>
                <th className="px-5 py-3">Tâche</th>
                <th className="px-5 py-3">Horaires</th>
                <th className="px-5 py-3">Observations</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3 text-right">Durée</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center text-slate-400 font-semibold">
                    {dateFilter
                      ? `Aucun pointage pour le ${new Date(dateFilter + 'T12:00:00').toLocaleDateString('fr-FR')}.`
                      : 'Aucun pointage d\'heures enregistré sur ce chantier.'}
                  </td>
                </tr>
              ) : (
                filteredLogs
                  .slice()
                  .sort((a, b) => new Date(b.workDate) - new Date(a.workDate))
                  .map(log => {
                    const statusStyle = STATUS_STYLES[log.status] || STATUS_STYLES.submitted;
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 font-semibold whitespace-nowrap">
                          {new Date(log.workDate + 'T12:00:00').toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-white">
                          {log.user?.name || 'Collaborateur'}
                        </td>
                        <td className="px-5 py-3.5 text-blue-500 font-bold">
                          {log.task?.title || (
                            <span className="text-slate-300 dark:text-slate-600">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 font-mono text-[10px] whitespace-nowrap">
                          {log.startTime && log.endTime
                            ? `${log.startTime} → ${log.endTime}`
                            : <span className="text-slate-300 dark:text-slate-600">—</span>}
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 max-w-xs">
                          <span className="truncate block max-w-[200px]" title={log.description}>
                            {log.description || <span className="text-slate-300 dark:text-slate-600">—</span>}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-block py-0.5 px-2.5 rounded-full text-[9px] font-black uppercase tracking-wide ${statusStyle.class}`}>
                            {statusStyle.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right font-black text-slate-800 dark:text-white whitespace-nowrap">
                          {parseFloat(log.hoursWorked).toFixed(1)} h
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
            {filteredLogs.length > 0 && (
              <tfoot className="bg-slate-50 dark:bg-slate-950/40">
                <tr>
                  <td colSpan="6" className="px-5 py-3 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Total — {filteredLogs.length} intervention(s)
                  </td>
                  <td className="px-5 py-3 text-right font-black text-blue-600 text-sm">
                    {totalHours.toFixed(1)} h
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex justify-between items-center pt-2">
        <Link
          to={`/dashboard/projects/${projectId}`}
          className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          Retour au chantier
        </Link>
        <button
          onClick={() => navigate(`/dashboard/projects/${projectId}/work-logs/new`)}
          className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wide shadow-md transition-colors cursor-pointer"
        >
          + Nouveau pointage
        </button>
      </div>
    </div>
  );
};

export default WorkLogList;
