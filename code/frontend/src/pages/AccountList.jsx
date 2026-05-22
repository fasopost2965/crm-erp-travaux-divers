import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AccountList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  // Récupérer la liste des comptes clients via React Query depuis l'API Laravel paginée
  const { data: responseData, isLoading, error } = useQuery({
    queryKey: ['accountsList', page],
    queryFn: async () => {
      // Laravel preloads relations in AccountController@index
      const response = await api.get(`/api/accounts?page=${page}`);
      return response.data;
    },
    keepPreviousData: true
  });

  if (isLoading) {
    return <LoadingSpinner fullPage message="Chargement du répertoire client..." />;
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-3xl text-red-700 dark:text-red-400 font-medium">
        ⚠️ Erreur lors du chargement des clients : {error.message}.
      </div>
    );
  }

  const rawAccounts = responseData?.data || [];
  const meta = responseData?.meta || { current_page: 1, last_page: 1, per_page: 10, total: rawAccounts.length };

  // Filtrage local pour la recherche réactive
  const filteredAccounts = rawAccounts.filter((acc) => {
    const matchesSearch = acc.name.toLowerCase().includes(search.toLowerCase()) || 
                          (acc.email && acc.email.toLowerCase().includes(search.toLowerCase()));
    const matchesCity = cityFilter ? acc.city === cityFilter : true;
    return matchesSearch && matchesCity;
  });

  // Extraire les villes disponibles pour le filtre
  const cities = [...new Set(rawAccounts.map(acc => acc.city).filter(Boolean))];

  // Configuration des colonnes du tableau interactif
  const columns = [
    {
      header: 'Entreprise Client',
      accessor: 'name',
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-extrabold text-sm shadow-inner shrink-0">
            {row.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-850 dark:text-white truncate">{row.name}</p>
            <p className="text-[10px] text-slate-400 font-semibold">{row.email || 'Pas d\'email renseigné'}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Localisation',
      accessor: 'city',
      cell: (row) => (
        <span className="inline-flex items-center text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-850">
          📍 {row.city}
        </span>
      )
    },
    {
      header: 'Contacts',
      accessor: 'contacts',
      cell: (row) => (
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
          👥 {row.contacts?.length || 0} contact(s)
        </span>
      )
    },
    {
      header: 'Opportunités',
      accessor: 'opportunities',
      cell: (row) => (
        <span className="text-xs font-bold text-blue-650 dark:text-blue-400">
          💼 {row.opportunities?.length || 0} opportunité(s)
        </span>
      )
    },
    {
      header: 'Date de Création',
      accessor: 'createdAt',
      cell: (row) => (
        <span className="text-xs text-slate-400">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString('fr-FR') : 'Non spécifiée'}
        </span>
      )
    }
  ];

  const handleRowClick = (account) => {
    navigate(`/dashboard/accounts/${account.id}`);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <PageHeader 
        title="Répertoire Client (CRM)" 
        breadcrumb={[{ label: "CRM" }, { label: "Clients" }]}
        actions={
          <button className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-550 text-white font-bold text-xs tracking-wide shadow-md shadow-blue-900/10 hover:shadow-blue-500/15 transition-all cursor-pointer flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Créer un Client</span>
          </button>
        }
      />

      {/* Filter Bar Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row md:items-center gap-4">
        
        {/* Full-text search */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="h-4.5 w-4.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Rechercher par nom de société ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-800 dark:text-white placeholder-slate-450 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* City Filter */}
        <div className="w-full md:w-56">
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-700 dark:text-slate-350 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
          >
            <option value="">Toutes les Villes</option>
            {cities.map((city, idx) => (
              <option key={idx} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        {(search || cityFilter) && (
          <button 
            onClick={() => { setSearch(''); setCityFilter(''); }}
            className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-blue-500 cursor-pointer self-start md:self-auto py-2.5 transition-colors"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Responsive interactive Client Table */}
      <DataTable
        columns={columns}
        data={filteredAccounts}
        onRowClick={handleRowClick}
        emptyTitle="Aucun client trouvé"
        emptyDescription="Aucun compte client ne correspond à votre recherche ou filtre."
        paginationMeta={
          meta && {
            currentPage: meta.current_page || 1,
            lastPage: meta.last_page || 1,
            perPage: meta.per_page || 10,
            total: meta.total || 0
          }
        }
        onPageChange={handlePageChange}
      />

    </div>
  );
};

export default AccountList;
