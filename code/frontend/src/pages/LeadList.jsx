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

const LeadList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { data: responseData, isLoading, error } = useQuery({
    queryKey: ['leadsList', page],
    queryFn: async () => {
      const res = await api.get(`/api/leads?page=${page}`);
      return res.data;
    },
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => { await api.delete(`/api/leads/${id}`); },
    onSuccess: () => {
      showToast('Lead supprimÃ©.');
      queryClient.invalidateQueries(['leadsList']);
      setIsDeleteOpen(false);
    },
    onError: (err) => showToast(`Erreur : ${err.message}`, 'error'),
  });

  if (isLoading) return <LoadingSpinner fullPage message="Chargement des leads..." />;
  if (error) return <div className="p-6 bg-red-50 border border-red-200 rounded-3xl text-red-700 font-medium">âš ï¸ Erreur : {error.message}</div>;

  const rawData = responseData?.data || [];
  const meta = responseData?.meta || { current_page: 1, last_page: 1, per_page: 10, total: rawData.length };

  const filtered = rawData.filter((l) => {
    const matchSearch = l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.accountName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter ? l.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  const columns = [
    {
      header: 'Lead',
      accessor: 'title',
      cell: (row) => (
        <div>
          <p className="font-bold text-slate-800 truncate">{row.title}</p>
          <p className="text-[10px] text-slate-400 font-semibold">{row.accountName}</p>
        </div>
      ),
    },
    {
      header: 'Contact',
      accessor: 'contactName',
      cell: (row) => <span className="text-xs text-slate-600">{row.contactName || 'â€”'}</span>,
    },
    {
      header: 'Source',
      accessor: 'source',
      cell: (row) => (
        <span className="text-xs font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
          {row.source || 'â€”'}
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
            onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/leads/${row.id}/edit`); }}
            className="p-1.5 rounded-lg border border-slate-100 hover:bg-slate-50 text-slate-500 cursor-pointer transition-colors"
            title="Ã‰diter"
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
        title="Leads Commerciaux"
        breadcrumb={[{ label: 'CRM' }, { label: 'Leads' }]}
        actions={
          <button
            onClick={() => navigate('/dashboard/leads/new')}
            className="py-2.5 px-5 rounded-xl bg-[#C85A2A] hover:bg-blue-500 text-white font-bold text-xs tracking-wide shadow-md shadow-blue-900/10 transition-all cursor-pointer flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Nouveau Lead</span>
          </button>
        }
      />

      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Rechercher par titre ou entreprise..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-[#C85A2A] focus:border-transparent transition-all"
          />
        </div>
        <div className="w-full md:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#C85A2A] transition-all cursor-pointer"
          >
            <option value="">Tous les Statuts</option>
            <option value="Nouveau">Nouveau</option>
            <option value="ContactÃ©">ContactÃ©</option>
            <option value="QualifiÃ©">QualifiÃ©</option>
            <option value="Perdu">Perdu</option>
          </select>
        </div>
        {(search || statusFilter) && (
          <button onClick={() => { setSearch(''); setStatusFilter(''); }} className="text-xs font-bold text-slate-500 hover:text-blue-500 cursor-pointer py-2.5 transition-colors">
            RÃ©initialiser
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        emptyTitle="Aucun lead trouvÃ©"
        emptyDescription="CrÃ©ez votre premier lead commercial."
        paginationMeta={{ currentPage: meta.current_page, lastPage: meta.last_page, perPage: meta.per_page, total: meta.total }}
        onPageChange={(p) => setPage(p)}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Supprimer le lead ?"
        message={`Supprimer dÃ©finitivement le lead "${deleteTarget?.title}" ?`}
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

export default LeadList;
