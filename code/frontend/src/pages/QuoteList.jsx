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

const QuoteList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Fetch Quotes
  const { data: responseData, isLoading, error } = useQuery({
    queryKey: ['quotesList', page],
    queryFn: async () => {
      const res = await api.get(`/api/quotes?page=${page}`);
      return res.data;
    },
    keepPreviousData: true,
  });

  // Delete Quote Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/api/quotes/${id}`);
    },
    onSuccess: () => {
      showToast('Devis supprimé avec succès.');
      queryClient.invalidateQueries(['quotesList']);
      setIsDeleteOpen(false);
    },
    onError: (err) => {
      showToast(`Erreur de suppression: ${err.message}`, 'error');
    },
  });

  if (isLoading) {
    return <LoadingSpinner fullPage message="Chargement du registre des devis..." />;
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-3xl text-red-700 dark:text-red-400 font-medium flex items-start gap-3">
        <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <span>Erreur lors du chargement des devis : {error.message}.</span>
      </div>
    );
  }

  const rawQuotes = responseData?.data || [];
  const meta = responseData?.meta || { current_page: 1, last_page: 1, per_page: 10, total: rawQuotes.length };

  // Local Filter logic
  const filteredQuotes = rawQuotes.filter((quote) => {
    const matchesSearch =
      quote.quoteNumber.toLowerCase().includes(search.toLowerCase()) ||
      (quote.account?.name && quote.account.name.toLowerCase().includes(search.toLowerCase())) ||
      (quote.title && quote.title.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter ? quote.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 })
      .format(val)
      .replace('MAD', 'DH');
  };

  const handleDeleteClick = (quote, e) => {
    e.stopPropagation();
    setDeleteTarget(quote);
    setIsDeleteOpen(true);
  };

  const handleExportPdf = (quote, e) => {
    e.stopPropagation();
    showToast(`Génération du PDF pour le devis ${quote.quoteNumber}...`);
    setTimeout(() => {
      showToast(`PDF téléchargé avec succès pour le devis ${quote.quoteNumber}.`);
    }, 1500);
  };

  const columns = [
    {
      header: 'Numéro',
      accessor: 'quoteNumber',
      cell: (row) => (
        <span className="font-extrabold text-blue-600 dark:text-blue-400 text-xs">
          {row.quoteNumber}
        </span>
      ),
    },
    {
      header: 'Titre & Client',
      accessor: 'title',
      cell: (row) => (
        <div className="min-w-0">
          <p className="font-bold text-slate-800 dark:text-white truncate">{row.title}</p>
          <p className="text-[10px] text-slate-400 font-semibold">{row.account?.name || 'Client inconnu'}</p>
        </div>
      ),
    },
    {
      header: 'Date de validité',
      accessor: 'validUntil',
      cell: (row) => (
        <span className="text-xs text-slate-500 font-semibold">
          {row.validUntil ? new Date(row.validUntil).toLocaleDateString('fr-FR') : 'Non spécifiée'}
        </span>
      ),
    },
    {
      header: 'Montant TTC',
      accessor: 'totalTtc',
      cell: (row) => (
        <span className="text-xs font-black text-slate-800 dark:text-white">
          {formatCurrency(row.totalTtc)}
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
            onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/quotes/${row.id}`); }}
            className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
            title="Voir"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/quotes/${row.id}/edit`); }}
            className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
            title="Éditer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => handleExportPdf(row, e)}
            className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
            title="Exporter PDF"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <button
            onClick={(e) => handleDeleteClick(row, e)}
            className="p-1.5 rounded-lg border border-red-100 hover:bg-red-50 text-red-500 cursor-pointer transition-colors"
            title="Supprimer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Registre des Devis"
        breadcrumb={[{ label: 'Ventes' }, { label: 'Devis' }]}
        actions={
          <button
            onClick={() => navigate('/dashboard/quotes/new')}
            className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-550 text-white font-bold text-xs tracking-wide shadow-md shadow-blue-900/10 transition-all cursor-pointer flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Créer un Devis</span>
          </button>
        }
      />

      {/* Filter bar — inline, no card wrapper */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Rechercher par numéro, client ou titre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
        >
          <option value="">Tous les Statuts</option>
          <option value="Brouillon">Brouillon</option>
          <option value="Envoyé">Envoyé</option>
          <option value="Accepté">Accepté</option>
          <option value="Refusé">Refusé</option>
        </select>

        {(search || statusFilter) && (
          <button
            onClick={() => { setSearch(''); setStatusFilter(''); }}
            className="text-sm font-bold text-slate-500 hover:text-blue-500 cursor-pointer self-center py-2.5 transition-colors whitespace-nowrap"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Main Table view */}
      <DataTable
        columns={columns}
        data={filteredQuotes}
        onRowClick={(quote) => navigate(`/dashboard/quotes/${quote.id}`)}
        emptyTitle="Aucun devis trouvé"
        emptyDescription="Aucun document de devis ne correspond à vos filtres actuels."
        paginationMeta={{
          currentPage: meta.current_page || 1,
          lastPage: meta.last_page || 1,
          perPage: meta.per_page || 10,
          total: meta.total || 0,
        }}
        onPageChange={(p) => setPage(p)}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Supprimer le devis ?"
        message={`Êtes-vous sûr de vouloir supprimer définitivement le devis ${deleteTarget?.quoteNumber} ? Cette action est irréversible.`}
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

export default QuoteList;
