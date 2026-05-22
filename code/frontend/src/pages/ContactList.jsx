import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/NotificationToast';

const avatarColors = [
  'bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
  'bg-violet-100 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400',
  'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
  'bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
  'bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400',
];

const getAvatarColor = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];

const ContactList = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ account_id: '', first_name: '', last_name: '', email: '', phone: '', position: '' });
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: responseData, isLoading, error } = useQuery({
    queryKey: ['contactsList', page],
    queryFn: async () => {
      const res = await api.get(`/api/contacts?page=${page}`);
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
    mutationFn: (payload) => api.post('/api/contacts', payload),
    onSuccess: () => {
      showToast('Contact créé avec succès !');
      queryClient.invalidateQueries(['contactsList']);
      setShowModal(false);
      setForm({ account_id: '', first_name: '', last_name: '', email: '', phone: '', position: '' });
    },
    onError: (err) => showToast(err.response?.data?.message || err.message, 'error')
  });

  if (isLoading) return <LoadingSpinner fullPage message="Chargement des contacts..." />;
  if (error) return (
    <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-3xl text-red-700 dark:text-red-400 font-medium">
      ⚠️ Erreur lors du chargement : {error.message}
    </div>
  );

  const raw = responseData?.data || [];
  const meta = responseData?.meta || {};
  const accounts = accountsData?.data || [];

  const filtered = raw.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const fullName = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase();
    return fullName.includes(q) || c.email?.toLowerCase().includes(q) || c.account?.name?.toLowerCase().includes(q) || c.position?.toLowerCase().includes(q);
  });

  const columns = [
    {
      header: 'Contact',
      accessor: 'firstName',
      cell: (row) => {
        const initials = `${row.firstName?.charAt(0) || ''}${row.lastName?.charAt(0) || ''}`.toUpperCase();
        const fullName = `${row.firstName || ''} ${row.lastName || ''}`.trim();
        return (
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm shadow-inner shrink-0 ${getAvatarColor(row.firstName)}`}>
              {initials || '?'}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-850 dark:text-white truncate">{fullName || '—'}</p>
              <p className="text-[10px] text-slate-400 font-semibold truncate">{row.position || 'Poste non renseigné'}</p>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Société',
      accessor: 'account',
      cell: (row) => (
        <span className="inline-flex items-center text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-850 truncate max-w-[140px]">
          🏢 {row.account?.name || '—'}
        </span>
      )
    },
    {
      header: 'Email',
      accessor: 'email',
      cell: (row) => row.email
        ? <a href={`mailto:${row.email}`} className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline truncate block max-w-[180px]" onClick={(e) => e.stopPropagation()}>{row.email}</a>
        : <span className="text-xs text-slate-400">—</span>
    },
    {
      header: 'Téléphone',
      accessor: 'phone',
      cell: (row) => row.phone
        ? <a href={`tel:${row.phone}`} className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors" onClick={(e) => e.stopPropagation()}>{row.phone}</a>
        : <span className="text-xs text-slate-400">—</span>
    },
    {
      header: 'Ajouté le',
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
    if (!form.first_name.trim() || !form.last_name.trim() || !form.account_id) {
      showToast('Le prénom, le nom et la société sont obligatoires.', 'error');
      return;
    }
    createMutation.mutate({ ...form, account_id: parseInt(form.account_id) });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Répertoire des Contacts"
        breadcrumb={[{ label: 'CRM' }, { label: 'Contacts' }]}
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-550 text-white font-bold text-xs tracking-wide shadow-md shadow-blue-900/10 transition-all cursor-pointer flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouveau Contact
          </button>
        }
      />

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-slate-800 dark:text-white">{meta.total || raw.length}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Contacts total</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{[...new Set(raw.map(c => c.accountId).filter(Boolean))].length}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Sociétés représentées</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-center col-span-2 sm:col-span-1">
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{raw.filter(c => c.email).length}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Avec email renseigné</p>
        </div>
      </div>

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
            placeholder="Rechercher par nom, email, société ou poste..."
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
        emptyTitle="Aucun contact trouvé"
        emptyDescription="Aucun contact ne correspond à votre recherche."
        paginationMeta={meta && { currentPage: meta.current_page || 1, lastPage: meta.last_page || 1, perPage: meta.per_page || 10, total: meta.total || 0 }}
        onPageChange={setPage}
      />

      {/* Create Contact Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900 dark:text-white">Nouveau Contact</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer transition-colors">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Société <span className="text-red-500">*</span></label>
                <select required value={form.account_id} onChange={(e) => setForm({ ...form, account_id: e.target.value })} className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                  <option value="">-- Sélectionner une société --</option>
                  {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Prénom <span className="text-red-500">*</span></label>
                  <input type="text" required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} placeholder="Mohammed" className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Nom <span className="text-red-500">*</span></label>
                  <input type="text" required value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} placeholder="Alaoui" className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Poste / Fonction</label>
                <input type="text" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="Ex: Directeur Technique, Responsable Achats..." className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="w-1/3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold transition-colors cursor-pointer">Annuler</button>
                <button type="submit" disabled={createMutation.isLoading} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-550 text-white font-bold shadow-md shadow-blue-900/10 transition-colors cursor-pointer disabled:opacity-55">
                  {createMutation.isLoading ? 'Enregistrement...' : 'Créer le Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactList;
