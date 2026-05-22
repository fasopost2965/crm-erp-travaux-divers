import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import KPICard from '../components/common/KPICard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const DirectorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/director');
        setStats(response.data.data || response.data);
      } catch (err) {
        console.error("Erreur de récupération du dashboard", err);
        setError("Impossible de charger les données du tableau de bord.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 })
      .format(amount || 0)
      .replace('MAD', 'DH');
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Chargement du tableau de bord Directeur..." />;
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-3xl text-red-700 dark:text-red-400 font-medium">
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête de la page */}
      <PageHeader 
        title={`Bonjour, ${user?.name || 'Directeur'} 👋`}
        breadcrumb={[{ label: "Directeur" }, { label: "Performance Globale" }]}
        actions={
          <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 text-blue-700 dark:text-blue-400 py-1.5 px-3 rounded-full text-xs font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span>Base de production locale</span>
          </div>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Chiffre d'Affaires Mensuel"
          value={formatCurrency(stats?.turnoverMonth)}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          trend={{ val: "Mois en cours (HT)", isPositive: true }}
        />
        <KPICard
          title="Marge Estimée"
          value={formatCurrency(stats?.estimatedMargin)}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
        <KPICard
          title="Projets Actifs"
          value={stats?.activeProjectsCount || 0}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
        <KPICard
          title="Factures Impayées"
          value={formatCurrency(stats?.unpaidInvoices?.amount)}
          icon={
            <svg className="w-6 h-6 text-rose-650" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
      </div>

      {/* Main Grid for charts / metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Devis Performance Table card */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-6 flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Performances Commerciales (Devis)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-50 dark:bg-slate-950/20 rounded-2xl p-4 border border-slate-100 dark:border-slate-850">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-bold block mb-1">Taux de Conversion</span>
              <span className="text-3xl font-black text-slate-800 dark:text-white">
                {stats?.quotesWon?.conversionRate?.toFixed(1)}%
              </span>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${stats?.quotesWon?.conversionRate}%` }}></div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/20 rounded-2xl p-4 border border-slate-100 dark:border-slate-850">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-bold block mb-1">Devis Envoyés</span>
              <span className="text-xl font-bold text-slate-800 dark:text-white block">
                {stats?.quotesSent?.count || 0} devis
              </span>
              <span className="text-sm font-semibold text-slate-500">
                {formatCurrency(stats?.quotesSent?.amount)}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/20 rounded-2xl p-4 border border-slate-100 dark:border-slate-850">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-bold block mb-1">Devis Acceptés</span>
              <span className="text-xl font-bold text-slate-800 dark:text-white block">
                {stats?.quotesWon?.count || 0} devis
              </span>
              <span className="text-sm font-semibold text-emerald-650 dark:text-emerald-450">
                {formatCurrency(stats?.quotesWon?.amount)}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 flex items-start space-x-3 text-xs text-blue-800 dark:text-blue-400">
            <svg className="w-5 h-5 shrink-0 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <span className="font-bold">Info utile : </span>
              Le taux de conversion représente le ratio entre les devis acceptés/gagnés et le volume total des devis émis et négociés.
            </div>
          </div>
        </div>

        {/* Financial Evolution list */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-6 flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span>Évolution Mensuelle</span>
          </h3>

          <div className="space-y-6">
            {stats?.monthlyEvolution?.map((monthData, idx) => (
              <div key={idx} className="flex flex-col space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-500">{monthData.month}</span>
                  <span className="font-bold text-slate-800 dark:text-white">{formatCurrency(monthData.turnover)}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-550"
                    style={{
                      width: `${Math.max(10, Math.min(100, (monthData.turnover / (stats.turnoverMonth || 1)) * 100))}%`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DirectorDashboard;
