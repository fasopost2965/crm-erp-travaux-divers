import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';

const STATUS_COLORS = {
  'Actif':    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Inactif':  'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  'En congé': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Suspendu': 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

const CONTRACT_COLORS = {
  'CDI':       'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'CDD':       'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'Interim':   'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'Freelance': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  'Stage':     'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
};

const EmployeeList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['employees', search, statusFilter, page],
    queryFn: async () => {
      const params = { page, per_page: 15 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/api/employees', { params });
      return res.data;
    },
    keepPreviousData: true,
  });

  const employees = data?.data || [];
  const meta = data?.meta || {};

  if (isLoading && page === 1) return <LoadingSpinner fullPage message="Chargement du registre du personnel..." />;

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Registre du Personnel"
        breadcrumb={[{ label: 'RH & Personnel' }]}
        actions={
          <Link
            to="/dashboard/rh/new"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-900/10 transition-colors"
          >
            + Nouvel employé
          </Link>
        }
      />

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Rechercher par nom, poste, CIN..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="">Tous les statuts</option>
          {['Actif', 'Inactif', 'En congé', 'Suspendu'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm font-medium">
          Erreur : {error.message}
        </div>
      )}

      {/* KPI rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Actifs', value: meta.total || 0, color: 'text-emerald-600' },
          { label: 'Affichés', value: employees.length, color: 'text-blue-600' },
          { label: 'Page', value: `${meta.current_page || 1} / ${meta.last_page || 1}`, color: 'text-slate-700 dark:text-slate-300' },
          { label: 'Total', value: meta.total || 0, color: 'text-slate-700 dark:text-slate-300' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-center shadow-sm">
            <span className={`block text-xl font-black ${color}`}>{value}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{label}</span>
          </div>
        ))}
      </div>

      {/* Liste */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        {employees.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">👥</div>
            <p className="text-sm font-bold text-slate-400">Aucun employé trouvé</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {employees.map((emp) => (
              <button
                key={emp.id}
                onClick={() => navigate(`/dashboard/rh/${emp.id}`)}
                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors text-left group"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-black text-sm flex items-center justify-center shrink-0">
                  {emp.firstName?.charAt(0)}{emp.lastName?.charAt(0)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-900 dark:text-white truncate">{emp.fullName}</p>
                  <p className="text-[11px] text-slate-400 font-semibold truncate">
                    {emp.position}{emp.department ? ` · ${emp.department}` : ''}
                  </p>
                </div>

                {/* Badges */}
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${CONTRACT_COLORS[emp.contractType] || 'bg-slate-100 text-slate-500'}`}>
                    {emp.contractType}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${STATUS_COLORS[emp.status] || 'bg-slate-100 text-slate-500'}`}>
                    {emp.status}
                  </span>
                </div>

                {/* Salaire */}
                <div className="hidden md:block text-right shrink-0">
                  {emp.salary ? (
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                      {parseFloat(emp.salary).toLocaleString('fr-MA')} MAD
                    </span>
                  ) : (
                    <span className="text-xs text-slate-300 dark:text-slate-600">—</span>
                  )}
                </div>

                <svg className="w-4 h-4 text-slate-300 group-hover:text-slate-500 dark:text-slate-700 dark:group-hover:text-slate-500 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {meta.last_page > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
          >
            Précédent
          </button>
          <span className="text-xs font-semibold text-slate-400">
            Page {meta.current_page} / {meta.last_page}
          </span>
          <button
            onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
            disabled={page === meta.last_page}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
