import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import { useToast } from '../components/common/NotificationToast';

const LEAD_STATUSES = ['Nouveau', 'Qualifié', 'Disqualifié', 'Converti'];
const LEAD_SOURCES = ['Référence', 'Site web', 'Appel entrant', 'Salon', 'Autre'];

const sourceLabel = (s) => {
  switch (s) {
    case 'Référence': return '🤝';
    case 'Site web': return '🌐';
    case 'Appel entrant': return '📞';
    case 'Salon': return '🏢';
    default: return '💡';
  }
};

const LeadList = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', account_name: '', contact_name: '', email: '', phone: '', source: 'Autre', status: 'Nouveau', notes: '' });
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: responseData, isLoading, error } = useQuery({
    queryKey: ['leadsList', page],
    queryFn: async () => {
      const res = await api.get(`/api/leads?page=${page}`);
      return res.data;
    },
    keepPreviousData: true
  });

  const createMutation = useMutation({
    mutationFn: (payload) => api.post('/api/leads', payload),
    onSuccess: () => {
      showToast('Lead créé avec succès !');
      queryClient.invalidateQueries(['leadsList']);
      setShowModal(false);
      setForm({ title: '', account_name: '', contact_name: '', email: '', phone: '', source: 'Autre', status: 'Nouveau', notes: '' });
    },
    onError: (err) => showToast(err.response?.data?.message || err.message, 'error')
  });

  if (isLoading) return <LoadingSpinner fullPage message="Chargement des leads..." />;
  if (error) return (
    <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-3xl text-red-700 dark:text-red-400 font-medium">
      ⚠️ Erreur lors du chargement : {error.message}
    </div>
  );

  const raw = responseData?.data || [];
  const meta = responseData?.meta || {};

  const filtered = raw.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch = !q || l.title?.toLowerCase().includes(q) || l.accountName?.toLowerCase().includes(q) || l.contactName?.toLowerCase().includes(q);
    const matchStatus = !statusFilter || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusCounts = LEAD_STATUSES.reduce((acc, s) => {
    acc[s] = raw.filter(l => l.status === s).length;
    return acc;
  }, {});

  const columns = [
    {
      header: 'Prospect / Opportunité',
      accessor: 'title',
      cell: (row) => (
        <div className="min-w-0">
          <p className="font-bold text-slate-850 dark:text-white truncate">{row.title}</p>
          <p className="text-[10px] text-slate-400 font-semibold truncate">{row.accountName || '—'}</p>
        </div>
      )
    },
    {
      header: 'Contact',
      accessor: 'contactName',
      cell: (row) => (
        <div className="min-w-0">
          <p className="font-semibold text-slate-700 dark:text-slate-300 text-xs">{row.contactName || '—'}</p>
          <p className="text-[10px] text-slate-400">{row.phone || row.email || '—'}</p>
        </div>
      )
    },
    {
      header: 'Source',
      accessor: 'source',
      cell: (row) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-850">
          {sourceLabel(row.source)} {row.source || 'Autre'}
        </span>
      )
    },
    {
      header: 'Statut',
      accessor: 'status',
      cell: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      cell: (row) => (
        <span className="text-xs text-slate-400">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString('fr-FR') : '—'}
        </span>
      )
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.account_name.trim()) {
      showToast('Le titre et le nom de la société sont obligatoires.', 'error');
      return;
    }
    createMutation.mutate(form);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads & Prospection"
        breadcrumb={[{ label: 'CRM' }, { label: 'Leads' }]}
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-550 text-white font-bold text-xs tracking-wide shadow-md shadow-blue-900/10 transition-all cursor-pointer flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouveau Lead
          </button>
        }
      />

      {/* Status summary pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${!statusFilter ? 'bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900 dark:border-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400'}`}
        >
          Tous ({raw.length})
        </button>
        {LEAD_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${statusFilter === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400'}`}
          >
            {s} ({statusCounts[s] || 0})
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Rechercher par prospect, société ou contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-800 dark:text-white placeholder-slate-450 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        {search && (
          <button onClick={() => setSearch('')} className="text-xs font-bold text-slate-500 hover:text-blue-500 cursor-pointer transition-colors">
            Réinitialiser
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        emptyTitle="Aucun lead trouvé"
        emptyDescription="Aucun lead ne correspond à votre recherche ou filtre de statut."
        paginationMeta={meta && { currentPage: meta.current_page || 1, lastPage: meta.last_page || 1, perPage: meta.per_page || 10, total: meta.total || 0 }}
        onPageChange={setPage}
      />

      {/* Create Lead Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900 dark:text-white">Nouveau Lead</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer transition-colors">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Objet / Titre <span className="text-red-500">*</span></label>
                <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Construction villa Casablanca" className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Société <span className="text-red-500">*</span></label>
                  <input type="text" required value={form.account_name} onChange={(e) => setForm({ ...form, account_name: e.target.value })} placeholder="Nom de la société" className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Interlocuteur</label>
                  <input type="text" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} placeholder="Nom du contact" className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Téléphone</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="06 00 00 00 00" className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="contact@société.ma" className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Source</label>
                  <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                    {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Statut initial</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                    {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Notes</label>
                <textarea rows="2" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Informations complémentaires sur ce lead..." className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="w-1/3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold transition-colors cursor-pointer">Annuler</button>
                <button type="submit" disabled={createMutation.isLoading} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-550 text-white font-bold shadow-md shadow-blue-900/10 transition-colors cursor-pointer disabled:opacity-55">
                  {createMutation.isLoading ? 'Enregistrement...' : 'Créer le Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadList;
