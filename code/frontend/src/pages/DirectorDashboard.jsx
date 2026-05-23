import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
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
        console.error('Erreur de récupération du dashboard', err);
        setError('Impossible de charger les données du tableau de bord.');
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
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-3xl text-rose-700 font-medium">
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Bonjour, ${user?.name || 'Directeur'} 👋`}
        breadcrumb={[{ label: 'Directeur' }, { label: 'Performance Globale' }]}
        actions={
          <div className="inline-flex items-center space-x-2 bg-slate-100 border border-slate-200 text-slate-700 py-1.5 px-3 rounded-full text-xs font-semibold">
            <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-primary)' }}></span>
            <span>Base de production locale</span>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-6">
        <div className="space-y-6">
          <div className="rounded-[2rem] p-8 text-white" style={{ backgroundColor: 'var(--color-primary)' }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-200/80 font-semibold mb-3">CA Mensuel</p>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight">{formatCurrency(stats?.turnoverMonth)}</h2>
                <p className="mt-4 max-w-xl text-sm text-slate-200/80 leading-7">
                  Performances du mois en cours. Suivez le chiffre d'affaire principal et assurez-vous que les factures et projets avancent dans les temps.
                </p>
              </div>
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 ring-1 ring-white/20">
                <span className="text-2xl font-black">DH</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-slate-700">Marge estimée</p>
                <span className="text-xs uppercase tracking-[0.22em] text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">Stable</span>
              </div>
              <p className="text-2xl font-black text-slate-900">{formatCurrency(stats?.estimatedMargin)}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-slate-700">Projets actifs</p>
                <span className="text-xs uppercase tracking-[0.22em] text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">En cours</span>
              </div>
              <p className="text-2xl font-black text-slate-900">{stats?.activeProjectsCount || 0}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-slate-700">Factures impayées</p>
                <span className="text-xs uppercase tracking-[0.22em] text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">Alerte</span>
              </div>
              <p className="text-2xl font-black text-slate-900">{formatCurrency(stats?.unpaidInvoices?.amount)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div>
                <p className="text-sm font-semibold text-slate-900">Rappels essentiels</p>
                <p className="text-sm text-slate-500 mt-1">Priorisez les actions suivantes pour garder le cap.</p>
              </div>
              <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: 'rgba(232,97,26,0.1)', color: 'var(--color-accent)' }}>Prioritaire</span>
            </div>
            <div className="space-y-4 text-sm text-slate-600">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-800">Vérifier les factures en attente</p>
                <p className="mt-1">{stats?.unpaidInvoices?.count || 0} factures non payées à relancer.</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-800">Suivre les projets actifs</p>
                <p className="mt-1">{stats?.activeProjectsCount || 0} projets en cours de livraison.</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-sm font-semibold text-slate-900">Evolution CA</p>
                <p className="text-sm text-slate-500">Derniers mois</p>
              </div>
              <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Montant</span>
            </div>
            <div className="space-y-4">
              {stats?.monthlyEvolution?.map((item, index) => {
                const percent = Math.min(100, Math.max(8, Math.round((item.turnover / (stats.turnoverMonth || 1)) * 100)));
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span>{item.month}</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(item.turnover)}</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: 'var(--color-primary)' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm font-semibold text-slate-900">Projets récents</p>
              <p className="text-sm text-slate-500">Aperçu rapide des activités clés.</p>
            </div>
            <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Depuis 30 jours</span>
          </div>
          <ul className="space-y-4">
            <li className="rounded-3xl border border-slate-100 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Projets actifs</p>
                  <p className="text-sm text-slate-500">Chantiers en cours</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700 text-xs font-semibold">{stats?.activeProjectsCount || 0}</span>
              </div>
            </li>
            <li className="rounded-3xl border border-slate-100 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Devis envoyés</p>
                  <p className="text-sm text-slate-500">Opportunités suivies</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 text-xs font-semibold">{stats?.quotesSent?.count || 0}</span>
              </div>
            </li>
            <li className="rounded-3xl border border-slate-100 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Factures en attente</p>
                  <p className="text-sm text-slate-500">Relance prioritaire</p>
                </div>
                <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-700 text-xs font-semibold">{stats?.unpaidInvoices?.count || 0}</span>
              </div>
            </li>
          </ul>
        </div>

        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-900 mb-4">Synthèse rapide</p>
          <div className="grid gap-4">
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Flux de trésorerie</p>
              <p className="mt-2 text-sm text-slate-500">{formatCurrency(stats?.turnoverMonth)} de CA ce mois.</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Marge estimée</p>
              <p className="mt-2 text-sm text-slate-500">{formatCurrency(stats?.estimatedMargin)} prévue sur les devis acceptés.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectorDashboard;
