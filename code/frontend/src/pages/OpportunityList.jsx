import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import { useToast } from '../components/common/NotificationToast';

const OPP_STATUSES = ['Qualification', 'Proposition', 'Négociation', 'Gagnée', 'Perdu'];

const statusColor = (s) => {
  switch (s) {
    case 'Gagnée': return 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400';
    case 'Perdu': return 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400';
    case 'Négociation': return 'bg-violet-50 dark:bg-violet-950/20 border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400';
    case 'Proposition': return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400';
    default: return 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400';
  }
};

const formatCurrency = (val) =>
  new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 })
    .format(val || 0)
    .replace('MAD', 'DH');

const OpportunityList = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', account_id: '', estimated_budget: '', probability: '50', status: 'Qualification', close_date: '' });
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: responseData, isLoading, error } = useQuery({
    queryKey: ['opportunitiesList', page],
    queryFn: async () => {
      const res = await api.get(`/api/opportunities?page=${page}`);
      return res.data;
    },
    keepPreviousData: true
  });

  const { data: accountsData } = useQuery({
    queryKey: ['accountsAll'],
    queryFn: async () => {
      const res = await api.get('/api/accounts?per_page=200');
      return res.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: (payload) => api.post('/api/opportunities', payload),
    onSuccess: () => {
      showToast('Opportunité créée avec succès !');
      queryClient.invalidateQueries(['opportunitiesList']);
      setShowModal(false);
      setForm({ title: '', account_id: '', estimated_budget: '', probability: '50', status: 'Qualification', close_date: '' });
    },
    onError: (err) => showToast(err.response?.data?.message || err.message, 'error')
  });

  if (isLoading) return <LoadingSpinner fullPage message="Chargement des opportunités..." />;
  if (error) return (
    <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-3xl text-red-700 dark:text-red-400 font-medium">
      ⚠️ Erreur lors du chargement : {error.message}
    </div>
  );

  const raw = responseData?.data || [];
  const meta = responseData?.meta || {};
  const accounts = accountsData?.data || [];

  const filtered = raw.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch = !q || o.title?.toLowerCase().includes(q) || o.account?.name?.toLowerCase().includes(q);
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalBudget = filtered.filter(o => o.status !== 'Perdu').reduce((s, o) => s + (o.estimatedBudget || 0), 0);
  const statusCounts = OPP_STATUSES.reduce((acc, s) => { acc[s] = raw.filter(o => o.status === s).length; return acc; }, {});

  const columns = [
    {
      header: 'Affaire',
      accessor: 'title',
      cell: (row) => (
        <div className="min-w-0">
          <p className="font-bold text-slate-850 dark:text-white truncate">{row.title}</p>
          <p className="text-[10px] text-slate-400 font-semibold truncate">{row.account?.name || '—'}</p>
        </div>
      )
    },
    {
      header: 'Budget estimé',
      accessor: 'estimatedBudget',
      cell: (row) => (
        <span className="font-extrabold text-sm text-slate-800 dark:text-white">
          {row.estimatedBudget ? formatCurrency(row.estimatedBudget) : <span className="text-slate-400 font-semibold text-xs">Non défini</span>}
        </span>
      )
    },
    {
      header: 'Probabilité',
      accessor: 'probability',
      cell: (row) => (
        <div className="flex items-center gap-2 min-w-[80px]">
          <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${row.probability || 0}%`, background: row.probability >= 70 ? '#10b981' : row.probability >= 40 ? '#3b82f6' : '#f59e0b' }}
            />
          </div>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 shrink-0">{row.probability || 0}%</span>
        </div>
      )
    },
    {
      header: 'Échéance',
      accessor: 'closeDate',
      cell: (row) => {
        if (!row.closeDate) return <span className="text-xs text-slate-400">—</span>;
        const d = new Date(row.closeDate);
        const isLate = d < new Date() && row.status !== 'Gagnée' && row.status !== 'Perdu';
        return (
          <span className={`text-xs font-semibold ${isLate ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'}`}>
            {isLate && '⚠️ '}{d.toLocaleDateString('fr-FR')}
          </span>
        );
      }
    },
    {
      header: 'Statut',
      accessor: 'status',
      cell: (row) => <StatusBadge status={row.status} />
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.account_id) {
      showToast('Le titre et le compte client sont obligatoires.', 'error');
      return;
    }
    createMutation.mutate({
      ...form,
      estimated_budget: form.estimated_budget ? parseFloat(form.estimated_budget) : null,
      probability: parseInt(form.probability) || null,
      account_id: parseInt(form.account_id),
      close_date: form.close_date || null
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Opportunités Commerciales"
        breadcrumb={[{ label: 'CRM' }, { label: 'Opportunités' }]}
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-550 text-white font-bold text-xs tracking-wide shadow-md shadow-blue-900/10 transition-all cursor-pointer flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouvelle Opportunité
          </button>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {OPP_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${statusFilter === s ? statusColor(s) + ' ring-2 ring-current/30' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300'}`}
          >
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s}</p>
            <p className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{statusCounts[s] || 0}</p>
          </button>
        ))}
      </div>

      {/* Budget en pipeline */}
      {totalBudget > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-4 flex items-center justify-between text-white">
          <div>
            <p className="text-xs font-bold opacity-80 uppercase tracking-wider">Budget pipeline actif</p>
            <p className="text-xl font-black">{formatCurrency(totalBudget)}</p>
          </div>
          <div className="text-3xl opacity-70">💼</div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Rechercher par affaire ou client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-800 dark:text-white placeholder-slate-450 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        {(search || statusFilter) && (
          <button onClick={() => { setSearch(''); setStatusFilter(''); }} className="text-xs font-bold text-slate-500 hover:text-blue-500 cursor-pointer transition-colors">
            Réinitialiser
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        emptyTitle="Aucune opportunité trouvée"
        emptyDescription="Aucune opportunité ne correspond à votre recherche ou filtre."
        paginationMeta={meta && { currentPage: meta.current_page || 1, lastPage: meta.last_page || 1, perPage: meta.per_page || 10, total: meta.total || 0 }}
        onPageChange={setPage}
      />

      {/* Create Opportunity Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900 dark:text-white">Nouvelle Opportunité</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer transition-colors">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Titre de l'affaire <span className="text-red-500">*</span></label>
                <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Construction immeuble R+4 Rabat" className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Client <span className="text-red-500">*</span></label>
                <select required value={form.account_id} onChange={(e) => setForm({ ...form, account_id: e.target.value })} className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                  <option value="">-- Sélectionner un client --</option>
                  {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Budget estimé (DH)</label>
                  <input type="number" min="0" step="1000" value={form.estimated_budget} onChange={(e) => setForm({ ...form, estimated_budget: e.target.value })} placeholder="Ex: 500000" className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Probabilité (%)</label>
                  <input type="number" min="0" max="100" value={form.probability} onChange={(e) => setForm({ ...form, probability: e.target.value })} className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Statut</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                    {OPP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Date de clôture</label>
                  <input type="date" value={form.close_date} onChange={(e) => setForm({ ...form, close_date: e.target.value })} className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="w-1/3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold transition-colors cursor-pointer">Annuler</button>
                <button type="submit" disabled={createMutation.isLoading} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-550 text-white font-bold shadow-md shadow-blue-900/10 transition-colors cursor-pointer disabled:opacity-55">
                  {createMutation.isLoading ? 'Enregistrement...' : 'Créer l\'Opportunité'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunityList;
