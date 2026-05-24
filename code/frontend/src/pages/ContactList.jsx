import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../components/common/NotificationToast';

const ContactList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { data: responseData, isLoading, error } = useQuery({
    queryKey: ['contactsList', page],
    queryFn: async () => {
      const res = await api.get(`/api/contacts?page=${page}`);
      return res.data;
    },
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => { await api.delete(`/api/contacts/${id}`); },
    onSuccess: () => {
      showToast('Contact supprimÃ©.');
      queryClient.invalidateQueries(['contactsList']);
      setIsDeleteOpen(false);
    },
    onError: (err) => showToast(`Erreur : ${err.message}`, 'error'),
  });

  if (isLoading) return <LoadingSpinner fullPage message="Chargement des contacts..." />;
  if (error) return <div className="p-6 bg-red-50 border border-red-200 rounded-3xl text-red-700 font-medium">âš ï¸ Erreur : {error.message}</div>;

  const rawData = responseData?.data || [];
  const meta = responseData?.meta || { current_page: 1, last_page: 1, per_page: 10, total: rawData.length };

  const filtered = rawData.filter((c) => {
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    return fullName.includes(search.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
      (c.account?.name && c.account.name.toLowerCase().includes(search.toLowerCase()));
  });

  const columns = [
    {
      header: 'Contact',
      accessor: 'firstName',
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-extrabold text-sm shrink-0">
            {row.firstName?.charAt(0)}{row.lastName?.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-slate-800">{row.firstName} {row.lastName}</p>
            <p className="text-[10px] text-slate-400 font-semibold">{row.position || 'Poste non renseignÃ©'}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Client',
      accessor: 'account',
      cell: (row) => (
        <span className="text-xs font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
          {row.account?.name || 'â€”'}
        </span>
      ),
    },
    {
      header: 'Email',
      accessor: 'email',
      cell: (row) => <span className="text-xs text-slate-500">{row.email || 'â€”'}</span>,
    },
    {
      header: 'TÃ©lÃ©phone',
      accessor: 'phone',
      cell: (row) => <span className="text-xs text-slate-500">{row.phone || 'â€”'}</span>,
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/contacts/${row.id}/edit`); }}
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
        title="Contacts"
        breadcrumb={[{ label: 'CRM' }, { label: 'Contacts' }]}
        actions={
          <button
            onClick={() => navigate('/dashboard/contacts/new')}
            className="py-2.5 px-5 rounded-xl bg-[#C85A2A] hover:bg-blue-500 text-white font-bold text-xs tracking-wide shadow-md shadow-blue-900/10 transition-all cursor-pointer flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Nouveau Contact</span>
          </button>
        }
      />

      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Rechercher par nom, email ou client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-[#C85A2A] focus:border-transparent transition-all"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        emptyTitle="Aucun contact trouvÃ©"
        emptyDescription="Commencez par crÃ©er un contact liÃ© Ã  un compte client."
        paginationMeta={{ currentPage: meta.current_page, lastPage: meta.last_page, perPage: meta.per_page, total: meta.total }}
        onPageChange={(p) => setPage(p)}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Supprimer le contact ?"
        message={`Supprimer dÃ©finitivement ${deleteTarget?.firstName} ${deleteTarget?.lastName} ?`}
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

export default ContactList;
