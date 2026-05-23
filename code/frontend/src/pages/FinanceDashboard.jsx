import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import KPICard from '../components/common/KPICard';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';

const FinanceDashboard = () => {
  // Récupérer les statistiques du Dashboard Finance via React Query depuis l'API Laravel
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['financeDashboard'],
    queryFn: async () => {
      const response = await api.get('/dashboard/finance');
      return response.data.data || response.data;
    }
  });

  if (isLoading) {
    return <LoadingSpinner fullPage message="Chargement des données comptables..." />;
  }

  if (error) {
    return (
      <div className="p-5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-400 text-sm font-medium flex items-start gap-3">
        <svg className="w-5 h-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        Erreur lors de la récupération des données : {error.message}. Veuillez vérifier votre connexion.
      </div>
    );
  }

  // Formatage des montants monétaires en Dirhams marocains (DH)
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 })
      .format(val)
      .replace('MAD', 'DH');
  };

  const stats = dashboardData || {};

  return (
    <div className="space-y-6">

      {/* En-tête de la page */}
      <PageHeader
        title="Trésorerie & Recouvrement"
        breadcrumb={[{ label: "Finance" }, { label: "Tableau de bord" }]}
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Facturation Émise (Ce Mois)"
          value={formatCurrency(stats.invoicesIssued?.amount || 0)}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <KPICard
          title="Encaissé Ce Mois"
          value={formatCurrency(stats.paymentsReceivedAmount || 0)}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KPICard
          title="Créances Impayées (En Retard)"
          value={formatCurrency(stats.unpaidInvoices?.totalAmount || 0)}
          icon={
            <svg className="w-6 h-6 text-rose-650" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
        <KPICard
          title="Taux de Recouvrement"
          value={`${Math.round(stats.collectionRate || 0)}%`}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          }
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column - Impayés Table (2/3 width) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center space-x-2">
              <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Suivi des Créances Impayées</span>
            </h2>
            <span className="text-xs font-bold text-rose-600 px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50">
              {stats.unpaidInvoices?.list?.length || 0} Facture(s) en souffrance
            </span>
          </div>

          {!stats.unpaidInvoices?.list || stats.unpaidInvoices.list.length === 0 ? (
            <div className="text-center py-12 text-slate-450 dark:text-slate-500 font-medium text-sm flex-1 flex flex-col items-center justify-center">
              🎉 Félicitations, aucun impayé n'est à signaler !
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-4 py-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">N° Facture</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Libellé</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Montant TTC</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Échéance</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Statut</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stats.unpaidInvoices.list.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all text-xs font-medium">
                      <td className="px-4 py-3.5 text-slate-800 dark:text-white font-bold">{invoice.invoiceNumber}</td>
                      <td className="px-4 py-3.5 text-slate-500 truncate max-w-[150px]">{invoice.title}</td>
                      <td className="px-4 py-3.5 text-slate-850 dark:text-slate-200 font-bold">{formatCurrency(invoice.totalTtc)}</td>
                      <td className="px-4 py-3.5 text-slate-400">
                        {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={invoice.status} />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button className="py-1 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-550 text-white font-bold text-[10px] cursor-pointer transition-all shadow-inner">
                          Relancer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column - Upcoming Due Dates (1/3 width) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-6 flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Échéances Futures (7 prochains jours)</span>
          </h2>

          <div className="mb-6 p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 flex items-center justify-between">
            <span className="text-xs text-slate-450 dark:text-slate-400 font-semibold">Total à percevoir</span>
            <span className="text-sm font-black text-blue-600 dark:text-blue-400">
              {formatCurrency(stats.upcomingDueDates?.totalAmount || 0)}
            </span>
          </div>

          {!stats.upcomingDueDates?.list || stats.upcomingDueDates.list.length === 0 ? (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500 font-medium text-xs">
              Aucune facture n'arrive à échéance cette semaine.
            </div>
          ) : (
            <div className="space-y-4">
              {stats.upcomingDueDates.list.map((invoice) => (
                <div key={invoice.id} className="p-4 border border-slate-50 dark:border-slate-850 rounded-2xl flex justify-between items-center hover:border-slate-100 dark:hover:border-slate-850 transition-all duration-300">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400">{invoice.invoiceNumber}</span>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[150px]">
                      {invoice.title}
                    </h4>
                    <p className="text-[9px] text-slate-400">
                      Échéance le : {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-slate-700 dark:text-slate-350">
                      {formatCurrency(invoice.totalTtc)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default FinanceDashboard;
