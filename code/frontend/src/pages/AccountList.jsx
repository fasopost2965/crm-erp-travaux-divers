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
      <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-3xl text-red-700 dark:text-red-400 font-medium flex items-start gap-3">
        <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <span>Erreur lors du chargement des clients : {error.message}.</span>
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
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-850">
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {row.city}
        </span>
      )
    },
    {
      header: 'Contacts',
      accessor: 'contacts',
      cell: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {row.contacts?.length || 0} contact(s)
        </span>
      )
    },
    {
      header: 'Opportunités',
      accessor: 'opportunities',
      cell: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-650 dark:text-blue-400">
          <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          {row.opportunities?.length || 0} opportunité(s)
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

      {/* Filter Bar — inline, no card wrapper */}
      <div className="flex flex-col sm:flex-row gap-3">

        {/* Full-text search */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Rechercher par nom de société ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* City Filter */}
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="w-full sm:w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
        >
          <option value="">Toutes les Villes</option>
          {cities.map((city, idx) => (
            <option key={idx} value={city}>{city}</option>
          ))}
        </select>

        {/* Clear Filters Button */}
        {(search || cityFilter) && (
          <button
            onClick={() => { setSearch(''); setCityFilter(''); }}
            className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-blue-500 cursor-pointer self-center py-2.5 transition-colors whitespace-nowrap"
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
