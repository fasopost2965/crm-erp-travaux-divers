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

  // Fetch Projects List
  const { data: responseData, isLoading, error } = useQuery({
    queryKey: ['projectsList', page],
    queryFn: async () => {
      const res = await api.get(`/api/projects?page=${page}`);
      return res.data;
    },
    keepPreviousData: true,
  });

  // Delete Project Mutation
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

  if (isLoading) {
    return <LoadingSpinner fullPage message="Chargement du registre des projets..." />;
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-3xl text-red-700 dark:text-red-400 font-medium">
        ⚠️ Erreur lors du chargement des chantiers : {error.message}.
      </div>
    );
  }

  const rawProjects = responseData?.data || [];
  const meta = responseData?.meta || { current_page: 1, last_page: 1, per_page: 10, total: rawProjects.length };

  // Filter projects reactively
  const filteredProjects = rawProjects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(search.toLowerCase()) ||
      (project.account?.name && project.account.name.toLowerCase().includes(search.toLowerCase())) ||
      (project.city && project.city.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter ? project.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 })
      .format(val || 0)
      .replace('MAD', 'DH');
  };

  const handleDeleteClick = (project, e) => {
    e.stopPropagation();
    setDeleteTarget(project);
    setIsDeleteOpen(true);
  };

  const columns = [
    {
      header: 'Numéro / ID',
      accessor: 'id',
      cell: (row) => (
        <span className="font-extrabold text-blue-600 dark:text-blue-400 text-xs">
          #{row.id}
        </span>
      ),
    },
    {
      header: 'Titre & Localisation',
      accessor: 'title',
      cell: (row) => (
        <div className="min-w-0">
          <p className="font-bold text-slate-800 dark:text-white truncate">{row.title}</p>
          <p className="text-[10px] text-slate-400 font-semibold">
            📍 {row.city || 'Non spécifié'} {row.address && `— ${row.address}`}
          </p>
        </div>
      ),
    },
    {
      header: 'Client',
      accessor: 'account.name',
      cell: (row) => (
        <span className="text-xs text-slate-655 dark:text-slate-350 font-bold">
          {row.account?.name || 'Client inconnu'}
        </span>
      ),
    },
    {
      header: 'Conducteur / Chef',
      accessor: 'manager.name',
      cell: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 font-bold flex items-center space-x-1.5">
          <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] uppercase font-black text-slate-500">
            {row.manager?.name ? row.manager.name.charAt(0) : 'C'}
          </span>
          <span>{row.manager?.name || 'Non assigné'}</span>
        </span>
      ),
    },
    {
      header: 'Dates',
      accessor: 'startDate',
      cell: (row) => (
        <div className="text-[10px] text-slate-500 font-bold space-y-0.5">
          <p>Début : {row.startDate ? new Date(row.startDate).toLocaleDateString('fr-FR') : '-'}</p>
          <p className="text-rose-500">Fin planifiée : {row.endDatePlanned ? new Date(row.endDatePlanned).toLocaleDateString('fr-FR') : '-'}</p>
        </div>
      ),
    },
    {
      header: 'Budget HT',
      accessor: 'budget',
      cell: (row) => (
        <span className="text-xs font-black text-slate-800 dark:text-white">
          {formatCurrency(row.budget)}
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
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/projects/${row.id}`); }} className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors" title="Voir">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/projects/${row.id}/edit`); }} className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors" title="Modifier">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
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
        title="Gestion des Projets & Chantiers"
        breadcrumb={[{ label: 'Chantiers' }, { label: 'Registre' }]}
        actions={
          <button
            onClick={() => navigate('/dashboard/projects/new')}
            className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-550 text-white font-bold text-xs tracking-wide shadow-md shadow-blue-900/10 transition-all cursor-pointer flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Créer un Projet</span>
          </button>
        }
      />

      {/* Filter bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="h-4.5 w-4.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Rechercher par titre, client ou ville..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-800 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="w-full md:w-52">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-700 dark:text-slate-350 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
          >
            <option value="">Tous les Statuts</option>
            <option value="Planifié">Planifié</option>
            <option value="En cours">En cours</option>
            <option value="Suspendu">Suspendu</option>
            <option value="Terminé">Terminé</option>
          </select>
        </div>

        {(search || statusFilter) && (
          <button
            onClick={() => { setSearch(''); setStatusFilter(''); }}
            className="text-xs font-bold text-slate-500 hover:text-blue-500 cursor-pointer py-2.5 transition-colors"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Main Table view */}
      <DataTable
        columns={columns}
        data={filteredProjects}
        onRowClick={(project) => navigate(`/dashboard/projects/${project.id}`)}
        emptyTitle="Aucun projet de chantier trouvé"
        emptyDescription="Aucun chantier n'a été planifié sous ce nom ou filtre actuellement."
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
        title="Supprimer le projet de chantier ?"
        message={`Êtes-vous sûr de vouloir supprimer définitivement le chantier ${deleteTarget?.title} ? Cette action supprimera également les heures pointées, tâches associées et pièces jointes.`}
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
