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
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 font-medium">
        âš ï¸ Erreur de chargement des factures : {error.message}.
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
        <span className="font-extrabold text-blue-650 text-xs">
          {row.invoiceNumber}
        </span>
      ),
    },
    {
      header: 'Client & Objet',
      accessor: 'title',
      cell: (row) => (
        <div className="min-w-0">
          <p className="font-bold text-slate-800 truncate">{row.title}</p>
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
        <span className="text-xs font-black text-slate-800">
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
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/invoices/${row.id}`); }}
            className="p-1.5 rounded-lg border border-slate-100 hover:bg-slate-50 text-slate-500 cursor-pointer transition-colors"
            title="Voir"
          >
            ðŸ‘ï¸
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/invoices/${row.id}/edit`); }}
            className="p-1.5 rounded-lg border border-slate-100 hover:bg-slate-50 text-slate-500 cursor-pointer transition-colors"
            title="Modifier"
          >
            âœï¸
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/invoices/${row.id}/payments/new`); }}
            disabled={row.status === 'Payée'}
            className="p-1.5 rounded-lg border border-slate-100 hover:bg-slate-50 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Enregistrer un règlement"
          >
            ðŸ’³
          </button>
          <button
            onClick={(e) => handleExportPdf(row, e)}
            className="p-1.5 rounded-lg border border-slate-100 hover:bg-slate-50 text-slate-500 cursor-pointer transition-colors"
            title="PDF"
          >
            ðŸ“
          </button>
          <button
            onClick={(e) => handleDeleteClick(row, e)}
            className="p-1.5 rounded-lg border border-slate-100 hover:bg-red-50 text-red-500 cursor-pointer transition-colors"
            title="Supprimer"
          >
            ðŸ—‘ï¸
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
            className="py-2.5 px-5 bg-[#C85A2A] hover:bg-[#A8481F] text-white font-bold text-xs tracking-wide rounded-xl shadow-md shadow-blue-900/10 hover:shadow-blue-500/15 transition-all cursor-pointer"
          >
            âž• Créer Facture
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-5 bg-white border border-slate-100 rounded-xl shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Rechercher client, numéro..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C85A2A] transition-all font-semibold"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs">ðŸ”</span>
        </div>

        <div className="flex w-full sm:w-auto items-center space-x-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C85A2A] cursor-pointer font-bold"
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
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden p-6">
        <DataTable
          columns={columns}
          data={filteredInvoices}
          onRowClick={(row) => navigate(`/dashboard/invoices/${row.id}`)}
        />

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="flex justify-between items-center pt-6 border-t border-slate-100 text-xs font-semibold text-slate-500">
            <span>Page {meta.current_page} sur {meta.last_page}</span>
            <div className="flex space-x-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                className="py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Précédent
              </button>
              <button
                disabled={page === meta.last_page}
                onClick={() => setPage(p => Math.min(p + 1, meta.last_page))}
                className="py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
