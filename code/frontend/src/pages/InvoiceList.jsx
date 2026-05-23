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

const InvoiceList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Fetch Invoices
  const { data: responseData, isLoading, error } = useQuery({
    queryKey: ['invoicesList', page],
    queryFn: async () => {
      const res = await api.get(`/api/invoices?page=${page}`);
      return res.data;
    },
    keepPreviousData: true,
  });

  // Delete Invoice Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/api/invoices/${id}`);
    },
    onSuccess: () => {
      showToast('Facture supprimée avec succès.');
      queryClient.invalidateQueries(['invoicesList']);
      setIsDeleteOpen(false);
    },
    onError: (err) => {
      showToast(`Erreur de suppression : ${err.message}`, 'error');
    },
  });

  if (isLoading) {
    return <LoadingSpinner fullPage message="Chargement du registre comptable..." />;
  }

  if (error) {
    return (
      <div className="p-5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-400 text-sm font-medium flex items-start gap-3">
        <svg className="w-5 h-5 shrink-0 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        Erreur de chargement des factures : {error.message}.
      </div>
    );
  }

  const rawInvoices = responseData?.data || [];
  const meta = responseData?.meta || { current_page: 1, last_page: 1, per_page: 10, total: rawInvoices.length };

  // Local Filter logic
  const filteredInvoices = rawInvoices.filter((inv) => {
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      (inv.account?.name && inv.account.name.toLowerCase().includes(search.toLowerCase())) ||
      (inv.title && inv.title.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter ? inv.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 })
      .format(val || 0)
      .replace('MAD', 'DH');
  };

  const handleDeleteClick = (inv, e) => {
    e.stopPropagation();
    setDeleteTarget(inv);
    setIsDeleteOpen(true);
  };

  const handleExportPdf = (inv, e) => {
    e.stopPropagation();
    showToast(`Téléchargement de la facture ${inv.invoiceNumber}...`);
    setTimeout(() => {
      showToast(`Facture ${inv.invoiceNumber} enregistrée.`);
    }, 1200);
  };

  const columns = [
    {
      header: 'Numéro',
      accessor: 'invoiceNumber',
      cell: (row) => (
        <span className="font-extrabold text-blue-650 dark:text-blue-400 text-xs">
          {row.invoiceNumber}
        </span>
      ),
    },
    {
      header: 'Client & Objet',
      accessor: 'title',
      cell: (row) => (
        <div className="min-w-0">
          <p className="font-bold text-slate-800 dark:text-white truncate">{row.title}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase">{row.account?.name || 'Client inconnu'}</p>
        </div>
      ),
    },
    {
      header: 'Échéance',
      accessor: 'dueDate',
      cell: (row) => {
        const isOverdue = row.status !== 'Payée' && row.dueDate && new Date(row.dueDate) < new Date();
        return (
          <span className={`text-xs font-semibold ${isOverdue ? 'text-rose-500 font-bold' : 'text-slate-500'}`}>
            {row.dueDate ? new Date(row.dueDate).toLocaleDateString('fr-FR') : 'Immédiate'}
            {isOverdue && ' (En retard)'}
          </span>
        );
      },
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
      header: 'Paiement / Statut',
      accessor: 'status',
      cell: (row) => {
        const remaining = row.amountRemaining ?? row.totalTtc;
        const paid = row.amountPaid ?? 0;
        return (
          <div className="space-y-1">
            <StatusBadge status={row.status} />
            {paid > 0 && row.status !== 'Payée' && (
              <p className="text-[9px] text-slate-400 font-bold">Payé : {formatCurrency(paid)}</p>
            )}
          </div>
        );
      },
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/invoices/${row.id}`); }} className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors" title="Voir">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/invoices/${row.id}/edit`); }} className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors" title="Modifier">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/invoices/${row.id}/payments/new`); }} disabled={row.status === 'Payée'} className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-400 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors" title="Règlement">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </button>
          <button onClick={(e) => handleExportPdf(row, e)} className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-400 hover:text-blue-600 cursor-pointer transition-colors" title="PDF">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          </button>
          <button onClick={(e) => handleDeleteClick(row, e)} className="p-1.5 rounded-lg border border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-400 hover:text-red-600 cursor-pointer transition-colors" title="Supprimer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Factures & Trésorerie"
        breadcrumb={[
          { label: 'Finances' },
          { label: 'Registre des Factures' }
        ]}
        actions={
          <button
            onClick={() => navigate('/dashboard/invoices/new')}
            className="py-2.5 px-5 bg-blue-600 hover:bg-blue-550 text-white font-bold text-xs tracking-wide rounded-xl shadow-md shadow-blue-900/10 hover:shadow-blue-500/15 transition-all cursor-pointer"
          >
            + Créer Facture
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Rechercher client, numéro..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs">🔍</span>
        </div>

        <div className="flex w-full sm:w-auto items-center space-x-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-xs text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-bold"
          >
            <option value="">Tous les statuts</option>
            <option value="Brouillon">Brouillon</option>
            <option value="Envoyée">Envoyée</option>
            <option value="Payée">Payée</option>
            <option value="Partiellement Payée">Partiellement Payée</option>
            <option value="Impayée">Impayée</option>
            <option value="En retard">En retard</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden p-6">
        <DataTable
          columns={columns}
          data={filteredInvoices}
          onRowClick={(row) => navigate(`/dashboard/invoices/${row.id}`)}
        />

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="flex justify-between items-center pt-6 border-t border-slate-100 dark:border-slate-850 text-xs font-semibold text-slate-500">
            <span>Page {meta.current_page} sur {meta.last_page}</span>
            <div className="flex space-x-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Précédent
              </button>
              <button
                disabled={page === meta.last_page}
                onClick={() => setPage(p => Math.min(p + 1, meta.last_page))}
                className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm deletion */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Supprimer la facture ?"
        message={`Attention, vous allez supprimer définitivement la facture ${deleteTarget?.invoiceNumber}. Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
        loading={deleteMutation.isLoading}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  );
};

export default InvoiceList;
