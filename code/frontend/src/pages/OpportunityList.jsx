import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../components/common/NotificationToast';

const formatCurrency = (val) =>
  new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 })
    .format(val).replace('MAD', 'DH');

const OpportunityList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { data: responseData, isLoading, error } = useQuery({
    queryKey: ['opportunitiesList', page],
    queryFn: async () => {
      const res = await api.get(`/api/opportunities?page=${page}`);
      return res.data;
    },
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => { await api.delete(`/api/opportunities/${id}`); },
    onSuccess: () => {
      showToast('Opportunité supprimée.');
      queryClient.invalidateQueries(['opportunitiesList']);
      setIsDeleteOpen(false);
    },
    onError: (err) => showToast(`Erreur : ${err.message}`, 'error'),
  });

  if (isLoading) return <LoadingSpinner fullPage message="Chargement des opportunités..." />;
  if (error) return <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 font-medium">âš ï¸ Erreur : {error.message}</div>;

  const rawData = responseData?.data || [];
  const meta = responseData?.meta || { current_page: 1, last_page: 1, per_page: 10, total: rawData.length };

  const filtered = rawData.filter((o) => {
    const matchSearch = o.title.toLowerCase().includes(search.toLowerCase()) ||
      (o.account?.name && o.account.name.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter ? o.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  const columns = [
    {
      header: 'Opportunité',
      accessor: 'title',
      cell: (row) => (
        <div>
          <p className="font-bold text-slate-800 truncate">{row.title}</p>
          <p className="text-[10px] text-slate-400 font-semibold">{row.account?.name || '"”'}</p>
        </div>
      ),
    },
    {
      header: 'Budget estimé',
      accessor: 'estimatedBudget',
      cell: (row) => (
        <span className="text-xs font-black text-slate-800">{formatCurrency(row.estimatedBudget)}</span>
      ),
    },
    {
      header: 'Probabilité',
      accessor: 'probability',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <div className="w-16 bg-slate-100 rounded-full h-1.5">
            <div className="bg-[#FDF0EA]0 h-1.5 rounded-full" style={{ width: `${row.probability}%` }} />
          </div>
          <span className="text-xs font-bold text-slate-600">{row.probability}%</span>
        </div>
      ),
    },
    {
      header: 'Échéance',
      accessor: 'closeDate',
      cell: (row) => (
        <span className="text-xs text-slate-500">
          {row.closeDate ? new Date(row.closeDate).toLocaleDateString('fr-FR') : '"”'}
        </span>
      ),
    },
    {
      header: 'Statut',
      accessor: 'status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/opportunities/${row.id}/edit`); }}
            className="p-1.5 rounded-lg border border-slate-100 hover:bg-slate-50 text-slate-500 cursor-pointer transition-colors"
            title="Éditer"
          >âœï¸</button>
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); setIsDeleteOpen(true); }}
            className="p-1.5 rounded-lg border border-red-100 hover:bg-red-50 text-red-500 cursor-pointer transition-colors"
            title="Supprimer"
          >ðŸ—‘ï¸</button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Opportunités Commerciales"
        breadcrumb={[{ label: 'CRM' }, { label: 'Opportunités' }]}
        actions={
          <button
            onClick={() => navigate('/dashboard/opportunities/new')}
            className="py-2.5 px-5 rounded-xl bg-[#C85A2A] hover:bg-[#FDF0EA]0 text-white font-bold text-xs tracking-wide shadow-md shadow-blue-900/10 transition-all cursor-pointer flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Nouvelle Opportunité</span>
          </button>
        }
      />

      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Rechercher par titre ou client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-[#C85A2A] focus:border-transparent transition-all"
          />
        </div>
        <div className="w-full md:w-52">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#C85A2A] transition-all cursor-pointer"
          >
            <option value="">Tous les Statuts</option>
            <option value="Prospect">Prospect</option>
            <option value="Qualification">Qualification</option>
            <option value="Proposition">Proposition</option>
            <option value="Négociation">Négociation</option>
            <option value="Gagnée">Gagnée</option>
            <option value="Perdue">Perdue</option>
          </select>
        </div>
        {(search || statusFilter) && (
          <button onClick={() => { setSearch(''); setStatusFilter(''); }} className="text-xs font-bold text-slate-500 hover:text-[#C85A2A] cursor-pointer py-2.5 transition-colors">
            Réinitialiser
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        emptyTitle="Aucune opportunité trouvée"
        emptyDescription="Créez votre première opportunité commerciale."
        paginationMeta={{ currentPage: meta.current_page, lastPage: meta.last_page, perPage: meta.per_page, total: meta.total }}
        onPageChange={(p) => setPage(p)}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Supprimer l'opportunité ?"
        message={`Supprimer définitivement "${deleteTarget?.title}" ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
        loading={deleteMutation.isLoading}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  );
};

export default OpportunityList;
