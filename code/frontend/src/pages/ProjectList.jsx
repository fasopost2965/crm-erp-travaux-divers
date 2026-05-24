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

const ProjectList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { data: responseData, isLoading, error } = useQuery({
    queryKey: ['projectsList', page],
    queryFn: async () => {
      const res = await api.get(`/api/projects?page=${page}`);
      return res.data;
    },
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/api/projects/${id}`);
    },
    onSuccess: () => {
      showToast('Projet supprimé avec succès.');
      queryClient.invalidateQueries(['projectsList']);
      setIsDeleteOpen(false);
    },
    onError: (err) => {
      showToast(`Erreur de suppression: ${err.message}`, 'error');
    },
  });

  if (isLoading) return <LoadingSpinner fullPage message="Chargement des projets..." />;

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 font-medium text-sm">
        âš ï¸ Erreur lors du chargement des chantiers : {error.message}
      </div>
    );
  }

  const rawProjects = responseData?.data || [];
  const meta = responseData?.meta || { current_page: 1, last_page: 1, per_page: 10, total: rawProjects.length };

  const filteredProjects = rawProjects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(search.toLowerCase()) ||
      (project.account?.name && project.account.name.toLowerCase().includes(search.toLowerCase())) ||
      (project.city && project.city.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter ? project.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (val) =>
    new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 })
      .format(val || 0).replace('MAD', 'DH');

  const handleDeleteClick = (project, e) => {
    e.stopPropagation();
    setDeleteTarget(project);
    setIsDeleteOpen(true);
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      cell: (row) => (
        <span className="font-bold text-[#C85A2A] text-xs">#{row.id}</span>
      ),
    },
    {
      header: 'Projet',
      accessor: 'title',
      cell: (row) => (
        <div>
          <p className="font-semibold text-slate-900 text-sm">{row.title}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            ðŸ“ {row.city || 'Non spécifié'}{row.address ? ` "” ${row.address}` : ''}
          </p>
        </div>
      ),
    },
    {
      header: 'Client',
      accessor: 'account.name',
      cell: (row) => (
        <span className="text-sm text-slate-700 font-medium">
          {row.account?.name || <span className="text-slate-400">"”</span>}
        </span>
      ),
    },
    {
      header: 'Chef de chantier',
      accessor: 'manager.name',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
            {row.manager?.name ? row.manager.name.charAt(0) : '?'}
          </div>
          <span className="text-sm text-slate-700">{row.manager?.name || <span className="text-slate-400">Non assigné</span>}</span>
        </div>
      ),
    },
    {
      header: 'Dates',
      accessor: 'startDate',
      cell: (row) => (
        <div className="text-xs text-slate-500 space-y-0.5">
          <p>Début : {row.startDate ? new Date(row.startDate).toLocaleDateString('fr-FR') : '"”'}</p>
          <p className="text-rose-500">Fin : {row.endDatePlanned ? new Date(row.endDatePlanned).toLocaleDateString('fr-FR') : '"”'}</p>
        </div>
      ),
    },
    {
      header: 'Budget HT',
      accessor: 'budget',
      cell: (row) => (
        <span className="text-sm font-bold text-slate-800">{formatCurrency(row.budget)}</span>
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
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/projects/${row.id}`); }}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors"
            title="Voir"
          >
            ðŸ‘ï¸
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/projects/${row.id}/edit`); }}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors"
            title="Éditer"
          >
            âœï¸
          </button>
          <button
            onClick={(e) => handleDeleteClick(row, e)}
            className="p-1.5 rounded-lg border border-red-100 hover:bg-red-50 text-red-500 transition-colors"
            title="Supprimer"
          >
            ðŸ—‘ï¸
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chantiers & Projets"
        breadcrumb={[{ label: 'Chantiers' }, { label: 'Registre' }]}
        actions={
          <button
            onClick={() => navigate('/dashboard/projects/new')}
            className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-[#C85A2A] hover:bg-[#A8481F] text-white font-semibold text-sm shadow-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouveau projet
          </button>
        }
      />

      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher par titre, client ou ville..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A2A] focus:border-transparent transition-all"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full md:w-48 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A2A] focus:border-transparent transition-all"
        >
          <option value="">Tous les statuts</option>
          <option value="Planifié">Planifié</option>
          <option value="En cours">En cours</option>
          <option value="Suspendu">Suspendu</option>
          <option value="Terminé">Terminé</option>
        </select>

        {(search || statusFilter) && (
          <button
            onClick={() => { setSearch(''); setStatusFilter(''); }}
            className="text-sm font-medium text-slate-500 hover:text-[#C85A2A] transition-colors whitespace-nowrap"
          >
            Réinitialiser
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={filteredProjects}
        onRowClick={(project) => navigate(`/dashboard/projects/${project.id}`)}
        emptyTitle="Aucun projet trouvé"
        emptyDescription="Aucun chantier ne correspond Ã  ce filtre. Créez un nouveau projet pour commencer."
        paginationMeta={{
          currentPage: meta.current_page || 1,
          lastPage: meta.last_page || 1,
          perPage: meta.per_page || 10,
          total: meta.total || 0,
        }}
        onPageChange={(p) => setPage(p)}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Supprimer le projet ?"
        message={`ÃŠtes-vous sûr de vouloir supprimer définitivement le chantier "${deleteTarget?.title}" ? Cette action supprimera également les heures pointées et tâches associées.`}
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

export default ProjectList;
